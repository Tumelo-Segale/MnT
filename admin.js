// Get DOM elements
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.page-section');
const logoutLink = document.getElementById('logoutLink');

// Dashboard elements
const totalRevenue = document.getElementById('totalRevenue');
const completedOrders = document.getElementById('completedOrders');
const totalProfit = document.getElementById('totalProfit');
const currentYear = document.getElementById('currentYear');
const yearlyRevenue = document.getElementById('yearlyRevenue');
const yearlyOrders = document.getElementById('yearlyOrders');
const yearlyProfit = document.getElementById('yearlyProfit');
const yearlyLabel = document.getElementById('yearlyLabel');
const downloadStatement = document.getElementById('downloadStatement');
const resetStats = document.getElementById('resetStats');

// Orders elements
const ordersContainer = document.getElementById('ordersContainer');
const orderSearch = document.getElementById('orderSearch');

// Details elements
const adminForm = document.getElementById('adminForm');
const cancelChanges = document.getElementById('cancelChanges');

// Modal elements
const orderDetailsModal = document.getElementById('orderDetailsModal');
const closeOrderDetails = document.getElementById('closeOrderDetails');
const orderDetailsBody = document.getElementById('orderDetailsBody');

const confirmModal = document.getElementById('confirmModal');
const closeConfirmModal = document.getElementById('closeConfirmModal');
const cancelConfirm = document.getElementById('cancelConfirm');
const confirmAction = document.getElementById('confirmAction');
const confirmMessage = document.getElementById('confirmMessage');

// Toast element
const toast = document.getElementById('toast');

// State
let adminData = JSON.parse(localStorage.getItem('adminData')) || {
    email: 'admin@admin.com',
    password: 'admin123'
};

let orders = JSON.parse(localStorage.getItem('orders')) || [];
let yearlyStats = JSON.parse(localStorage.getItem('yearlyStats')) || {};
let statsResetCheck = JSON.parse(localStorage.getItem('statsResetCheck')) || {};

// Show toast message
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
        toast.className = 'toast';
    }, 2000);
}

// Format date to DD MMM YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
}

// Format currency
function formatCurrency(amount) {
    return `R${parseFloat(amount).toFixed(2)}`;
}

// Calculate profit (5% of amount)
function calculateProfit(amount) {
    return amount * 0.05;
}

// Check and reset yearly stats if new year
function checkYearlyReset() {
    const currentYearVal = new Date().getFullYear();
    const lastResetYear = statsResetCheck.lastResetYear || currentYearVal;
    
    if (currentYearVal > lastResetYear) {
        showResetConfirmation(currentYearVal, lastResetYear);
    }
}

// Show reset confirmation
function showResetConfirmation(currentYearVal, lastResetYear) {
    confirmMessage.textContent = `New year detected (${currentYearVal}). Would you like to reset yearly statistics? This will clear all data for ${lastResetYear}.`;
    confirmModal.classList.add('active');
    
    // Store reset info
    localStorage.setItem('pendingYearReset', JSON.stringify({
        currentYear: currentYearVal,
        lastResetYear: lastResetYear
    }));
}

// Reset yearly stats
function resetYearlyStats() {
    const resetInfo = JSON.parse(localStorage.getItem('pendingYearReset'));
    if (!resetInfo) return;
    
    const { currentYear: currentYearVal, lastResetYear } = resetInfo;
    
    // Archive old yearly stats
    const archivedStats = JSON.parse(localStorage.getItem('archivedStats')) || {};
    archivedStats[lastResetYear] = yearlyStats[lastResetYear] || {};
    localStorage.setItem('archivedStats', JSON.stringify(archivedStats));
    
    // Reset current yearly stats
    yearlyStats[currentYearVal] = {
        revenue: 0,
        orders: 0,
        profit: 0
    };
    
    // Update reset check
    statsResetCheck = {
        lastResetYear: currentYearVal,
        lastResetDate: new Date().toISOString()
    };
    
    localStorage.setItem('yearlyStats', JSON.stringify(yearlyStats));
    localStorage.setItem('statsResetCheck', JSON.stringify(statsResetCheck));
    localStorage.removeItem('pendingYearReset');
    
    showToast(`Yearly statistics reset for ${currentYearVal}`);
    updateDashboardStats();
}

// Update dashboard stats
function updateDashboardStats() {
    const currentYearVal = new Date().getFullYear();
    
    // Get all completed orders
    const completedOrdersList = orders.filter(order => 
        order.status && order.status.toLowerCase() === 'completed'
    );
    
    // Calculate totals
    const totalRevenueAmount = completedOrdersList.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalProfitAmount = calculateProfit(totalRevenueAmount);
    const totalCompletedOrders = completedOrdersList.length;
    
    // Update main stats
    totalRevenue.textContent = formatCurrency(totalRevenueAmount);
    completedOrders.textContent = totalCompletedOrders;
    totalProfit.textContent = formatCurrency(totalProfitAmount);
    currentYear.textContent = currentYearVal;
    
    // Update yearly stats
    const yearStats = yearlyStats[currentYearVal] || { revenue: 0, orders: 0, profit: 0 };
    yearlyRevenue.textContent = formatCurrency(yearStats.revenue || 0);
    yearlyOrders.textContent = yearStats.orders || 0;
    yearlyProfit.textContent = formatCurrency(yearStats.profit || 0);
    yearlyLabel.textContent = `${currentYearVal} revenue`;
    
    // Save updated yearly stats
    yearlyStats[currentYearVal] = {
        revenue: yearStats.revenue || 0,
        orders: yearStats.orders || 0,
        profit: yearStats.profit || 0
    };
    localStorage.setItem('yearlyStats', JSON.stringify(yearlyStats));
}

