// Check if user is manager
function checkManagerAccess() {
    // Check session storage for manager flag
    const isManager = sessionStorage.getItem('isManager') === 'true';
    
    if (!isManager) {
        // Check if current user is manager
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.email === 'manager@mnt.com' && currentUser.password === 'manager123') {
            sessionStorage.setItem('isManager', 'true');
            return true;
        }
        
        // Redirect to main site if not manager
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Safe localStorage wrapper
const safeStorage = {
    getItem: function(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error('Error getting from localStorage:', e);
            return null;
        }
    },
    
    setItem: function(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.error('Error setting to localStorage:', e);
        }
    },
    
    removeItem: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    },
    
    getJSON: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error parsing JSON from localStorage:', e);
            return null;
        }
    },
    
    setJSON: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error stringifying JSON to localStorage:', e);
        }
    }
};

// Get DOM elements
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.page-section');

// Dashboard elements
const todayOrders = document.getElementById('todayOrders');
const todayOrdersChange = document.getElementById('todayOrdersChange');
const todayRevenue = document.getElementById('todayRevenue');
const todayRevenueChange = document.getElementById('todayRevenueChange');
const pendingOrders = document.getElementById('pendingOrders');
const completedOrders = document.getElementById('completedOrders');
const yearRevenue = document.getElementById('yearRevenue');
const totalRevenue = document.getElementById('totalRevenue');
const downloadStatementBtn = document.getElementById('downloadStatementBtn');

// Orders elements
const orderFilters = document.querySelectorAll('.filter-btn');
const ordersContainer = document.getElementById('ordersContainer');
const orderSearch = document.getElementById('orderSearch');

// Items elements
const itemsGrid = document.getElementById('itemsGrid');
const addNewItemBtn = document.getElementById('addNewItemBtn');
const itemFilterBtns = document.querySelectorAll('.item-filter-btn');
const descriptionGroup = document.getElementById('descriptionGroup');
const itemDescription = document.getElementById('itemDescription');

// Messages elements
const messagesContainer = document.getElementById('messagesContainer');

// Details elements
const managerForm = document.getElementById('managerForm');
const cancelChanges = document.getElementById('cancelChanges');

// Modal elements
const itemModal = document.getElementById('itemModal');
const closeItemModal = document.getElementById('closeItemModal');
const cancelItem = document.getElementById('cancelItem');
const itemForm = document.getElementById('itemForm');
const itemModalTitle = document.getElementById('itemModalTitle');
const itemCategory = document.getElementById('itemCategory');

const orderDetailsModal = document.getElementById('orderDetailsModal');
const closeOrderDetails = document.getElementById('closeOrderDetails');
const orderDetailsBody = document.getElementById('orderDetailsBody');
const orderDetailsFooter = document.getElementById('orderDetailsFooter');

const messageModal = document.getElementById('messageModal');
const closeMessageModal = document.getElementById('closeMessageModal');
const messageModalBody = document.getElementById('messageModalBody');

const confirmModal = document.getElementById('confirmModal');
const closeConfirmModal = document.getElementById('closeConfirmModal');
const cancelConfirm = document.getElementById('cancelConfirm');
const confirmAction = document.getElementById('confirmAction');
const confirmMessage = document.getElementById('confirmMessage');

const pinModal = document.getElementById('pinModal');
const closePinModal = document.getElementById('closePinModal');
const cancelPin = document.getElementById('cancelPin');
const pinInput = document.getElementById('pinInput');
const verifyPin = document.getElementById('verifyPin');
const pinError = document.getElementById('pinError');

// Toast element
const toast = document.getElementById('toast');

// State
let managerData = safeStorage.getJSON('managerData') || {
    email: 'manager@mnt.com',
    password: 'manager123',
    name: 'Manager'
};

let items = safeStorage.getJSON('managerItems') || [];
let messages = safeStorage.getJSON('contactMessages') || [];
let currentOrders = [];
let editingItemId = null;
let currentAction = null;
let currentActionData = null;
let currentOrderForPin = null;
let currentOrderForDetails = null;
let currentFilterStatus = 'pending';
let yearlyStats = safeStorage.getJSON('managerYearlyStats') || {
    year: new Date().getFullYear(),
    revenue: 0,
    orders: 0
};

