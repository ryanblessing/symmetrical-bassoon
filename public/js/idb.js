let db;
const request = indexedDB.open('budget-tracker', 1);

//event will emit if database version changes
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    //create an object store (table) called new transaction, set it to auto-increment a primary key
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function (event) {
    // when db is successfully created with its object store (from onupgradedneeded event above), save reference to db in global variable
    db = event.target.result;

    // check if app is online, if yes run checkDatabase() function to send all local db data to api
    if (navigator.onLine) {
        uploadBudget();
    }
};

request.onerror = function (event) {
    // log error here
    console.log(event.target.errorCode);
};

//this function will be executed if attempt to submit a new transaction & there's no internet conn
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    //access the object store for new_transaction
    const budgetObjectStore = transaction.objectStore('new_transaction');

    // add a record to store with add method.
    budgetObjectStore.add(record);
}

function uploadBudget() {
    // open a transaction on your db
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access your object store
    const budgetObjectStore = transaction.objectStore('new_transaction');

    // get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();

    //on successful .getAll() execution, run this function
    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    //open one more transaction
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const budgetObjectStore = transaction.objectStore('new_transaction');
                    // clear all items in your store
                    budgetObjectStore.clear();

                    alert('All saved transactions have been submitted.')
                })
                .catch(err => {
                    // set reference to redirect back here
                    console.log(err);
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', uploadBudget);