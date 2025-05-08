import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StatCard from "@/components/dashboard/StatCard";
import FilterControls from "@/components/dashboard/FilterControls";
import SalaryExperienceBoxPlot from "@/components/visualizations/SalaryExperienceBoxPlot";
import SalaryLocationIndustryBarChart from "@/components/visualizations/SalaryLocationIndustryBarChart";
import SalaryJobTitleRidgeline from "@/components/visualizations/SalaryJobTitleRidgeline";
import SalaryPostingDateScatter from "@/components/visualizations/SalaryPostingDateScatter";
import JobCountStackedBar from "@/components/visualizations/JobCountStackedBar";
import JobPostingsTimeLine from "@/components/visualizations/JobPostingsTimeLine";
import GeographicMapChart from "@/components/visualizations/GeographicMapChart";
import JobCard from "@/components/dashboard/JobCard";
import { Button } from "@/components/ui/button";
import { DashboardStats, FilterOptions, JobListing } from "@/types";
import { formatCurrency } from "@/lib/utils/data";
import useEmploymentData from "@/hooks/useEmploymentData";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [filters, setFilters] = useState<FilterOptions>({
    experienceLevel: "All Levels",
    location: "All Locations",
  });

  const {
    data,
    jobListings,
    stats,
    visualizationData,
    isLoading,
    error,
    locations,
    loadMoreJobs,
    hasMoreJobs,
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

        {/* Dashboard Overview */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Jobs"
              value={stats?.totalJobs.toLocaleString() || "0"}
              icon="work"
              iconBgColor="bg-blue-900"
              iconColor="text-blue-400"
              trend={{
                value: `${stats?.jobsGrowthRate || 0}% from last month`,
                isPositive: (stats?.jobsGrowthRate || 0) > 0,
              }}
              isLoading={isLoading}
            />

            <StatCard
              title="Average Salary"
              value={formatCurrency(stats?.avgSalary || 0)}
              icon="payments"
              iconBgColor="bg-cyan-900"
              iconColor="text-cyan-400"
              trend={{
                value: `${stats?.salaryGrowthRate || 0}% from last quarter`,
                isPositive: (stats?.salaryGrowthRate || 0) > 0,
              }}
              isLoading={isLoading}
            />

            <StatCard
              title="Top Location"
              value={stats?.topLocation.name || "N/A"}
              icon="location_on"
              iconBgColor="bg-purple-900"
              iconColor="text-purple-400"
              trend={{
                value: `${stats?.topLocation.percentage || 0}% of all listings`,
                isPositive: true,
              }}
              isLoading={isLoading}
            />

            <StatCard
              title="Top Industry"
              value={stats?.topIndustry.name || "N/A"}
              icon="trending_up"
              iconBgColor="bg-teal-900"
              iconColor="text-teal-400"
              trend={{
                value: `${stats?.topIndustry.percentage || 0}% of all listings`,
                isPositive: true,
              }}
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* Visualization Controls */}
        <div className="relative z-10 mb-6">
          <div className="backdrop-blur-sm bg-gray-900/40 rounded-xl p-4 border border-gray-800 shadow-lg">
            <FilterControls
              onFilterChange={handleFilterChange}
              locations={locations}
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

          {/* Geographic Map Visualization */}
          <GeographicMapChart 
            isLoading={isLoading}
          />
        </div>

        {/* Job Listings Preview */}
        <section className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">Recent Job Listings</h2>
            <button className="text-cyan-400 hover:text-cyan-300 flex items-center text-sm">
              View all listings
              <span className="material-icons ml-1 text-sm">arrow_forward</span>
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-900/60 backdrop-blur-sm rounded-lg shadow-md p-4 border border-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Skeleton className="h-5 w-40 mb-2 bg-gray-700" />
                      <Skeleton className="h-4 w-32 bg-gray-700" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full bg-gray-700" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2 bg-gray-700" />
                  <Skeleton className="h-4 w-full mb-4 bg-gray-700" />
                  <Skeleton className="h-10 w-full bg-gray-700" />
                  <div className="flex justify-between items-center mt-4">
                    <Skeleton className="h-5 w-20 bg-gray-700" />
                    <Skeleton className="h-4 w-24 bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobListings.slice(0, 3).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button
              onClick={loadMoreJobs}
              disabled={!hasMoreJobs || isLoading}
              variant="outline"
              className="border border-cyan-700 text-cyan-400 hover:bg-cyan-900/30 hover:text-cyan-300 transition-colors duration-200"
            >
              {isLoading ? "Loading..." : "Load More Jobs"}
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