// Show toast message
function showToast(message, type = 'success') {
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.background = type === 'success' ? '#28a745' : '#b22222';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

// Format date to DD MMM YYYY
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        const day = date.getDate();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} ${month} ${year}`;
    } catch (e) {
        console.error('Error formatting date:', e);
        return 'Unknown date';
    }
}

// Format currency
function formatCurrency(amount) {
    return `R${parseFloat(amount).toFixed(2)}`;
}

// Get status class
function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'pending':
            return 'status-pending';
        case 'ready':
            return 'status-ready';
        case 'completed':
            return 'status-completed';
        default:
            return 'status-pending';
    }
}

// Load orders from main app
function loadOrders() {
    // Clear current orders
    currentOrders = [];
    
    // Load orders from localStorage
    let customerOrders = safeStorage.getJSON('orders') || [];
    
    // Ensure all orders have proper status (convert to lowercase if needed)
    currentOrders = customerOrders.map(order => {
        // Ensure order has proper structure
        const formattedOrder = {
            id: order.id || Date.now(),
            orderId: order.orderId || `MNT${Date.now().toString().slice(-8)}`,
            timestamp: order.timestamp || new Date().toISOString(),
            items: order.items || [],
            total: order.total || 0,
            userEmail: order.userEmail || 'unknown@email.com',
            pin: order.pin || Math.floor(100000 + Math.random() * 900000).toString(),
            // Ensure status is lowercase and has a default value
            status: (order.status || 'pending').toLowerCase()
        };
        return formattedOrder;
    });
}

// Update dashboard stats
function updateDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    
    // Today's orders
    const todayOrdersCount = currentOrders.filter(order => 
        order.timestamp && order.timestamp.startsWith(today) && order.status === 'completed'
    ).length;
    
    const yesterdayOrdersCount = currentOrders.filter(order => 
        order.timestamp && order.timestamp.startsWith(yesterday) && order.status === 'completed'
    ).length;
    
    const ordersChange = yesterdayOrdersCount > 0 ? 
        Math.round(((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount) * 100) : 0;
    
    if (todayOrders) todayOrders.textContent = todayOrdersCount;
    if (todayOrdersChange) {
        todayOrdersChange.textContent = 
            `${ordersChange >= 0 ? '+' : ''}${ordersChange}% from yesterday`;
        todayOrdersChange.className = `stat-change ${ordersChange < 0 ? 'negative' : ''}`;
    }
    
    // Today's revenue
    const todayRevenueAmount = currentOrders
        .filter(order => order.timestamp && order.timestamp.startsWith(today) && order.status === 'completed')
        .reduce((sum, order) => sum + (order.total || 0), 0);
    
    const yesterdayRevenueAmount = currentOrders
        .filter(order => order.timestamp && order.timestamp.startsWith(yesterday) && order.status === 'completed')
        .reduce((sum, order) => sum + (order.total || 0), 0);
    
    const revenueChangePercent = yesterdayRevenueAmount > 0 ? 
        Math.round(((todayRevenueAmount - yesterdayRevenueAmount) / yesterdayRevenueAmount) * 100) : 0;
    
    if (todayRevenue) todayRevenue.textContent = formatCurrency(todayRevenueAmount);
    if (todayRevenueChange) {
        todayRevenueChange.textContent = 
            `${revenueChangePercent >= 0 ? '+' : ''}${revenueChangePercent}% from yesterday`;
        todayRevenueChange.className = `stat-change ${revenueChangePercent < 0 ? 'negative' : ''}`;
    }
    
    // Pending orders
    const pendingCount = currentOrders.filter(order => 
        order.status === 'pending'
    ).length;
    if (pendingOrders) pendingOrders.textContent = pendingCount;
    
    // Completed orders
    const completedOrdersCount = currentOrders.filter(order => 
        order.status === 'completed'
    ).length;
    if (completedOrders) completedOrders.textContent = completedOrdersCount;
    
    // Total revenue
    const allTimeRevenue = currentOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + (order.total || 0), 0);
    
    if (totalRevenue) totalRevenue.textContent = formatCurrency(allTimeRevenue);
    
    // Current year revenue
    const yearlyOrders = currentOrders.filter(order => 
        order.status === 'completed' &&
        new Date(order.timestamp).getFullYear() === currentYear
    );
    
    const yearlyRevenue = yearlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    if (yearRevenue) yearRevenue.textContent = formatCurrency(yearlyRevenue);
    
    // Update yearly stats
    yearlyStats = {
        year: currentYear,
        revenue: yearlyRevenue,
        orders: yearlyOrders.length
    };
    
    safeStorage.setJSON('managerYearlyStats', yearlyStats);
}

// Search orders
function searchOrders(searchTerm) {
    const filteredOrders = currentOrders.filter(order => 
        order.status === currentFilterStatus && 
        order.orderId && order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    displayFilteredOrders(filteredOrders);
}

// Display filtered orders
function displayFilteredOrders(filteredOrders) {
    if (!ordersContainer) return;
    
    ordersContainer.innerHTML = '';
    
    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <p>No ${currentFilterStatus} orders found</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    filteredOrders.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
        const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
        return dateB - dateA;
    });
    
    filteredOrders.forEach(order => {
        const statusClass = getStatusClass(order.status || 'pending');
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.dataset.orderId = order.id;
        orderElement.innerHTML = `
            <div class="order-item-header">
                <h4>${order.orderId || 'Unknown ID'}</h4>
                <span class="order-date">${order.timestamp ? formatDate(order.timestamp) : 'Unknown date'}</span>
            </div>
            <div class="order-item-body">
                <p><strong>Status:</strong> <span class="order-status-display ${statusClass}">${order.status || 'pending'}</span></p>
                <p><strong>Total:</strong> ${formatCurrency(order.total || 0)}</p>
            </div>
            <div class="order-actions">
                <button class="status-btn view-order-btn" data-order-id="${order.id}">View Details</button>
                ${order.status === 'pending' ? `<button class="status-btn ready-btn" data-order-id="${order.id}" data-status="ready">Mark as Ready</button>` : ''}
                ${order.status === 'ready' ? `<button class="status-btn complete-btn" data-order-id="${order.id}" data-status="complete">Mark as Complete</button>` : ''}
            </div>
        `;
        ordersContainer.appendChild(orderElement);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.view-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = parseInt(btn.dataset.orderId);
            const order = currentOrders.find(o => o.id === orderId);
            if (order) {
                showOrderDetails(order);
            }
        });
    });
    
    document.querySelectorAll('.ready-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = parseInt(btn.dataset.orderId);
            updateOrderStatus(orderId, 'ready');
        });
    });
    
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = parseInt(btn.dataset.orderId);
            const order = currentOrders.find(o => o.id === orderId);
            if (order) {
                showPinVerification(order);
            }
        });
    });
}

// Display all orders
function displayAllOrders(status = 'pending') {
    currentFilterStatus = status;
    const searchTerm = orderSearch ? orderSearch.value.trim() : '';
    
    if (searchTerm) {
        searchOrders(searchTerm);
    } else {
        const filteredOrders = currentOrders.filter(order => order.status === status);
        displayFilteredOrders(filteredOrders);
    }
}

// Show order details modal
function showOrderDetails(order) {
    currentOrderForDetails = order;
    const statusClass = getStatusClass(order.status || 'pending');
    
    if (!orderDetailsBody || !orderDetailsFooter) return;
    
    orderDetailsBody.innerHTML = `
        <div class="order-details-info">
            <div class="detail-row">
                <div class="detail-label">Order ID:</div>
                <div class="detail-value">${order.orderId || 'Unknown ID'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Date:</div>
                <div class="detail-value">${order.timestamp ? formatDate(order.timestamp) : 'Unknown date'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Customer Email:</div>
                <div class="detail-value">${order.userEmail || 'N/A'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value">
                    <span class="order-status-display ${statusClass}">${order.status || 'pending'}</span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Total Amount:</div>
                <div class="detail-value">${formatCurrency(order.total || 0)}</div>
            </div>
        </div>
        <div class="order-items-list">
            <h4>Order Items:</h4>
            ${order.items && order.items.length > 0 ? order.items.map(item => `
                <div class="order-item-row">
                    <span>${item.quantity || 1}x ${item.name || 'Unknown item'}</span>
                    <span>${formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                </div>
            `).join('') : '<p>No items in this order</p>'}
        </div>
        <div class="order-total-row">
            <strong>Total:</strong>
            <span>${formatCurrency(order.total || 0)}</span>
        </div>
    `;
    
    // Clear footer and add appropriate action buttons
    orderDetailsFooter.innerHTML = '';
    
    const orderStatus = order.status || 'pending';
    
    if (orderStatus === 'pending') {
        orderDetailsFooter.innerHTML = `
            <button type="button" class="cancel-btn" id="closeOrderDetailsBtn">Close</button>
            <button type="button" class="save-btn" id="markAsReadyBtn">Mark as Ready</button>
        `;
    } else if (orderStatus === 'ready') {
        orderDetailsFooter.innerHTML = `
            <button type="button" class="cancel-btn" id="closeOrderDetailsBtn">Close</button>
            <button type="button" class="save-btn" id="markAsCompleteBtn">Mark as Complete</button>
        `;
    } else {
        orderDetailsFooter.innerHTML = `
            <button type="button" class="cancel-btn" id="closeOrderDetailsBtn">Close</button>
        `;
    }
    
    // Add event listeners to footer buttons
    setTimeout(() => {
        const closeBtn = document.getElementById('closeOrderDetailsBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (orderDetailsModal) orderDetailsModal.classList.remove('active');
            });
        }
        
        const markAsReadyBtn = document.getElementById('markAsReadyBtn');
        if (markAsReadyBtn) {
            markAsReadyBtn.addEventListener('click', () => {
                updateOrderStatus(order.id, 'ready');
                if (orderDetailsModal) orderDetailsModal.classList.remove('active');
            });
        }
        
        const markAsCompleteBtn = document.getElementById('markAsCompleteBtn');
        if (markAsCompleteBtn) {
            markAsCompleteBtn.addEventListener('click', () => {
                showPinVerification(order);
                if (orderDetailsModal) orderDetailsModal.classList.remove('active');
            });
        }
    }, 100);
    
    if (orderDetailsModal) orderDetailsModal.classList.add('active');
}

// Show PIN verification modal
function showPinVerification(order) {
    currentOrderForPin = order;
    if (pinInput) pinInput.value = '';
    if (pinError) pinError.style.display = 'none';
    if (pinModal) pinModal.classList.add('active');
}

// Verify PIN and update order status
function verifyOrderPin() {
    const enteredPin = pinInput ? pinInput.value : '';
    
    if (enteredPin.length !== 6) {
        if (pinError) {
            pinError.textContent = 'PIN must be 6 digits';
            pinError.style.display = 'block';
        }
        return;
    }
    
    if (enteredPin !== currentOrderForPin.pin) {
        if (pinError) {
            pinError.textContent = 'Incorrect PIN. Please try again.';
            pinError.style.display = 'block';
        }
        return;
    }
    
    // Update order status
    updateOrderStatus(currentOrderForPin.id, 'completed');
    if (pinModal) pinModal.classList.remove('active');
    showToast('Order marked as complete');
    currentOrderForPin = null;
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    const orderIndex = currentOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        const currentStatus = currentOrders[orderIndex].status || 'pending';
        
        // Prevent status regression
        const statusOrder = ['pending', 'ready', 'completed'];
        const currentStatusIndex = statusOrder.indexOf(currentStatus);
        const newStatusIndex = statusOrder.indexOf(newStatus);
        
        if (newStatusIndex < currentStatusIndex) {
            showToast(`Cannot change status from ${currentStatus} to ${newStatus}`, 'error');
            return;
        }
        
        if (currentStatus === 'completed') {
            showToast('Completed orders cannot be modified', 'error');
            return;
        }
        
        // Update in local state
        currentOrders[orderIndex].status = newStatus;
        
        // Update in main app orders (localStorage)
        const mainOrders = safeStorage.getJSON('orders') || [];
        const mainOrderIndex = mainOrders.findIndex(o => o.id === orderId);
        if (mainOrderIndex !== -1) {
            mainOrders[mainOrderIndex].status = newStatus;
            safeStorage.setJSON('orders', mainOrders);
        } else {
            // If not found in main orders, add it
            mainOrders.push(currentOrders[orderIndex]);
            safeStorage.setJSON('orders', mainOrders);
        }
        
        updateDashboardStats();
        displayAllOrders(currentFilterStatus);
        showToast(`Order status updated to ${newStatus}`);
        
        // Update real-time for customers
        updateRealTimeOrders();
    }
}

// Update real-time orders for customers
function updateRealTimeOrders() {
    const event = new Event('ordersUpdated');
    window.dispatchEvent(event);
}

// Display menu items
function displayMenuItems(filter = 'meals') {
    if (!itemsGrid) return;
    
    itemsGrid.innerHTML = '';
    
    let filteredItems = [...items];
    
    if (filter !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === filter);
    }
    
    if (filteredItems.length === 0) {
        itemsGrid.innerHTML = `
            <div class="empty-state">
                <p>No ${filter} items found</p>
            </div>
        `;
        return;
    }
    
    // Sort by availability (available first)
    filteredItems.sort((a, b) => b.available - a.available);
    
    filteredItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `item-card ${item.available ? '' : 'unavailable'}`;
        itemElement.innerHTML = `
            <div class="item-header">
                <h3 class="item-name">${item.name}</h3>
                <span class="item-price">${formatCurrency(item.price)}</span>
            </div>
            ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
            <div class="item-footer">
                <span class="item-category">${item.category}</span>
                <div class="item-actions">
                    <button class="item-btn edit-item-btn" data-item-id="${item.id}">Edit</button>
                    <button class="item-btn delete-item-btn" data-item-id="${item.id}">Delete</button>
                </div>
            </div>
        `;
        itemsGrid.appendChild(itemElement);
    });
    
    // Add event listeners to item buttons
    document.querySelectorAll('.edit-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = parseInt(btn.dataset.itemId);
            const item = items.find(i => i.id === itemId);
            if (item) {
                showEditItemModal(item);
            }
        });
    });
    
    document.querySelectorAll('.delete-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = parseInt(btn.dataset.itemId);
            const item = items.find(i => i.id === itemId);
            if (item) {
                showConfirmModal('deleteItem', itemId, `Are you sure you want to delete "${item.name}"?`);
            }
        });
    });
}

// Show add item modal
function showAddItemModal() {
    editingItemId = null;
    if (itemModalTitle) itemModalTitle.textContent = 'Add New Item';
    if (itemForm) itemForm.reset();
    if (document.getElementById('itemAvailable')) document.getElementById('itemAvailable').checked = true;
    if (itemCategory) itemCategory.value = 'meals';
    updateDescriptionField();
    if (itemModal) itemModal.classList.add('active');
}

// Show edit item modal
function showEditItemModal(item) {
    editingItemId = item.id;
    if (itemModalTitle) itemModalTitle.textContent = 'Edit Item';
    
    if (document.getElementById('itemName')) document.getElementById('itemName').value = item.name;
    if (itemDescription) itemDescription.value = item.description || '';
    if (document.getElementById('itemPrice')) document.getElementById('itemPrice').value = item.price;
    if (itemCategory) itemCategory.value = item.category;
    if (document.getElementById('itemAvailable')) document.getElementById('itemAvailable').checked = item.available;
    
    updateDescriptionField();
    if (itemModal) itemModal.classList.add('active');
}

// Update description field based on category
function updateDescriptionField() {
    const category = itemCategory ? itemCategory.value : 'meals';
    
    if (descriptionGroup) {
        if (category === 'drinks') {
            descriptionGroup.style.display = 'none';
            if (itemDescription) itemDescription.value = '';
        } else {
            descriptionGroup.style.display = 'block';
        }
    }
}

// Save item
function saveItem(formData) {
    if (editingItemId !== null) {
        // Edit existing item
        const itemIndex = items.findIndex(item => item.id === editingItemId);
        if (itemIndex !== -1) {
            items[itemIndex] = {
                ...items[itemIndex],
                ...formData
            };
            showToast('Item updated successfully');
        }
    } else {
        // Add new item
        const newItem = {
            id: Date.now(),
            ...formData
        };
        items.unshift(newItem);
        showToast('Item added successfully');
    }
    
    // Save to localStorage
    safeStorage.setJSON('managerItems', items);
    
    // Sync with main app
    syncItemsToMainApp();
    
    if (itemModal) itemModal.classList.remove('active');
    displayMenuItems();
    updateDashboardStats();
}

// Sync items to main app
function syncItemsToMainApp() {
    // Convert manager items to main app format
    const mainAppItems = items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: parseFloat(item.price),
        category: item.category,
        active: item.available
    }));
    
    safeStorage.setJSON('menuItems', mainAppItems);
    
    // Trigger real-time update for customers
    const event = new Event('menuItemsUpdated');
    window.dispatchEvent(event);
}

// Delete item
function deleteItem(itemId) {
    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
        items.splice(itemIndex, 1);
        safeStorage.setJSON('managerItems', items);
        
        // Sync with main app
        syncItemsToMainApp();
        
        showToast('Item deleted successfully');
        displayMenuItems();
        updateDashboardStats();
    }
}

// Display messages
function displayMessages() {
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="empty-state">
                <p>No messages yet</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first) and read status
    messages.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message-item ${message.read ? '' : 'unread'}`;
        messageElement.dataset.messageId = message.id;
        messageElement.innerHTML = `
            <div class="message-header">
                <div class="message-sender">${message.name}</div>
                <div class="message-date">${formatDate(message.timestamp)}</div>
            </div>
            <p class="message-preview">${message.message}</p>
        `;
        messagesContainer.appendChild(messageElement);
    });
    
    // Add event listeners to messages
    document.querySelectorAll('.message-item').forEach(item => {
        item.addEventListener('click', () => {
            const messageId = parseInt(item.dataset.messageId);
            const message = messages.find(m => m.id === messageId);
            if (message) {
                showMessageDetails(message);
                
                // Mark as read
                if (!message.read) {
                    message.read = true;
                    safeStorage.setJSON('contactMessages', messages);
                    item.classList.remove('unread');
                }
            }
        });
    });
}