// Display completed orders
function displayCompletedOrders() {
    ordersContainer.innerHTML = '';
    
    const completedOrdersList = orders.filter(order => 
        order.status && order.status.toLowerCase() === 'completed'
    );
    
    if (completedOrdersList.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <p>No completed orders found</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    completedOrdersList.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
        const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
        return dateB - dateA;
    });
    
    completedOrdersList.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.dataset.orderId = order.id;
        orderElement.innerHTML = `
            <div class="order-item-header">
                <h4>${order.orderId || 'Unknown ID'}</h4>
                <span class="order-date">${order.timestamp ? formatDate(order.timestamp) : 'Unknown date'}</span>
            </div>
            <div class="order-item-body">
                <p><strong>Customer:</strong> ${order.userEmail || 'N/A'}</p>
                <p><strong>Total:</strong> ${formatCurrency(order.total || 0)}</p>
                <p><strong>Profit (5%):</strong> ${formatCurrency(calculateProfit(order.total || 0))}</p>
            </div>
            <div class="order-actions">
                <button class="status-btn view-order-btn" data-order-id="${order.id}">View Details</button>
            </div>
        `;
        ordersContainer.appendChild(orderElement);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = parseInt(btn.dataset.orderId);
            const order = orders.find(o => o.id === orderId);
            if (order) {
                showOrderDetails(order);
            }
        });
    });
}

// Show order details
function showOrderDetails(order) {
    const profit = calculateProfit(order.total || 0);
    
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
                    <span class="order-status-display status-completed">Completed</span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Total Amount:</div>
                <div class="detail-value">${formatCurrency(order.total || 0)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Profit (5%):</div>
                <div class="detail-value">${formatCurrency(profit)}</div>
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
    
    orderDetailsModal.classList.add('active');
}

// Generate and download yearly statement
function downloadYearlyStatement() {
    const currentYearVal = new Date().getFullYear();
    const completedOrdersList = orders.filter(order => 
        order.status && order.status.toLowerCase() === 'completed' &&
        order.timestamp && new Date(order.timestamp).getFullYear() === currentYearVal
    );
    
    if (completedOrdersList.length === 0) {
        showToast('No completed orders for the current year', 'error');
        return;
    }
    
    // Calculate yearly totals
    const yearlyRevenueAmount = completedOrdersList.reduce((sum, order) => sum + (order.total || 0), 0);
    const yearlyProfitAmount = calculateProfit(yearlyRevenueAmount);
    
    // Create CSV content
    let csvContent = "Yearly Statement\n\n";
    csvContent += `Year: ${currentYearVal}\n`;
    csvContent += `Total Completed Orders: ${completedOrdersList.length}\n`;
    csvContent += `Total Revenue Generated: ${formatCurrency(yearlyRevenueAmount)}\n`;
    csvContent += `Total Transactional Profit: ${formatCurrency(yearlyProfitAmount)}\n\n`;
    
    csvContent += "Order Details:\n";
    csvContent += "Date,Order ID,Order Amount,5% Transactional Profit\n";
    
    completedOrdersList.forEach(order => {
        const date = order.timestamp ? formatDate(order.timestamp) : 'Unknown';
        const orderAmount = order.total || 0;
        const profit = calculateProfit(orderAmount);
        
        csvContent += `${date},${order.orderId || 'N/A'},${orderAmount.toFixed(2)},${profit.toFixed(2)}\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `M&T_Statement_${currentYearVal}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Yearly statement downloaded successfully');
}

// Load admin data
function loadAdminData() {
    document.getElementById('currentAdminEmail').value = adminData.email;
}

// Save admin data
function saveAdminData() {
    const newEmail = document.getElementById('newAdminEmail').value.trim();
    const currentPassword = document.getElementById('currentAdminPassword').value;
    const newPassword = document.getElementById('newAdminPassword').value;
    const confirmPassword = document.getElementById('confirmAdminPassword').value;
    
    // Check if email is being changed
    if (newEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            showToast('Please enter a valid email address', 'error');
            return false;
        }
        
        adminData.email = newEmail;
    }
    
    // Check if password is being changed
    if (newPassword) {
        if (currentPassword !== adminData.password) {
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
        
        adminData.password = newPassword;
    }
    
    localStorage.setItem('adminData', JSON.stringify(adminData));
    
    // Update current user in localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.email === 'admin@admin.com') {
        currentUser.email = adminData.email;
        currentUser.password = adminData.password;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    return true;
}

// Toggle sidebar function
function toggleSidebar() {
    hamburgerBtn.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
}

// Close sidebar function
function closeSidebar() {
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
        // Clear current user from localStorage
        localStorage.removeItem('currentUser');
        // Redirect to main site
        window.location.href = 'index.html';
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
            displayCompletedOrders();
        } else if (targetId === 'details') {
            loadAdminData();
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
    // Check for yearly reset
    checkYearlyReset();
    
    // Update stats
    updateDashboardStats();
    displayCompletedOrders();
    loadAdminData();
    
    // Set active section based on URL hash
    const hash = window.location.hash.substring(1) || 'dashboard';
    const validSections = ['dashboard', 'orders', 'details'];
    
    if (validSections.includes(hash)) {
        const link = document.querySelector(`.nav-link[href="#${hash}"]`);
        if (link) {
            handleNavClick.call(link, new Event('click'));
        }
    }
}

// Event listeners
hamburgerBtn.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', closeSidebar);

// Navigation links
navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
});

// Admin form
adminForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (saveAdminData()) {
        showToast('Settings saved successfully');
        // Clear form fields
        document.getElementById('newAdminEmail').value = '';
        document.getElementById('currentAdminPassword').value = '';
        document.getElementById('newAdminPassword').value = '';
        document.getElementById('confirmAdminPassword').value = '';
        // Update current email display
        loadAdminData();
    }
});

