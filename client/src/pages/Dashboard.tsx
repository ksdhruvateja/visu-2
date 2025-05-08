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

      <main className="container mx-auto px-2 py-2 flex-grow">
        {/* Dashboard Header - Removed to save space */}

        {/* Visualization Controls */}
        <div className="relative z-10 mb-2">
          <FilterControls
            onFilterChange={handleFilterChange}
            locations={locations || []}
            isLoading={isLoading}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/60 border border-red-700 text-red-200 px-4 py-2 rounded-xl relative mb-2 backdrop-blur-sm text-sm">
            <strong className="font-bold">Error:</strong>
            <span className="ml-1"> {error}</span>
          </div>
        )}

        {/* All Visualizations in a compact grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[calc(100vh-5rem)]">
          {/* Main visualizations in a 4x2 grid */}
          
          {/* Row 1: 4 charts */}
          <SalaryLocationIndustryBarChart
            data={visualizationData?.groupedBar}
            isLoading={isLoading}
          />

          <SalaryJobTitleRidgeline
            data={visualizationData?.ridgeline}
            isLoading={isLoading}
          />
          
          <SalaryPostingDateScatter
            data={visualizationData?.scatterPlot}
            isLoading={isLoading}
          />
          
          <JobCountStackedBar
            data={visualizationData?.stackedBar}
            isLoading={isLoading}
          />

          {/* Row 2: 2 charts - map spanning 3 columns and timeline */}
          <div className="md:col-span-3">
            <GeographicMapChart 
              isLoading={isLoading}
            />
          </div>
          
          <JobPostingsTimeLine
            data={visualizationData?.timeLine}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}