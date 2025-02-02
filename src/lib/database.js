//-------------------------------------------IndexedDB-----------------------------------------------------
const dbName = 'mapData';
const storeName = 'locations';

export async function openDB() { // Open IndexedDB database
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    
    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = function(event) {
      resolve(event.target.result);
    };

    request.onerror = function(event) {
      reject(event.target.error);
    };
  });
}


export async function saveLocation(position) { // Save pin location to IndexedDB
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    console.log('Deleting previous userLocation entry...'); // Log before deleting the old entry
    store.delete('userLocation');
  
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('Transaction complete: userLocation deleted'); // Log after the transaction completes
        
        const saveTransaction = db.transaction(storeName, 'readwrite'); // Insert the new position into the store
        const saveStore = saveTransaction.objectStore(storeName);
        
        saveStore.put({ id: 'userLocation', position });
        
        saveTransaction.oncomplete = () => {
          console.log('New location saved to IndexedDB:', position); // Log after saving the new position
          resolve();
        };
        
        saveTransaction.onerror = () => {
          console.error('Error saving new location to IndexedDB');
          reject(saveTransaction.error);
        };
      };
      
      transaction.onerror = () => {
        console.error('Error deleting old location in IndexedDB');
        reject(transaction.error);
      };
    });
  }
  

export async function getLocation() { // Retrieve stored location from IndexedDB
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);

  return new Promise((resolve, reject) => {
    const request = store.get('userLocation');
    request.onsuccess = function() {
      resolve(request.result ? request.result.position : null);
    };
    request.onerror = function() {
      reject(request.error);
    };
  });
}