// Show message details
function showMessageDetails(message) {
    if (!messageModalBody) return;
    
    messageModalBody.innerHTML = `
        <div class="message-details">
            <div class="message-detail-row">
                <label>From:</label>
                <p>${message.name} (${message.email})</p>
            </div>
            <div class="message-detail-row">
                <label>Date:</label>
                <p>${formatDate(message.timestamp)}</p>
            </div>
            <div class="message-detail-row">
                <label>Message:</label>
                <p>${message.message}</p>
            </div>
        </div>
    `;
    
    if (messageModal) messageModal.classList.add('active');
}

// Load manager data
function loadManagerData() {
    const currentEmailInput = document.getElementById('currentManagerEmail');
    if (currentEmailInput) {
        currentEmailInput.value = managerData.email;
    }
}

// Save manager data
function saveManagerData(formData) {
    const newEmail = document.getElementById('newManagerEmail') ? document.getElementById('newManagerEmail').value.trim() : '';
    const currentPassword = document.getElementById('currentManagerPassword') ? document.getElementById('currentManagerPassword').value : '';
    const newPassword = document.getElementById('newManagerPassword') ? document.getElementById('newManagerPassword').value : '';
    const confirmPassword = document.getElementById('confirmManagerPassword') ? document.getElementById('confirmManagerPassword').value : '';
    
    // Check if email is being changed
    if (newEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            showToast('Please enter a valid email address', 'error');
            return false;
        }
        
        managerData.email = newEmail;
    }
    
    // Check if password is being changed
    if (newPassword) {
        if (currentPassword !== managerData.password) {
            showToast('Current password is incorrect', 'error');
            return false;
        }
        
        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error');
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return false;
        }
        
        managerData.password = newPassword;
    }
    
    safeStorage.setJSON('managerData', managerData);
    return true;
}

