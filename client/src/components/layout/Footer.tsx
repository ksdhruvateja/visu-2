export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 to-gray-900 mt-12 border-t border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-center">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Employment Data Visualization Dashboard</p>
        </div>
      </div>
    </footer>
  );
}
