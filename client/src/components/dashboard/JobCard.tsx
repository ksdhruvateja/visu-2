import { formatCurrency, formatDate } from "@/lib/utils/data";
import { JobListing } from "@/types";
import { Badge } from "@/components/ui/badge";

interface JobCardProps {
  job: JobListing;
}

export default function JobCard({ job }: JobCardProps) {
  const {
    jobTitle,
    companyName,
    employmentType,
    location,
    industry,
    experienceLevel,
    postedDate,
    jobDescription,
    salary
  } = job;

  // Determine the employment type badge style
  const getEmploymentTypeStyle = (type: string): { bg: string, text: string, border: string } => {
    switch (type.toLowerCase()) {
      case 'full-time':
        return { 
          bg: 'bg-blue-900/30', 
          text: 'text-blue-400',
          border: 'border-blue-700' 
        };
      case 'part-time':
        return { 
          bg: 'bg-teal-900/30', 
          text: 'text-teal-400',
          border: 'border-teal-700' 
        };
      case 'contract':
        return { 
          bg: 'bg-orange-900/30', 
          text: 'text-orange-400',
          border: 'border-orange-700' 
        };
      case 'internship':
        return { 
          bg: 'bg-purple-900/30', 
          text: 'text-purple-400',
          border: 'border-purple-700' 
        };
      case 'temporary':
        return { 
          bg: 'bg-yellow-900/30', 
          text: 'text-yellow-400',
          border: 'border-yellow-700' 
        };
      default:
        return { 
          bg: 'bg-gray-900/30', 
          text: 'text-gray-400',
          border: 'border-gray-700' 
        };
    }
  };

  const badgeStyle = getEmploymentTypeStyle(employmentType);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg p-5 hover:shadow-xl transition-all duration-300 border border-gray-700 group">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-white group-hover:text-cyan-400 transition-colors duration-300">{jobTitle}</h3>
          <p className="text-sm text-gray-400 mb-2">{companyName}</p>
        </div>
        <Badge 
          variant="outline" 
          className={`${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border}`}
        >
          {employmentType}
        </Badge>
      </div>
      
      <div className="flex items-center text-sm text-gray-400 mb-3">
        <span className="material-icons text-xs mr-1 text-cyan-500">location_on</span>
        <span>{location}</span>
        <span className="mx-2 text-gray-600">•</span>
        <span className="material-icons text-xs mr-1 text-cyan-500">business</span>
        <span>{industry}</span>
      </div>
      
      <div className="flex items-center text-sm text-gray-400 mb-3">
        <span className="material-icons text-xs mr-1 text-cyan-500">work</span>
        <span>{experienceLevel}</span>
        <span className="mx-2 text-gray-600">•</span>
        <span className="material-icons text-xs mr-1 text-cyan-500">today</span>
        <span>{formatDate(postedDate)}</span>
      </div>
      
      <div className="text-sm text-gray-400 mb-4 line-clamp-2 border-l-2 border-cyan-800 pl-3">
        {jobDescription}
      </div>
      
      <div className="flex justify-between items-center pt-2 border-t border-gray-700">
        <span className="font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
          {formatCurrency(salary)}
        </span>
        <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center group-hover:translate-x-1 transition-transform duration-300">
          View Details
          <span className="material-icons ml-1 text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
