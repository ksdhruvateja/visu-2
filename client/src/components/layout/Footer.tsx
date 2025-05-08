export default function Footer() {
  return (
    <footer className="bg-white mt-12 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Employment Data Insights</h3>
            <p className="text-sm text-gray-600">
              Comprehensive employment market analytics and visualization tools to guide your career decisions and recruitment strategies.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-primary">Salary Insights</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Job Distribution</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Time Trends</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Job Listings</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-primary">Career Planning</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Salary Negotiation</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Industry Reports</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Data Methodology</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-primary">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 mb-4 md:mb-0">© {new Date().getFullYear()} Employment Data Insights. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-500 hover:text-primary">
              <span className="material-icons">facebook</span>
            </a>
            <a href="#" className="text-gray-500 hover:text-primary">
              <span className="material-icons">public</span>
            </a>
            <a href="#" className="text-gray-500 hover:text-primary">
              <span className="material-icons">alternate_email</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
