
const stockForm = document.getElementById('stock-form');
const productNameInput = document.getElementById('product-name');
const productQuantityInput = document.getElementById('product-quantity');
const productMinInput = document.getElementById('product-min');
const stockTableBody = document.querySelector('#stock-table tbody');
const newItemBtn = document.getElementById('new-item-btn');

let stockItems = [];

// Load stock from localStorage
function loadStock() {
    const stored = localStorage.getItem('monitoramentoEstoque');
    if (stored) {
        stockItems = JSON.parse(stored);
    } else {
        stockItems = [];
    }
}

// Save stock to localStorage
function saveStock() {
    localStorage.setItem('monitoramentoEstoque', JSON.stringify(stockItems));
}

// Display alert popup
function showAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.classList.add('alert-popup');
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}

// Render table rows
function renderStock() {
    stockTableBody.innerHTML = '';

    if (stockItems.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.textContent = 'Nenhum produto no estoque.';
        td.style.textAlign = 'center';
        td.style.color = '#dedede';
        tr.appendChild(td);
        stockTableBody.appendChild(tr);
        return;
    }

    let alerted = false;

    stockItems.forEach((item, index) => {
        const tr = document.createElement('tr');

        // If item quantity below min threshold, add low-stock class and alert
        if (item.quantity < item.min) {
            tr.classList.add('low-stock');
            alerted = true;
        }

        const nameTd = document.createElement('td');
        nameTd.textContent = item.name;
        tr.appendChild(nameTd);

        const quantityTd = document.createElement('td');
        quantityTd.textContent = item.quantity;
        tr.appendChild(quantityTd);

        const minTd = document.createElement('td');
        minTd.textContent = item.min;
        tr.appendChild(minTd);

        const statusTd = document.createElement('td');
        if (item.quantity < item.min) {
            statusTd.textContent = 'Estoque Baixo';
            statusTd.style.fontWeight = '700';
            statusTd.style.color = '#ff6666';
        } else {
            statusTd.textContent = 'OK';
            statusTd.style.color = '#6ee66e';
            statusTd.style.fontWeight = '600';
        }
        tr.appendChild(statusTd);

        // Actions: edit and delete buttons
        const actionsTd = document.createElement('td');
        actionsTd.classList.add('actions');

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '&#9998;'; // pencil icon
        editBtn.title = 'Editar';
        editBtn.onclick = () => {
            productNameInput.value = item.name;
            productQuantityInput.value = item.quantity;
            productMinInput.value = item.min;
            productNameInput.focus();

            // Remove the existing item so that on submit it updates
            stockItems.splice(index, 1);
            saveStock();
            renderStock();
        };
        actionsTd.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&#128465;'; // trash bin icon
        deleteBtn.title = 'Excluir';
        deleteBtn.onclick = () => {
            if (confirm(`Deseja realmente excluir o produto "${item.name}"?`)) {
                stockItems.splice(index, 1);
                saveStock();
                renderStock();
            }
        };
        actionsTd.appendChild(deleteBtn);

        tr.appendChild(actionsTd);

        stockTableBody.appendChild(tr);
    });

    if (alerted) {
        showAlert('⚠️ Atenção! Alguns produtos estão com estoque baixo.');
    }
}

// Clear form for new item entry
function clearForm() {
    stockForm.reset();
    productNameInput.focus();
}

// Handle form submission
stockForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = productNameInput.value.trim();
    const quantity = parseInt(productQuantityInput.value);
    const min = parseInt(productMinInput.value);

    if (!name || isNaN(quantity) || isNaN(min) || min < 0 || quantity < 0) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    // Check if the product already exists; if yes, update quantity and min, else add new
    const existingIndex = stockItems.findIndex(
        (item) => item.name.toLowerCase() === name.toLowerCase()
    );

    if (existingIndex >= 0) {
        stockItems[existingIndex].quantity = quantity;
        stockItems[existingIndex].min = min;
    } else {
        stockItems.push({ name, quantity, min });
    }

    saveStock();
    renderStock();

    clearForm();
});

// New item button listener
newItemBtn.addEventListener('click', () => {
    clearForm();
});

// Initialize app
loadStock();
renderStock();
