import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Ensures that the service is available globally in your app
})
export class RefreshService {

  constructor() {}

  /**
   * Checks if the refresh has already been done today for a specific key.
   * @param key - The key in localStorage (e.g., 'applyleave', 'worksheet', 'dashboard').
   * @returns {boolean} True if refresh is allowed for the given key, false if already done today.
   */
  checkForRefresh(key: string): boolean {
    const lastRefreshDate = localStorage.getItem(`${key}RefreshDate`); // Get last refresh date from localStorage for the specific key
    const today = new Date().toISOString().split('T')[0]; // Get the current date in 'YYYY-MM-DD' format

    // If the last refresh date is not today, allow refresh and update the stored date for that key
    if (lastRefreshDate !== today) {
      localStorage.setItem(`${key}RefreshDate`, today); // Store today's date in localStorage for that key
      return true; // Refresh is allowed
    }

    // If the refresh was already done today, don't allow further refresh
    return false;
  }

  /**
   * Method to simulate data refresh for a specific key.
   * You can replace this with actual data fetching logic (API calls, etc.).
   * @param key - The key for which the refresh is being performed (e.g., 'applyleave', 'worksheet', 'dashboard').
   */
  refreshData(key: string): void {
    console.log(`${key} data refreshed!`);

    //alert("1");
    window.location.reload();
     
    // Here you would add any logic to refresh your app's data for that specific key
    // For example: call an API to fetch fresh data for applyleave, worksheet, or dashboard
  }
}
