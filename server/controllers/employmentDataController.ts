import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
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
      experienceLevels,
      locations,
      industries,
      employmentTypes,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    // Read CSV data if not cached
    if (!cachedData) {
      try {
        // Try different possible paths to find the CSV file
        let csvPath = path.resolve(process.cwd(), 'attached_assets/employment_dataset.csv');
        
        // If file doesn't exist, try alternative path
        if (!fs.existsSync(csvPath)) {
          const altPath = path.resolve('./attached_assets/employment_dataset.csv');
          if (fs.existsSync(altPath)) {
            csvPath = altPath;
          } else {
            console.error("Could not find employment_dataset.csv in either directory:", {
              path1: csvPath,
              path2: altPath,
              cwd: process.cwd(),
              dirs: fs.readdirSync('.')
            });
          }
        }
        
        console.log("Attempting to load CSV file from:", csvPath);
        console.log("File exists:", fs.existsSync(csvPath));
        console.log("File size:", fs.existsSync(csvPath) ? fs.statSync(csvPath).size : 'N/A');
        
        cachedData = await readEmploymentData(csvPath);
        console.log(`Successfully loaded ${cachedData.length} job listings`);
        
        // Extract unique locations for filter dropdown
        cachedLocations = Array.from(new Set(cachedData.map(job => job.location)));
        console.log(`Found ${cachedLocations.length} unique locations`);
      } catch (err) {
        console.error("Error loading employment data:", err);
        cachedData = [];
        cachedLocations = [];
      }
    }

    // Convert arrays to string arrays or empty arrays if undefined
    const expLevels = Array.isArray(experienceLevels) 
      ? experienceLevels as string[] 
      : experienceLevels ? [experienceLevels as string] : [];
      
    const locs = Array.isArray(locations) 
      ? locations as string[] 
      : locations ? [locations as string] : [];
      
    const inds = Array.isArray(industries) 
      ? industries as string[] 
      : industries ? [industries as string] : [];
      
    const empTypes = Array.isArray(employmentTypes) 
      ? employmentTypes as string[] 
      : employmentTypes ? [employmentTypes as string] : [];

    // Apply filters
    const filteredData = filterData(
      cachedData,
      expLevels,
      locs,
      inds,
      empTypes
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
  experienceLevels: string[],
  locations: string[],
  industries: string[],
  employmentTypes: string[]
): FilteredData => {
  // Start with all data
  let filteredData = [...data];

  // Apply experience level filters
  if (experienceLevels.length > 0) {
    filteredData = filteredData.filter(
      job => experienceLevels.includes(job.experienceLevel)
    );
  }

  // Apply location filters
  if (locations.length > 0) {
    filteredData = filteredData.filter(
      job => locations.includes(job.location)
    );
  }
  
  // Apply industry filters
  if (industries.length > 0) {
    filteredData = filteredData.filter(
      job => industries.includes(job.industry)
    );
  }
  
  // Apply employment type filters
  if (employmentTypes.length > 0) {
    filteredData = filteredData.filter(
      job => employmentTypes.includes(job.employmentType)
    );
  }

  // Calculate statistics
  const stats = calculateStats(filteredData, data);

  return {
    jobs: filteredData,
    hasMore: filteredData.length > 20,
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
