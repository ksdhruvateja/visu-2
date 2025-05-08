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
        {/* Dashboard Header */}
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 text-transparent bg-clip-text">Employment Data Visualization</h1>
          <p className="text-gray-400 text-sm">Interactive dashboard for exploring job market trends</p>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-[calc(100vh-16rem)]">
          {/* Row 1: 3 charts */}
          <SalaryExperienceBoxPlot
            data={visualizationData?.boxPlot}
            isLoading={isLoading}
          />

          <SalaryLocationIndustryBarChart
            data={visualizationData?.groupedBar}
            isLoading={isLoading}
          />

          <SalaryJobTitleRidgeline
            data={visualizationData?.ridgeline}
            isLoading={isLoading}
          />

          {/* Row 2: 3 charts with map taking 2 columns */}
          <SalaryPostingDateScatter
            data={visualizationData?.scatterPlot}
            isLoading={isLoading}
          />

          <div className="md:col-span-2">
            <GeographicMapChart 
              isLoading={isLoading}
            />
          </div>

          {/* Row 3: 3 charts */}
          <JobCountStackedBar
            data={visualizationData?.stackedBar}
            isLoading={isLoading}
          />

          <JobPostingsTimeLine
            data={visualizationData?.timeLine}
            isLoading={isLoading}
          />

          {/* Additional space for future visualization if needed */}
          <div className="hidden md:block bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow overflow-hidden border border-gray-700 h-full flex flex-col">
            <div className="p-2 border-b border-gray-700">
              <h3 className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                Future Insights
              </h3>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-gray-400 text-xs">
                  Additional visualization space
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}