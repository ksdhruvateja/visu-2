import { Request, Response } from 'express';
import path from 'path';
import { readEmploymentData } from '../services/csvParser';
import { JobListing, DashboardStats } from '@/types';

interface FilteredData {
  jobs: JobListing[];
  hasMore: boolean;
  locations: string[];
  stats: DashboardStats;
}

// Cache for CSV data to avoid reading from disk on every request
let cachedData: JobListing[] | null = null;
let cachedLocations: string[] | null = null;

export const getEmploymentData = async (req: Request, res: Response) => {
  try {
    // Get query parameters
    const { 
      timeRange = 'Last 12 Months', 
      experienceLevel = 'All Levels', 
      location = 'All Locations',
      page = '1',
      limit = '20'
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    // Read CSV data if not cached
    if (!cachedData) {
      const csvPath = path.resolve(process.cwd(), 'attached_assets/employment_dataset.csv');
      cachedData = await readEmploymentData(csvPath);
      
      // Extract unique locations for filter dropdown
      cachedLocations = [...new Set(cachedData.map(job => job.location))];
    }

    // Apply filters
    const filteredData = filterData(
      cachedData, 
      timeRange as string, 
      experienceLevel as string, 
      location as string
    );

    // Paginate results
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedJobs = filteredData.jobs.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredData.jobs.length;

    // Return data
    res.json({
      jobs: paginatedJobs,
      hasMore,
      locations: cachedLocations,
      stats: filteredData.stats
    });
  } catch (error) {
    console.error('Error fetching employment data:', error);
    res.status(500).json({ 
      message: 'Failed to fetch employment data',
      error: (error as Error).message
    });
  }
};

// Filter data based on user selections
const filterData = (
  data: JobListing[],
  timeRange: string,
  experienceLevel: string,
  location: string
): FilteredData => {
  // Apply time range filter
  let timeFilteredData = [...data];
  const now = new Date();
  
  if (timeRange !== 'All Time') {
    const monthsToSubtract = timeRange === 'Last 3 Months' ? 3 : 
                             timeRange === 'Last 6 Months' ? 6 : 12;
    
    const cutoffDate = new Date(now);
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToSubtract);
    
    timeFilteredData = timeFilteredData.filter(job => {
      const postedDate = new Date(job.postedDate);
      return postedDate >= cutoffDate;
    });
  }

  // Apply experience level filter
  let experienceFilteredData = timeFilteredData;
  if (experienceLevel !== 'All Levels') {
    experienceFilteredData = experienceFilteredData.filter(
      job => job.experienceLevel === experienceLevel
    );
  }

  // Apply location filter
  let locationFilteredData = experienceFilteredData;
  if (location !== 'All Locations') {
    locationFilteredData = locationFilteredData.filter(
      job => job.location === location
    );
  }

  // Calculate statistics
  const stats = calculateStats(locationFilteredData, data);

  return {
    jobs: locationFilteredData,
    hasMore: locationFilteredData.length > 20,
    locations: cachedLocations || [],
    stats
  };
};

// Calculate dashboard statistics
const calculateStats = (filteredData: JobListing[], allData: JobListing[]): DashboardStats => {
  // Total jobs
  const totalJobs = filteredData.length;
  
  // Average salary
  const avgSalary = filteredData.length > 0
    ? filteredData.reduce((sum, job) => sum + job.salary, 0) / filteredData.length
    : 0;
  
  // Top location
  const locationCounts: Record<string, number> = {};
  filteredData.forEach(job => {
    locationCounts[job.location] = (locationCounts[job.location] || 0) + 1;
  });
  
  const sortedLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1]);
  
  const topLocation = {
    name: sortedLocations.length > 0 ? sortedLocations[0][0] : 'N/A',
    percentage: sortedLocations.length > 0 
      ? Math.round((sortedLocations[0][1] / totalJobs) * 100) 
      : 0
  };
  
  // Top industry
  const industryCounts: Record<string, number> = {};
  filteredData.forEach(job => {
    industryCounts[job.industry] = (industryCounts[job.industry] || 0) + 1;
  });
  
  const sortedIndustries = Object.entries(industryCounts)
    .sort((a, b) => b[1] - a[1]);
  
  const topIndustry = {
    name: sortedIndustries.length > 0 ? sortedIndustries[0][0] : 'N/A',
    percentage: sortedIndustries.length > 0 
      ? Math.round((sortedIndustries[0][1] / totalJobs) * 100) 
      : 0
  };

  // Growth rates (mocked for demonstration - in a real app these would be calculated from historical data)
  const jobsGrowthRate = 12;  // 12% growth from last month
  const salaryGrowthRate = 5.2;  // 5.2% growth from last quarter
  
  return {
    totalJobs,
    avgSalary,
    topLocation,
    topIndustry,
    jobsGrowthRate,
    salaryGrowthRate
  };
};
