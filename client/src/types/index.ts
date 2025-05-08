export interface JobListing {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  industry: string;
  experienceLevel: string;
  employmentType: string;
  salary: number;
  postedDate: string;
  jobDescription: string;
}

export interface DashboardStats {
  totalJobs: number;
  avgSalary: number;
  topLocation: {
    name: string;
    percentage: number;
  };
  topIndustry: {
    name: string;
    percentage: number;
  };
  jobsGrowthRate: number;
  salaryGrowthRate: number;
}

export interface FilterOptions {
  timeRange: string;
  experienceLevel: string;
  location: string;
}

export interface VisualizationData {
  boxPlot: BoxPlotData;
  groupedBar: GroupedBarData;
  stackedBar: StackedBarData;
  ridgeline: RidgelineData;
  timeLine: TimeLineData;
  scatterPlot: ScatterPlotData;
}

// Specific visualization data types
export interface BoxPlotData {
  // This will contain the processed data for the box plot
  experienceLevels: string[];
  salaries: {
    [key: string]: {
      min: number;
      q1: number;
      median: number;
      q3: number;
      max: number;
      outliers: Array<{ id: string; value: number; jobTitle: string; companyName: string }>;
    };
  };
}

export interface GroupedBarData {
  // This will contain the processed data for the grouped bar chart
  locations: string[];
  industries: string[];
  data: {
    [location: string]: {
      [industry: string]: number;
    };
  };
}

export interface StackedBarData {
  // This will contain the processed data for the stacked bar chart
  industries: string[];
  employmentTypes: string[];
  data: {
    [industry: string]: {
      [employmentType: string]: number;
    };
  };
}

export interface RidgelineData {
  // This will contain the processed data for the ridgeline plot
  jobTitles: string[];
  salaryRanges: {
    [jobTitle: string]: {
      values: number[];
      min: number;
      max: number;
    };
  };
}

export interface TimeLineData {
  // This will contain the processed data for the multi-line chart
  experienceLevels: string[];
  timePoints: string[];
  data: {
    [experienceLevel: string]: {
      [timePoint: string]: number;
    };
  };
}

export interface ScatterPlotData {
  // This will contain the processed data for the scatter plot
  points: Array<{
    id: string;
    date: string;
    salary: number;
    jobTitle: string;
    companyName: string;
    industry: string;
  }>;
  trendLine: Array<{ date: string; salary: number }>;
}
