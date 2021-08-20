// create variable to hold db connection
let db;

//stablish a connection to IndexDb database called budget
const request = indexedDB.open('budget', 1)

request.onupgradeneeded = function (event) {
    //save ref to the database
    const db = event.target.result;
    //create a obj store (table) called budget
    db.createObjectStore('budget', {
        autoIncrement: true
    });
};


//upon success
request.onsuccess = function (event) {
    //db is created WITH object store
    db = event.target.result;

    //check if app is online, if yes run sendTransaction()? to send up information to Db
    if (navigator.onLine) {
        //create soon
        //sendTransaction()
    }
}

request.onerror = function (event) {
    console.log(event.target.errorCode)
};

//this function will be executes if we attempt to submit new statement without internet connection
function saveRecord(record) {
    //open a new transaction with the database
    const transaction = db.transaction(['budget'], 'readwrite');

    //access the object store for 'budget'
    const budgetObjectStore = transaction.ObjectStore('budget');

    //add record to you store with add method
    budgetObjectStore.add(record);
};


function uploadBudget() {
    // open a transaction on your db
    const transaction = db.transaction(['budget'], 'readwrite')

    // access your object store
    const budgetObjectStore = transaction.objectStore('budget')

    // get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();
    // more to come...

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
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
                        throw new Error(serverResponse)
                    }
                    // open one more transaction
                    const transaction = db.transaction(['budget'], 'readwrite')
                    // access the new_budget object store
                    const budgetObjectStore = transaction.objectStore('budget')
                    // clear all items in your store
                    budgetObjectStore.clear()

                    alert('All saved budget has been submitted!')
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }

}

// listen for app coming back online
window.addEventListener('online', uploadBudget)