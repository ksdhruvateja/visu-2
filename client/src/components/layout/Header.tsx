export default function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-900 to-gray-800 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <span className="material-icons text-cyan-400 text-3xl mr-2">insights</span>
          <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Employment Data Visualization Dashboard
          </h1>
        </div>
      </div>
    </header>
  );
}