// Download statement as CSV file
function downloadStatement() {
    const currentYear = new Date().getFullYear();
    const yearlyOrders = currentOrders.filter(order => 
        order.status === 'completed' && 
        new Date(order.timestamp).getFullYear() === currentYear
    );
    
    if (yearlyOrders.length === 0) {
        showToast('No completed orders for the current year', 'error');
        return;
    }
    
    // Prepare CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header
    csvContent += "Year,Total Completed Orders,Total Revenue\n";
    csvContent += `${currentYear},${yearlyStats.orders},R${yearlyStats.revenue}\n\n`;
    
    // Add table header
    csvContent += "Date,Order ID,Order Amount\n";
    
    // Add order data
    yearlyOrders.forEach(order => {
        const date = order.timestamp ? formatDate(order.timestamp) : 'Unknown';
        csvContent += `${date},${order.orderId || 'Unknown'},R${order.total || 0}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `M&T_${currentYear}_Statement.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    showToast(`Statement downloaded for ${currentYear}`);
}

// Show confirm modal
function showConfirmModal(action, data, message) {
    currentAction = action;
    currentActionData = data;
    if (confirmMessage) confirmMessage.textContent = message;
    if (confirmModal) confirmModal.classList.add('active');
}

// Handle confirmed action
function handleConfirmedAction() {
    switch (currentAction) {
        case 'deleteItem':
            deleteItem(currentActionData);
            break;
        case 'logout':
            // Clear session storage
            sessionStorage.removeItem('isManager');
            // Clear current user from localStorage
            safeStorage.removeItem('currentUser');
            // Redirect to main site
            window.location.href = 'index.html';
            break;
    }
    
    if (confirmModal) confirmModal.classList.remove('active');
    currentAction = null;
    currentActionData = null;
}

// Toggle sidebar function
function toggleSidebar() {
    if (!hamburgerBtn || !sidebar || !overlay) return;
    
    hamburgerBtn.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
}

// Close sidebar function
function closeSidebar() {
    if (!hamburgerBtn || !sidebar || !overlay) return;
    
    hamburgerBtn.classList.remove('active');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Handle navigation link clicks
function handleNavClick(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    
    if (targetId === 'logout') {
        showConfirmModal('logout', null, 'Are you sure you want to logout?');
        closeSidebar();
        return;
    }
    
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    const activeSection = document.getElementById(targetId);
    if (activeSection) {
        activeSection.classList.add('active');
        
        // Load data for the section
        if (targetId === 'dashboard') {
            updateDashboardStats();
        } else if (targetId === 'orders') {
            displayAllOrders('pending');
        } else if (targetId === 'items') {
            displayMenuItems('meals');
        } else if (targetId === 'messages') {
            displayMessages();
        } else if (targetId === 'details') {
            loadManagerData();
        }
    }
    
    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${targetId}`) {
            link.classList.add('active');
        }
    });
    
    // Close sidebar
    closeSidebar();
    
    // Update URL
    window.location.hash = targetId;
}

// Initialize
function initialize() {
    // Check manager access
    if (!checkManagerAccess()) return;
    
    // Load initial data
    loadOrders();
    updateDashboardStats();
    displayAllOrders('pending');
    displayMenuItems('meals');
    displayMessages();
    loadManagerData();
    
    // Sync items to main app on initial load
    syncItemsToMainApp();
    
    // Set active section based on URL hash
    const hash = window.location.hash.substring(1) || 'dashboard';
    const validSections = ['dashboard', 'orders', 'items', 'messages', 'details'];
    
    if (validSections.includes(hash)) {
        const link = document.querySelector(`.nav-link[href="#${hash}"]`);
        if (link) {
            handleNavClick.call(link, new Event('click'));
        }
    }
}

// Event listeners
if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleSidebar);
if (overlay) overlay.addEventListener('click', closeSidebar);

// Navigation links
navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
});

// Add new item button
if (addNewItemBtn) addNewItemBtn.addEventListener('click', showAddItemModal);

// Item form
if (itemForm) itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const category = itemCategory ? itemCategory.value : 'meals';
    const description = itemDescription ? itemDescription.value.trim() : '';
    
    const formData = {
        name: document.getElementById('itemName') ? document.getElementById('itemName').value.trim() : '',
        description: category === 'drinks' ? '' : description,
        price: parseFloat(document.getElementById('itemPrice') ? document.getElementById('itemPrice').value : 0),
        category: category,
        available: document.getElementById('itemAvailable') ? document.getElementById('itemAvailable').checked : true
    };
    
    saveItem(formData);
});

// Category change handler
if (itemCategory) itemCategory.addEventListener('change', updateDescriptionField);

// Close item modal
if (closeItemModal) closeItemModal.addEventListener('click', () => {
    if (itemModal) itemModal.classList.remove('active');
});

if (cancelItem) cancelItem.addEventListener('click', () => {
    if (itemModal) itemModal.classList.remove('active');
});

// Close item modal when clicking outside
if (itemModal) itemModal.addEventListener('click', (e) => {
    if (e.target === itemModal) {
        itemModal.classList.remove('active');
    }
});

// Close order details modal
if (closeOrderDetails) closeOrderDetails.addEventListener('click', () => {
    if (orderDetailsModal) orderDetailsModal.classList.remove('active');
});

// Close order details modal when clicking outside
if (orderDetailsModal) orderDetailsModal.addEventListener('click', (e) => {
    if (e.target === orderDetailsModal) {
        orderDetailsModal.classList.remove('active');
    }
});

// Close message modal
if (closeMessageModal) closeMessageModal.addEventListener('click', () => {
    if (messageModal) messageModal.classList.remove('active');
});

// Close message modal when clicking outside
if (messageModal) messageModal.addEventListener('click', (e) => {
    if (e.target === messageModal) {
        messageModal.classList.remove('active');
    }
});

// Order filters
if (orderFilters) {
    orderFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            orderFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayAllOrders(btn.dataset.status);
        });
    });
}

// Item filters
if (itemFilterBtns) {
    itemFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            itemFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayMenuItems(btn.dataset.filter);
        });
    });
}

// Order search
if (orderSearch) orderSearch.addEventListener('input', (e) => {
    displayAllOrders(currentFilterStatus);
});

// Manager form
if (managerForm) managerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('newManagerEmail') ? document.getElementById('newManagerEmail').value.trim() : managerData.email
    };
    
    if (saveManagerData(formData)) {
        showToast('Settings saved successfully');
        // Clear form fields
        if (document.getElementById('newManagerEmail')) document.getElementById('newManagerEmail').value = '';
        if (document.getElementById('currentManagerPassword')) document.getElementById('currentManagerPassword').value = '';
        if (document.getElementById('newManagerPassword')) document.getElementById('newManagerPassword').value = '';
        if (document.getElementById('confirmManagerPassword')) document.getElementById('confirmManagerPassword').value = '';
        // Update current email display
        loadManagerData();
    }
});

// Cancel changes
if (cancelChanges) cancelChanges.addEventListener('click', () => {
    loadManagerData();
    // Clear form fields
    if (document.getElementById('newManagerEmail')) document.getElementById('newManagerEmail').value = '';
    if (document.getElementById('currentManagerPassword')) document.getElementById('currentManagerPassword').value = '';
    if (document.getElementById('newManagerPassword')) document.getElementById('newManagerPassword').value = '';
    if (document.getElementById('confirmManagerPassword')) document.getElementById('confirmManagerPassword').value = '';
    showToast('Changes cancelled');
});

// Confirm modal
if (closeConfirmModal) closeConfirmModal.addEventListener('click', () => {
    if (confirmModal) confirmModal.classList.remove('active');
});

if (cancelConfirm) cancelConfirm.addEventListener('click', () => {
    if (confirmModal) confirmModal.classList.remove('active');
});

if (confirmAction) confirmAction.addEventListener('click', handleConfirmedAction);

// Close confirm modal when clicking outside
if (confirmModal) confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        confirmModal.classList.remove('active');
    }
});

// PIN modal functionality
if (closePinModal) closePinModal.addEventListener('click', () => {
    if (pinModal) pinModal.classList.remove('active');
    currentOrderForPin = null;
});

if (cancelPin) cancelPin.addEventListener('click', () => {
    if (pinModal) pinModal.classList.remove('active');
    currentOrderForPin = null;
});

// Verify PIN
if (verifyPin) verifyPin.addEventListener('click', verifyOrderPin);

// PIN input validation
if (pinInput) pinInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
    if (e.target.value.length > 6) {
        e.target.value = e.target.value.slice(0, 6);
    }
    if (pinError) pinError.style.display = 'none';
});

// Close PIN modal when clicking outside
if (pinModal) pinModal.addEventListener('click', (e) => {
    if (e.target === pinModal) {
        pinModal.classList.remove('active');
        currentOrderForPin = null;
    }
});

// Download statement button
if (downloadStatementBtn) downloadStatementBtn.addEventListener('click', downloadStatement);

// Close modals with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (itemModal && itemModal.classList.contains('active')) {
            itemModal.classList.remove('active');
        }
        if (orderDetailsModal && orderDetailsModal.classList.contains('active')) {
            orderDetailsModal.classList.remove('active');
        }
        if (messageModal && messageModal.classList.contains('active')) {
            messageModal.classList.remove('active');
        }
        if (confirmModal && confirmModal.classList.contains('active')) {
            confirmModal.classList.remove('active');
        }
        if (pinModal && pinModal.classList.contains('active')) {
            pinModal.classList.remove('active');
            currentOrderForPin = null;
        }
    }
});

// Handle window resize for desktop warning
function checkDevice() {
    const desktopWarning = document.getElementById('desktopWarning');
    const mobileContent = document.getElementById('mobileContent');
    
    if (!desktopWarning || !mobileContent) return;
    
    if (window.innerWidth >= 1025) {
        desktopWarning.style.display = 'flex';
        mobileContent.style.display = 'none';
    } else {
        desktopWarning.style.display = 'none';
        mobileContent.style.display = 'block';
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initialize();
    checkDevice();
});

// Handle browser back/forward buttons
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    const validSections = ['dashboard', 'orders', 'items', 'messages', 'details'];
    
    if (validSections.includes(hash)) {
        const link = document.querySelector(`.nav-link[href="#${hash}"]`);
        if (link) {
            handleNavClick.call(link, new Event('click'));
        }
    }
});

// Listen for real-time updates
window.addEventListener('ordersUpdated', function() {
    loadOrders();
    updateDashboardStats();
    if (document.getElementById('orders').classList.contains('active')) {
        displayAllOrders(currentFilterStatus);
    }
});

window.addEventListener('messagesUpdated', function() {
    messages = safeStorage.getJSON('contactMessages') || [];
    if (document.getElementById('messages').classList.contains('active')) {
        displayMessages();
    }
});

// Initial check and resize listener
window.addEventListener('resize', checkDevice);