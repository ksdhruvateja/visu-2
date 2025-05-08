import fs from 'fs';
import { parse } from 'csv-parse';
import { JobListing } from '@/types';

/**
 * Reads and parses employment data from a CSV file
 * @param filePath Path to the CSV file
 * @returns Promise resolving to an array of JobListing objects
 */
export const readEmploymentData = (filePath: string): Promise<JobListing[]> => {
  return new Promise((resolve, reject) => {
    console.log(`Starting to read CSV file from: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      const error = new Error(`CSV file not found at: ${filePath}`);
      console.error(error);
      return reject(error);
    }
    
    console.log(`File exists, size: ${fs.statSync(filePath).size} bytes`);
    
    const results: JobListing[] = [];
    
    fs.createReadStream(filePath)
      .on('error', (error) => {
        console.error(`Error reading file: ${error.message}`);
        reject(error);
      })
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (data) => {
        try {
          // Transform the CSV row into a JobListing object
          const jobListing: JobListing = {
            id: data['Job ID'],
            jobTitle: data['Job Title'],
            companyName: data['Company Name'],
            location: data['Location'],
            industry: data['Industry'],
            experienceLevel: data['Experience Level'],
            employmentType: data['Employment Type'],
            salary: parseInt(data['Salary (USD)'], 10),
            postedDate: data['Posted Date'],
            jobDescription: data['Job Description']
          };
          
          // Log every 100th row to see progress
          if (results.length % 100 === 0) {
            console.log(`Processing row ${results.length}`);
          }
          
          results.push(jobListing);
        } catch (err) {
          console.error('Error parsing row:', err);
        }
      })
      .on('error', (error) => {
        console.error(`CSV parsing error: ${error.message}`);
        reject(error);
      })
      .on('end', () => {
        console.log(`Successfully processed ${results.length} job listings`);
        
        if (results.length === 0) {
          console.error('No job listings were parsed from the CSV file!');
        } else {
          console.log(`Sample job: ${JSON.stringify(results[0], null, 2)}`);
        }
        
        resolve(results);
      });
  });
};
