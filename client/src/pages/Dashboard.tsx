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
    experienceLevel: "All Levels",
    location: "All Locations",
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

      <main className="container mx-auto px-4 py-6 flex-grow">
        {/* Dashboard Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 text-transparent bg-clip-text">Employment Data Visualization</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Interactive dashboard for exploring job market trends with advanced data visualizations</p>
        </div>

        {/* Visualization Controls */}
        <div className="relative z-10 mb-6">
          <div className="backdrop-blur-sm bg-gray-900/40 rounded-xl p-4 border border-gray-800 shadow-lg">
            <FilterControls
              onFilterChange={handleFilterChange}
              locations={locations || []}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/60 border border-red-700 text-red-200 px-4 py-3 rounded-xl relative mb-6 backdrop-blur-sm">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* All Visualizations in a single section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

          <SalaryPostingDateScatter
            data={visualizationData?.scatterPlot}
            isLoading={isLoading}
          />

          <JobCountStackedBar
            data={visualizationData?.stackedBar}
            isLoading={isLoading}
          />

          <JobPostingsTimeLine
            data={visualizationData?.timeLine}
            isLoading={isLoading}
          />

          {/* Geographic Map Visualization - Make it full width */}
          <div className="lg:col-span-2">
            <GeographicMapChart 
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
