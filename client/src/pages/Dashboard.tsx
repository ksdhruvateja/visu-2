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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 to-gray-900 text-white">
      <Header />

      <main className="container mx-auto px-1 py-1 flex-grow flex flex-col h-screen overflow-hidden">
        {/* Visualization Controls - more compact */}
        <div className="z-10">
          <FilterControls
            onFilterChange={handleFilterChange}
            locations={locations || []}
            isLoading={isLoading}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/60 border border-red-700 text-red-200 px-2 py-1 rounded-md text-xs my-1">
            <strong className="font-medium">Error:</strong>
            <span className="ml-1">{error}</span>
          </div>
        )}

        {/* All Visualizations in a compact grid layout - now full height */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-grow overflow-hidden">
          {/* Row 1: 4 charts */}
          <div className="h-full">
            <SalaryLocationIndustryBarChart
              data={visualizationData?.groupedBar}
              isLoading={isLoading}
            />
          </div>

          <div className="h-full">
            <SalaryJobTitleRidgeline
              data={visualizationData?.ridgeline}
              isLoading={isLoading}
            />
          </div>
          
          <div className="h-full">
            <SalaryPostingDateScatter
              data={visualizationData?.scatterPlot}
              isLoading={isLoading}
            />
          </div>
          
          <div className="h-full">
            <JobCountStackedBar
              data={visualizationData?.stackedBar}
              isLoading={isLoading}
            />
          </div>

          {/* Row 2: 2 charts - map spanning 3 columns and timeline */}
          <div className="h-full md:col-span-3">
            <GeographicMapChart 
              isLoading={isLoading}
            />
          </div>
          
          <div className="h-full">
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