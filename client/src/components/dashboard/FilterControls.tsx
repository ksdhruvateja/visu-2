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
import { Badge } from "@/components/ui/badge";

interface FilterControlsProps {
  onFilterChange: (filters: FilterOptions) => void;
  locations: string[];
  isLoading?: boolean;
}

export default function FilterControls({ onFilterChange, locations, isLoading = false }: FilterControlsProps) {
  const [filters, setFilters] = useState<FilterOptions>({
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
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
          <span className="material-icons text-cyan-400 mr-2">filter_alt</span>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Filter Employment Data
          </span>
        </h2>
        
        <div className="flex flex-col md:flex-row md:items-end space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label htmlFor="experience-filter" className="block text-sm font-medium text-gray-300 mb-1">
              Experience Level
            </label>
            <Select
              disabled={isLoading}
              value={filters.experienceLevel}
              onValueChange={(value) => handleFilterChange("experienceLevel", value)}
            >
              <SelectTrigger 
                id="experience-filter" 
                className="border-gray-700 bg-gray-800 text-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                {experienceLevelOptions.map((option) => (
                  <SelectItem key={option} value={option} className="focus:bg-gray-700 focus:text-white">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label htmlFor="location-filter" className="block text-sm font-medium text-gray-300 mb-1">
              Location
            </label>
            <Select
              disabled={isLoading}
              value={filters.location}
              onValueChange={(value) => handleFilterChange("location", value)}
            >
              <SelectTrigger 
                id="location-filter" 
                className="border-gray-700 bg-gray-800 text-gray-200 focus:ring-cyan-500 focus:border-cyan-500"
              >
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                <SelectItem value="All Locations" className="focus:bg-gray-700 focus:text-white">
                  All Locations
                </SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location} className="focus:bg-gray-700 focus:text-white">
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="">
            <Button
              disabled={isLoading}
              onClick={handleApplyFilters}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white shadow-lg"
            >
              Apply Filters
            </Button>
          </div>
        </div>
        
        {/* Active filters display */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="text-sm text-gray-400 mr-1">Active filters:</div>
          <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700">
            Experience: {filters.experienceLevel}
          </Badge>
          <Badge variant="outline" className="bg-emerald-900/30 text-emerald-300 border-emerald-700">
            Location: {filters.location}
          </Badge>
        </div>
      </div>
    </section>
  );
}
