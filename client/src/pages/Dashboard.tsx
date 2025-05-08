import { useState } from "react";
import Header from "@/components/layout/Header";
import FilterControls from "@/components/dashboard/FilterControls";
import SalaryExperienceBoxPlot from "@/components/visualizations/SalaryExperienceBoxPlot";
import SalaryLocationIndustryBarChart from "@/components/visualizations/SalaryLocationIndustryBarChart";
import SalaryJobTitleRidgeline from "@/components/visualizations/SalaryJobTitleRidgeline";
import SalaryPostingDateScatter from "@/components/visualizations/SalaryPostingDateScatter";
import JobCountStackedBar from "@/components/visualizations/JobCountStackedBar";
import JobPostingsTimeLine from "@/components/visualizations/JobPostingsTimeLine";
import GeographicMapChart from "@/components/visualizations/GeographicMapChart";
import { FilterOptions } from "@/types";
import useEmploymentData from "@/hooks/useEmploymentData";

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterOptions>({
    experienceLevels: [],
    locations: [],
    industries: [],
    employmentTypes: [],
  });

  const {
    visualizationData,
    isLoading,
    error,
    locations,
  } = useEmploymentData(filters);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-gray-950 to-gray-900 text-white overflow-hidden">
      <Header />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Visualization Controls - minimized */}
        <div className="z-10 px-1">
          <FilterControls
            onFilterChange={handleFilterChange}
            locations={locations || []}
            isLoading={isLoading}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/60 border border-red-700 text-red-200 px-2 py-1 mx-1 rounded-md text-xs">
            <strong className="font-medium">Error:</strong>
            <span className="ml-1">{error}</span>
          </div>
        )}

        {/* Full-screen grid layout with visualizations that expand to fill all available space */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-1 flex-1 p-1 overflow-hidden">
          {/* Row 1: Top 4 charts */}
          <div className="w-full h-full">
            <SalaryLocationIndustryBarChart
              data={visualizationData?.groupedBar}
              isLoading={isLoading}
            />
          </div>

          <div className="w-full h-full">
            <SalaryJobTitleRidgeline
              data={visualizationData?.ridgeline}
              isLoading={isLoading}
            />
          </div>
          
          <div className="w-full h-full">
            <SalaryPostingDateScatter
              data={visualizationData?.scatterPlot}
              isLoading={isLoading}
            />
          </div>
          
          <div className="w-full h-full">
            <JobCountStackedBar
              data={visualizationData?.stackedBar}
              isLoading={isLoading}
            />
          </div>

          {/* Row 2: Bottom 2 charts with map spanning 3 columns */}
          <div className="w-full h-full md:col-span-3">
            <GeographicMapChart 
              isLoading={isLoading}
            />
          </div>
          
          <div className="w-full h-full">
            <JobPostingsTimeLine
              data={visualizationData?.timeLine}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}