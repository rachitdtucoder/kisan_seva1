let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let medicinesInventory = JSON.parse(localStorage.getItem('medicinesInventory')) || {};

function saveDataToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('medicinesInventory', JSON.stringify(medicinesInventory));
}

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function displayTransactions(transactionsToShow = transactions) {
    const tableBody = document.getElementById('transactionTableBody');
    tableBody.innerHTML = '';

    transactionsToShow.forEach((transaction, index) => {
        const profit = (transaction.sellingPrice - transaction.buyingPrice) * transaction.quantity;
        const totalAmount = transaction.quantity * transaction.sellingPrice;
        const amountPaid = transaction.amountPaid || 0;
        const amountPending = totalAmount - amountPaid;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${transaction.date}</td>
            <td>${transaction.customerName}</td>
            <td>${transaction.customerMobile}</td>
            <td>${transaction.medicine}</td>
            <td>${transaction.quantity}</td>
            <td>${transaction.buyingPrice}</td>
            <td>${transaction.sellingPrice}</td>
            <td>${profit}</td>
            <td>${amountPaid}</td>
            <td class="amount-pending" id="amountPending_${transaction.id}">${amountPending}</td>
            <td>${totalAmount}</td>
            <td class="actions">
                <button onclick="editAmountPending(${transaction.id})">Edit Amount Pending</button>
                <button onclick="deleteTransaction(${transaction.id})">Delete</button>
            </td>
        `;

        const amountPendingElement = row.querySelector(`#amountPending_${transaction.id}`);
        if (amountPending > 0) {
            amountPendingElement.style.color = 'red';
        } else {
            amountPendingElement.style.color = 'black';
        }

        tableBody.appendChild(row);
    });
}

function addTransaction() {
    const date = formatDate(new Date());
    const customerName = prompt('Enter Customer Name:');
    const customerMobile = prompt('Enter Customer Mobile:');
    const medicine = prompt('Enter Medicine:');
    const quantity = parseInt(prompt('Enter Quantity:'));
    const buyingPrice = parseFloat(prompt('Enter Buying Price:'));
    const sellingPrice = parseFloat(prompt('Enter Selling Price:'));
    const amountPaid = parseFloat(prompt('Enter Amount Paid:'));

    if (customerName && customerMobile && medicine && quantity && buyingPrice && sellingPrice && amountPaid >= 0) {
        if (!medicinesInventory[medicine] || medicinesInventory[medicine] < quantity) {
            alert('Insufficient stock for the requested quantity.');
            return;
        }

        const transaction = {
            id: transactions.length + 1,
            date,
            customerName,
            customerMobile,
            medicine,
            quantity,
            buyingPrice,
            sellingPrice,
            amountPaid
        };

        transactions.push(transaction);
        updateMedicineInventory(medicine, -quantity); // Decrease inventory
        saveDataToLocalStorage(); // Save data to localStorage
        displayTransactions();
        displayInventory(); // Refresh inventory display
    } else {
        alert('Please fill in all fields and ensure Amount Paid is non-negative.');
    }
}

function editAmountPending(id) {
    const amountPendingElement = document.getElementById(`amountPending_${id}`);
    let newAmountPending = parseFloat(prompt('Enter new Amount Pending:'));
    
    if (!isNaN(newAmountPending) && newAmountPending >= 0) {
        newAmountPending = parseFloat(newAmountPending.toFixed(2)); // Optional: Round to two decimal places
        amountPendingElement.textContent = newAmountPending;
        
        const transactionToUpdate = transactions.find(transaction => transaction.id === id);
        if (transactionToUpdate) {
            const totalAmount = transactionToUpdate.quantity * transactionToUpdate.sellingPrice;
            transactionToUpdate.amountPaid = totalAmount - newAmountPending;
            saveDataToLocalStorage(); // Save data to localStorage
            displayTransactions(); // Refresh display
        }
    } else {
        alert('Please enter a valid non-negative number for Amount Pending.');
    }
}

function deleteTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    saveDataToLocalStorage(); // Save data to localStorage
    displayTransactions();
}

function searchCustomer() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const filteredTransactions = transactions.filter(transaction => 
        transaction.customerName.toLowerCase().includes(searchTerm)
    );
    displayTransactions(filteredTransactions);
}

function updateMedicineInventory(medicine, quantity) {
    if (medicinesInventory[medicine]) {
        medicinesInventory[medicine] += quantity;
        if (medicinesInventory[medicine] <= 0) {
            delete medicinesInventory[medicine];
        }
    } else {
        medicinesInventory[medicine] = quantity;
    }
    sortInventoryAlphabetically();
}

function displayInventory(inventoryToShow = medicinesInventory) {
    const tableBody = document.getElementById('inventoryTableBody');
    tableBody.innerHTML = '';

    let serialNumber = 1;
    for (const [medicine, quantity] of Object.entries(inventoryToShow)) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${serialNumber++}</td>
            <td>${medicine}</td>
            <td>${quantity}</td>
            <td class="actions">
                <button onclick="deleteMedicine('${medicine}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    }
}

function deleteMedicine(medicine) {
    if (medicinesInventory[medicine]) {
        delete medicinesInventory[medicine];
        saveDataToLocalStorage(); // Save data to localStorage
        displayInventory(); // Refresh inventory display
    }
}

function sortInventoryAlphabetically() {
    const sortedInventory = Object.keys(medicinesInventory)
        .sort()
        .reduce((acc, key) => {
            acc[key] = medicinesInventory[key];
            return acc;
        }, {});
    medicinesInventory = sortedInventory;
    saveDataToLocalStorage(); // Save data to localStorage
    displayInventory(); // Refresh inventory display
}

// Event listeners
document.getElementById('addTransactionBtn').addEventListener('click', addTransaction);
document.getElementById('addMedicineBtn').addEventListener('click', () => {
    const medicineName = document.getElementById('medicineName').value.trim();
    const medicineQuantity = parseInt(document.getElementById('medicineQuantity').value.trim());

    if (medicineName && medicineQuantity > 0) {
        updateMedicineInventory(medicineName, medicineQuantity);
        saveDataToLocalStorage(); // Save data to localStorage
        displayInventory();
        document.getElementById('medicineName').value = '';
        document.getElementById('medicineQuantity').value = '';
    } else {
        alert('Please enter valid Medicine Name and Quantity.');
    }
});

document.getElementById('searchInput').addEventListener('input', searchCustomer);

// Initial display
displayTransactions();
displayInventory();

