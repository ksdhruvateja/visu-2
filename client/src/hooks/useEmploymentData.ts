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
} from "@/types";
import { 
  processBoxPlotData, 
  processGroupedBarData, 
  processRidgelineData, 
  processScatterPlotData, 
  processStackedBarData, 
  processTimeLineData 
} from "@/lib/utils/data";

const useEmploymentData = (filters: FilterOptions) => {
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreJobs, setHasMoreJobs] = useState(true);
  
  const fetchParams = new URLSearchParams({
    timeRange: filters.timeRange,
    experienceLevel: filters.experienceLevel,
    location: filters.location,
    page: currentPage.toString(),
    limit: '20'
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/employment-data?${fetchParams.toString()}`],
    refetchOnWindowFocus: false,
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
