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
    const results: JobListing[] = [];
    
    fs.createReadStream(filePath)
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
          
          results.push(jobListing);
        } catch (err) {
          console.error('Error parsing row:', err);
        }
      })
      .on('error', (error) => {
        reject(error);
      })
      .on('end', () => {
        console.log(`Successfully processed ${results.length} job listings`);
        resolve(results);
      });
  });
};
