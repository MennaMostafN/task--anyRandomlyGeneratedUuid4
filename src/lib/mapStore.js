
import { writable } from 'svelte/store';

export const location = writable({ lat: 37.7749, lng: -122.4194 }); // Create a writable store to track the location
// Default coordinates, e.g., San Francisco
