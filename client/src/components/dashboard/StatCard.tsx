interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

import { Skeleton } from "@/components/ui/skeleton";

export default function StatCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  trend,
  isLoading = false
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 flex items-start">
        <Skeleton className="w-10 h-10 rounded-md" />
        <div className="ml-3 w-full">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-start">
      <div className={`${iconBgColor} p-2 rounded-md`}>
        <span className={`material-icons ${iconColor}`}>{icon}</span>
      </div>
      <div className="ml-3">
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-xl font-semibold">{value}</h3>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            <span className="material-icons text-xs mr-1">
              {trend.isPositive ? 'arrow_upward' : 'arrow_downward'}
            </span>
            <span>{trend.value}</span>
          </p>
        )}
      </div>
    </div>
  );
}
