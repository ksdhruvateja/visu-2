// Simple script to test API connectivity directly
const fetchData = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/employment-data');
    if (!response.ok) {
      console.error(`HTTP error: ${response.status} ${response.statusText}`);
      return;
    }
    const data = await response.json();
    console.log('API Data:', data);
    console.log('Job count:', data.jobs.length);
    console.log('Locations:', data.locations);
    console.log('Stats:', data.stats);
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

fetchData();