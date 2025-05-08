import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BoxPlotData, 
  DashboardStats, 
  FilterOptions, 
  GroupedBarData, 
  JobListing, 
  RidgelineData, 
  ScatterPlotData, 
  StackedBarData, 
  TimeLineData,
  VisualizationData
} from "../types";
import { 
  processBoxPlotData, 
  processGroupedBarData, 
  processRidgelineData, 
  processScatterPlotData, 
  processStackedBarData, 
  processTimeLineData 
} from "../lib/utils/data";
import { apiBaseUrl } from "../lib/utils/hostConfig";

const useEmploymentData = (filters: FilterOptions) => {
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  
  const buildFetchParams = () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '20'
    });
    
    // Add experience levels if any are selected
    if (filters.experienceLevels && filters.experienceLevels.length > 0) {
      filters.experienceLevels.forEach(level => {
        params.append('experienceLevels', level);
      });
    }
    
    // Add locations if any are selected
    if (filters.locations && filters.locations.length > 0) {
      filters.locations.forEach(location => {
        params.append('locations', location);
      });
    }
    
    // Add industries if any are selected
    if (filters.industries && filters.industries.length > 0) {
      filters.industries.forEach(industry => {
        params.append('industries', industry);
      });
    }
    
    // Add employment types if any are selected
    if (filters.employmentTypes && filters.employmentTypes.length > 0) {
      filters.employmentTypes.forEach(type => {
        params.append('employmentTypes', type);
      });
    }
    
    return params;
  };
  
  const fetchParams = buildFetchParams();

  interface ApiResponse {
    jobs: JobListing[];
    hasMore: boolean;
    locations: string[];
    stats: DashboardStats;
  }

  const apiUrl = `/api/employment-data?${fetchParams.toString()}`;
  console.log(`Fetching employment data from: ${apiBaseUrl}${apiUrl}`);

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: [apiUrl],
    refetchOnWindowFocus: false,
    retry: 2
  });

  const loadMoreJobs = () => {
    if (!isLoading && hasMoreJobs) {
      setCurrentPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    setJobListings([]);
    setHasMoreJobs(true);
  }, [filters]);

  useEffect(() => {
    if (!isLoading && data) {
      try {
        console.log("Successfully loaded data:", {
          jobCount: data.jobs?.length,
          hasMore: data.hasMore,
          locationsCount: data.locations?.length,
          stats: data.stats
        });
        
        // Update job listings
        if (currentPage === 1) {
          setJobListings(data.jobs || []);
        } else {
          setJobListings(prev => [...prev, ...(data.jobs || [])]);
        }

        // Update whether there are more jobs to load
        setHasMoreJobs(data.hasMore || false);

        // Update locations
        if (data.locations) {
          setLocations(data.locations);
        }

        // Update stats
        if (data.stats) {
          setStats(data.stats);
        }

        // Process data for visualizations if we're on page 1
        if (currentPage === 1 && data.jobs?.length > 0) {
          const allJobs = data.jobs as JobListing[];
          console.log(`Processing visualization data for ${allJobs.length} jobs`);
          
          const boxPlotData = processBoxPlotData(allJobs);
          const groupedBarData = processGroupedBarData(allJobs);
          const stackedBarData = processStackedBarData(allJobs);
          const ridgelineData = processRidgelineData(allJobs);
          const timeLineData = processTimeLineData(allJobs);
          const scatterPlotData = processScatterPlotData(allJobs);
          
          setVisualizationData({
            boxPlot: boxPlotData,
            groupedBar: groupedBarData,
            stackedBar: stackedBarData,
            ridgeline: ridgelineData,
            timeLine: timeLineData,
            scatterPlot: scatterPlotData
          });
          
          console.log("Visualization data processed successfully");
        }
      } catch (err) {
        console.error("Error processing data:", err);
      }
    }
  }, [data, isLoading, currentPage]);

  return {
    data,
    jobListings,
    stats,
    visualizationData,
    isLoading,
    error: error ? (error as Error).message : null,
    locations,
    loadMoreJobs,
    hasMoreJobs
  };
};

export default useEmploymentData;
