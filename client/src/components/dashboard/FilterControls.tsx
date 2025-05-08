import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterOptions } from "@/types";

interface FilterControlsProps {
  onFilterChange: (filters: FilterOptions) => void;
  locations: string[];
  isLoading?: boolean;
}

export default function FilterControls({ onFilterChange, locations, isLoading = false }: FilterControlsProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    timeRange: "Last 12 Months",
    experienceLevel: "All Levels",
    location: "All Locations",
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  const timeRangeOptions = ["Last 3 Months", "Last 6 Months", "Last 12 Months", "All Time"];
  const experienceLevelOptions = [
    "All Levels",
    "Entry Level",
    "Mid Level",
    "Senior Level",
    "Manager",
    "Director"
  ];

  return (
    <section className="mb-6">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div>
            <label htmlFor="time-range" className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <Select
              disabled={isLoading}
              value={filters.timeRange}
              onValueChange={(value) => handleFilterChange("timeRange", value)}
            >
              <SelectTrigger id="time-range" className="border border-gray-300 rounded-md w-full">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="experience-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Experience Level
            </label>
            <Select
              disabled={isLoading}
              value={filters.experienceLevel}
              onValueChange={(value) => handleFilterChange("experienceLevel", value)}
            >
              <SelectTrigger id="experience-filter" className="border border-gray-300 rounded-md w-full">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevelOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <Select
              disabled={isLoading}
              value={filters.location}
              onValueChange={(value) => handleFilterChange("location", value)}
            >
              <SelectTrigger id="location-filter" className="border border-gray-300 rounded-md w-full">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Locations">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:self-end">
            <Button
              disabled={isLoading}
              onClick={handleApplyFilters}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition w-full md:w-auto"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
