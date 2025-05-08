import { format, parseISO } from 'date-fns';
import {
  BoxPlotData,
  GroupedBarData,
  JobListing,
  RidgelineData,
  ScatterPlotData,
  StackedBarData,
  TimeLineData
} from '../../types';

// Utility function to format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

// Utility function to format date
export const formatDate = (dateString: string): string => {
  return format(parseISO(dateString), 'MMM d, yyyy');
};

// Utility function to compute quartiles for box plot
export const computeQuartiles = (data: number[]): { min: number, q1: number, median: number, q3: number, max: number } => {
  const sorted = [...data].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const medianIndex = Math.floor(sorted.length * 0.5);
  const q3Index = Math.floor(sorted.length * 0.75);
  
  return {
    min: sorted[0],
    q1: sorted[q1Index],
    median: sorted[medianIndex],
    q3: sorted[q3Index],
    max: sorted[sorted.length - 1]
  };
};

// Utility function to identify outliers
export const identifyOutliers = (data: number[], jobs: JobListing[]): { 
  outliers: Array<{ id: string; value: number; jobTitle: string; companyName: string }>;
  filteredData: number[] 
} => {
  const { q1, q3 } = computeQuartiles(data);
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const outlierIndices: number[] = [];
  const outliers: Array<{ id: string; value: number; jobTitle: string; companyName: string }> = [];
  
  data.forEach((value, index) => {
    if (value < lowerBound || value > upperBound) {
      outlierIndices.push(index);
      outliers.push({
        id: jobs[index].id,
        value,
        jobTitle: jobs[index].jobTitle,
        companyName: jobs[index].companyName
      });
    }
  });
  
  const filteredData = data.filter((_, index) => !outlierIndices.includes(index));
  
  return { outliers, filteredData };
};

// Process data for box plot visualization
export const processBoxPlotData = (jobs: JobListing[]): BoxPlotData => {
  const experienceLevels = [...new Set(jobs.map(job => job.experienceLevel))];
  const salaries: BoxPlotData['salaries'] = {};
  
  experienceLevels.forEach(level => {
    const levelJobs = jobs.filter(job => job.experienceLevel === level);
    const salaryValues = levelJobs.map(job => job.salary);
    
    const { outliers, filteredData } = identifyOutliers(salaryValues, levelJobs);
    const { min, q1, median, q3, max } = computeQuartiles(filteredData);
    
    salaries[level] = {
      min,
      q1,
      median,
      q3,
      max,
      outliers
    };
  });
  
  return {
    experienceLevels,
    salaries
  };
};

// Process data for grouped bar chart visualization
export const processGroupedBarData = (jobs: JobListing[]): GroupedBarData => {
  const locations = [...new Set(jobs.map(job => job.location))];
  const industries = [...new Set(jobs.map(job => job.industry))];
  
  const data: GroupedBarData['data'] = {};
  
  locations.forEach(location => {
    data[location] = {};
    
    industries.forEach(industry => {
      const industryLocationJobs = jobs.filter(
        job => job.location === location && job.industry === industry
      );
      
      const avgSalary = industryLocationJobs.length
        ? industryLocationJobs.reduce((sum, job) => sum + job.salary, 0) / industryLocationJobs.length
        : 0;
      
      data[location][industry] = avgSalary;
    });
  });
  
  return {
    locations,
    industries,
    data
  };
};

// Process data for stacked bar chart visualization
export const processStackedBarData = (jobs: JobListing[]): StackedBarData => {
  const industries = [...new Set(jobs.map(job => job.industry))];
  const employmentTypes = [...new Set(jobs.map(job => job.employmentType))];
  
  const data: StackedBarData['data'] = {};
  
  industries.forEach(industry => {
    data[industry] = {};
    
    employmentTypes.forEach(type => {
      const count = jobs.filter(
        job => job.industry === industry && job.employmentType === type
      ).length;
      
      data[industry][type] = count;
    });
  });
  
  return {
    industries,
    employmentTypes,
    data
  };
};

// Process data for ridgeline plot visualization
export const processRidgelineData = (jobs: JobListing[]): RidgelineData => {
  const jobTitles = [...new Set(jobs.map(job => job.jobTitle))];
  const salaryRanges: RidgelineData['salaryRanges'] = {};
  
  jobTitles.forEach(title => {
    const titleJobs = jobs.filter(job => job.jobTitle === title);
    const values = titleJobs.map(job => job.salary);
    
    salaryRanges[title] = {
      values,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  });
  
  return {
    jobTitles,
    salaryRanges
  };
};

// Process data for time line visualization
export const processTimeLineData = (jobs: JobListing[]): TimeLineData => {
  const experienceLevels = [...new Set(jobs.map(job => job.experienceLevel))];
  
  // Extract months from the posted dates
  const dates = jobs.map(job => parseISO(job.postedDate));
  const months = [...new Set(dates.map(date => format(date, 'yyyy-MM')))].sort();
  
  const data: TimeLineData['data'] = {};
  
  experienceLevels.forEach(level => {
    data[level] = {};
    
    months.forEach(month => {
      const count = jobs.filter(job => {
        const jobMonth = format(parseISO(job.postedDate), 'yyyy-MM');
        return job.experienceLevel === level && jobMonth === month;
      }).length;
      
      data[level][month] = count;
    });
  });
  
  return {
    experienceLevels,
    timePoints: months,
    data
  };
};

// Process data for scatter plot visualization
export const processScatterPlotData = (jobs: JobListing[]): ScatterPlotData => {
  const points = jobs.map(job => ({
    id: job.id,
    date: job.postedDate,
    salary: job.salary,
    jobTitle: job.jobTitle,
    companyName: job.companyName,
    industry: job.industry
  }));
  
  // Calculate trend line (linear regression)
  const dates = points.map(p => new Date(p.date).getTime());
  const salaries = points.map(p => p.salary);
  
  // Simple linear regression
  const n = dates.length;
  const sumX = dates.reduce((a, b) => a + b, 0);
  const sumY = salaries.reduce((a, b) => a + b, 0);
  const sumXY = dates.reduce((sum, x, i) => sum + x * salaries[i], 0);
  const sumXX = dates.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Generate trend line points
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const trendLine = [
    { date: new Date(minDate).toISOString(), salary: slope * minDate + intercept },
    { date: new Date(maxDate).toISOString(), salary: slope * maxDate + intercept }
  ];
  
  return {
    points,
    trendLine
  };
};