// Cancel changes
cancelChanges?.addEventListener('click', () => {
    loadAdminData();
    // Clear form fields
    document.getElementById('newAdminEmail').value = '';
    document.getElementById('currentAdminPassword').value = '';
    document.getElementById('newAdminPassword').value = '';
    document.getElementById('confirmAdminPassword').value = '';
    showToast('Changes cancelled');
});

// Download statement
downloadStatement?.addEventListener('click', downloadYearlyStatement);

// Reset stats
resetStats?.addEventListener('click', () => {
    confirmMessage.textContent = 'Are you sure you want to reset yearly statistics? This will clear all data for the current year and cannot be undone.';
    confirmModal.classList.add('active');
});

// Confirm modal
closeConfirmModal?.addEventListener('click', () => {
    confirmModal.classList.remove('active');
});

cancelConfirm?.addEventListener('click', () => {
    confirmModal.classList.remove('active');
});

confirmAction?.addEventListener('click', () => {
    if (confirmMessage.textContent.includes('New year detected')) {
        resetYearlyStats();
    } else {
        // Manual reset
        const currentYearVal = new Date().getFullYear();
        yearlyStats[currentYearVal] = { revenue: 0, orders: 0, profit: 0 };
        localStorage.setItem('yearlyStats', JSON.stringify(yearlyStats));
        updateDashboardStats();
        showToast('Yearly statistics reset');
    }
    confirmModal.classList.remove('active');
});

// Close confirm modal when clicking outside
confirmModal?.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        confirmModal.classList.remove('active');
    }
});

// Close order details modal
closeOrderDetails?.addEventListener('click', () => {
    orderDetailsModal.classList.remove('active');
});

// Close order details modal when clicking outside
orderDetailsModal?.addEventListener('click', (e) => {
    if (e.target === orderDetailsModal) {
        orderDetailsModal.classList.remove('active');
    }
});

// Order search
orderSearch?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const orderElements = document.querySelectorAll('.order-item');
    
    let hasResults = false;
    
    orderElements.forEach(element => {
        const orderId = element.querySelector('h4').textContent.toLowerCase();
        const customer = element.querySelector('.order-item-body p:first-child').textContent.toLowerCase();
        
        if (orderId.includes(searchTerm) || customer.includes(searchTerm)) {
            element.style.display = 'block';
            hasResults = true;
        } else {
            element.style.display = 'none';
        }
    });
    
    if (!hasResults) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <p>No orders matching your search</p>
            </div>
        `;
    }
});

// Close modals with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (orderDetailsModal.classList.contains('active')) {
            orderDetailsModal.classList.remove('active');
        }
        if (confirmModal.classList.contains('active')) {
            confirmModal.classList.remove('active');
        }
    }
});

// Handle window resize for desktop warning
function checkDevice() {
    const desktopWarning = document.getElementById('desktopWarning');
    const mobileContent = document.getElementById('mobileContent');
    
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
    const validSections = ['dashboard', 'orders', 'details'];
    
    if (validSections.includes(hash)) {
        const link = document.querySelector(`.nav-link[href="#${hash}"]`);
        if (link) {
            handleNavClick.call(link, new Event('click'));
        }
    }
});

// Initial check and resize listener
window.addEventListener('resize', checkDevice);

// Listen for order updates from other sites
window.addEventListener('ordersUpdated', function() {
    orders = JSON.parse(localStorage.getItem('orders')) || [];
    updateDashboardStats();
    if (document.getElementById('orders').classList.contains('active')) {
        displayCompletedOrders();
    }
});