import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <span className="material-icons text-primary text-3xl mr-2">insights</span>
          <h1 className="text-xl md:text-2xl font-semibold text-dark">Employment Data Insights</h1>
        </div>
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="material-icons text-gray-400 text-sm">search</span>
            </span>
            <Input 
              type="text" 
              placeholder="Search job titles..." 
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full md:w-64"
            />
          </div>
          <Button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-600 transition">
            <span className="material-icons text-sm mr-1">file_download</span>
            Export Data
          </Button>
        </div>
      </div>
    </header>
  );
}
