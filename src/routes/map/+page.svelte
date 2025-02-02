<script>
	import { onMount } from 'svelte'; // impory hook for executing code only on client side (browser)
	import { location } from '$lib/mapstore'; // Import the location store (writable store) to store the pins location globally in location store
	import { saveLocation, getLocation } from '$lib/database'; // Import saveLocation and getLocation from IndexedDB to interact with the DB

	let map, marker, mapContainer; // Defined global variables map(google maps instance) marker(draggable marker) mapContainer(to bind the DOM element where the map will be rendered)

	onMount(async () => { //Asynchronous function to run in the background without blocking the rest of the code
		if (typeof window !== 'undefined') { // Ensure this code runs only in the browser (client side)
			window.initMap = () => { // Google Maps initialization after google map script is loaded
				if (navigator.geolocation) { // Retrieving users current location using geolocation api
					navigator.geolocation.getCurrentPosition(
						async (position) => { // Asynchronous call to save users location to IndexedDB without blocking the rest of the code
							const pos = { // Object containing actual user current position
								lat: position.coords.latitude,
								lng: position.coords.longitude
							};

							map = new google.maps.Map(mapContainer, { // Initialize the map with the user's current location
								center: pos,
								zoom: 14,
								disableDefaultUI: true,
							});

							marker = new google.maps.Marker({ // Create a draggable marker at the user's location
								position: pos,
								map: map,
								draggable: true // Make marker draggable
							});

							location.set(pos); // Update the store with the initial position

							marker.addListener('dragend', async (event) => { // Add event listener for dragging the marker and updating the location
								const newPosition = event.latLng.toJSON(); // Get the new position after dragging
								// Log the new position for debugging purposes
								console.log('New position:', newPosition); 

								location.set(newPosition); // Update location store with new position

								try {
									await saveLocation(newPosition); // Save the new position in IndexedDB asynchronously
									// Log for debugging purposes
									console.log('Location saved to IndexedDB');
								} catch (error) {
									// Log for debugging purposes
									console.error('Error saving location to IndexedDB:', error);
								}
							});

							const storedLocation = await getLocation();
							if (storedLocation) { // Ensure the database is always up-to-date with the live position on load
								console.log('Location fetched from IndexedDB:', storedLocation);
								if (storedLocation.lat !== pos.lat || storedLocation.lng !== pos.lng) {
									// If stored position doesn't match live position update IndexedDB
									await saveLocation(pos); // Ensure the DB is updated to the current live position
									console.log('IndexedDB updated with live position');
								}
							}
						},
						() => {
							console.error('Error getting geolocation');
						}
					);
				} else {
					console.error("Error: Your browser doesn't support geolocation."); // Browser doesn't support geolocation log error message
				}
			};

			loadGoogleMapsAPI() // Load Google Maps API asynchronously
				.then(() => {
					console.log('Google Maps API loaded successfully');
				})
				.catch((err) => {
					console.error('Error loading Google Maps API', err);
				});
		}
	});

	function loadGoogleMapsAPI() { // Function to load Google Maps API after google maps api loads successfully
		return new Promise((resolve, reject) => { // Object takes callback function with 2 parameters 
			if (window.google && window.google.maps) { // Check if google map is already loaded
				resolve(); // Called when the API loads successfully.
				return; //Called when API fails to load
			}

			const script = document.createElement('script'); // Create a new java script element
			script.src =
				'https://maps.googleapis.com/maps/api/js?key=AIzaSyDHcINToRWO8FtrQHmN6P7tf2EFDCb68IA&libraries=places&callback=initMap&v=weekly'; // Use your actual API key
			script.async = true;
			script.defer = true;
			document.body.appendChild(script); // Append the script to the pages body

			script.onload = resolve; // Called when promise is fulfilled and now we can use google maps
			script.onerror = () => reject(new Error('Google Maps API failed to load')); // Handle script loading failure
		});
	}
</script>

<div id="map" bind:this={mapContainer}></div> // Container for rendering the google map element allowing the javascript code to interact with this div element