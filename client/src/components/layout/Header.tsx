export default function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-900 to-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="material-icons text-cyan-400 text-xl mr-1">insights</span>
            <h1 className="text-sm md:text-base font-medium bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              Employment Data Visualization
            </h1>
          </div>
          <div className="text-gray-400 text-xs">
            Interactive job market trends
          </div>
        </div>
      </div>
    </header>
  );
}
