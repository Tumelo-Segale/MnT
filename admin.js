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
const yearRevenue = document.getElementById('yearRevenue');
const downloadStatementBtn = document.getElementById('downloadStatementBtn');

// Orders elements
const ordersContainer = document.getElementById('ordersContainer');
const orderSearch = document.getElementById('orderSearch');

// Details elements
const adminForm = document.getElementById('adminForm');
const cancelChanges = document.getElementById('cancelChanges');

// Modal elements
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
    password: 'admin123',
    name: 'Tumelo Segale'
};

let allOrders = [];
let yearlyStats = JSON.parse(localStorage.getItem('yearlyStats')) || {
    year: new Date().getFullYear(),
    revenue: 0,
    orders: 0,
    profit: 0
};

// Show toast message
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.style.background = type === 'success' ? '#28a745' : '#dc3545';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
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

// Calculate 5% profit
function calculateProfit(amount) {
    return parseFloat((amount * 0.05).toFixed(2));
}

// Check if within operating hours
function isWithinOperatingHours() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours + (minutes / 60);
    
    // Monday - Sunday: 09:00 - 20:00 (as per home page)
    return currentTime >= 9 && currentTime < 20;
}

// Load orders from main app
function loadOrders() {
    allOrders = JSON.parse(localStorage.getItem('orders')) || [];
}

// Update dashboard stats
function updateDashboardStats() {
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Filter completed orders
    const completedOrdersList = allOrders.filter(order => 
        order.status === 'completed'
    );
    
    // Calculate total revenue and profit
    const totalRevenueAmount = completedOrdersList.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalProfitAmount = completedOrdersList.reduce((sum, order) => sum + calculateProfit(order.total || 0), 0);
    
    // Filter by current year
    const yearlyOrders = completedOrdersList.filter(order => {
        const orderYear = new Date(order.timestamp).getFullYear();
        return orderYear === currentYear;
    });
    
    const yearlyRevenueAmount = yearlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Update display
    totalRevenue.textContent = formatCurrency(totalRevenueAmount);
    completedOrders.textContent = completedOrdersList.length;
    totalProfit.textContent = formatCurrency(totalProfitAmount);
    yearRevenue.textContent = formatCurrency(yearlyRevenueAmount);
    
    // Update yearly stats
    yearlyStats = {
        year: currentYear,
        revenue: yearlyRevenueAmount,
        orders: yearlyOrders.length,
        profit: calculateProfit(yearlyRevenueAmount)
    };
    
    localStorage.setItem('yearlyStats', JSON.stringify(yearlyStats));
}

// Display completed orders
function displayCompletedOrders() {
    ordersContainer.innerHTML = '';
    
    const searchTerm = orderSearch.value.toLowerCase();
    const completedOrdersList = allOrders.filter(order => 
        order.status === 'completed' &&
        (!searchTerm || (order.orderId && order.orderId.toLowerCase().includes(searchTerm)))
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
    completedOrdersList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    completedOrdersList.forEach(order => {
        const profit = calculateProfit(order.total || 0);
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.innerHTML = `
            <div class="order-item-header">
                <h4>${order.orderId || 'Unknown ID'}</h4>
                <span class="order-date">${order.timestamp ? formatDate(order.timestamp) : 'Unknown date'}</span>
            </div>
            <div class="order-item-body">
                <p><strong>Customer:</strong> ${order.userEmail || 'N/A'}</p>
                <p><strong>Date:</strong> ${order.timestamp ? formatDate(order.timestamp) : 'N/A'}</p>
                <p><strong>Total:</strong> ${formatCurrency(order.total || 0)}</p>
                <p><strong>Profit (5%):</strong> <span class="order-profit">${formatCurrency(profit)}</span></p>
            </div>
        `;
        ordersContainer.appendChild(orderElement);
    });
}

// Search orders
function searchOrders() {
    displayCompletedOrders();
}

// Load admin data
function loadAdminData() {
    document.getElementById('currentAdminEmail').value = adminData.email;
}

// Save admin data
function saveAdminData(e) {
    e.preventDefault();
    
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
    showToast('Admin details updated successfully');
    
    // Clear form fields
    document.getElementById('newAdminEmail').value = '';
    document.getElementById('currentAdminPassword').value = '';
    document.getElementById('newAdminPassword').value = '';
    document.getElementById('confirmAdminPassword').value = '';
    
    // Update current email display
    loadAdminData();
    
    return true;
}

// Download statement as CSV file
function downloadStatement() {
    const currentYear = new Date().getFullYear();
    const yearlyOrders = allOrders.filter(order => 
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
    csvContent += "Year,Total Completed Orders,Total Revenue,Total Profit\n";
    csvContent += `${currentYear},${yearlyStats.orders},${yearlyStats.revenue},${yearlyStats.profit}\n\n`;
    
    // Add table header
    csvContent += "Date,Order ID,Order Amount,5% Transactional Profit\n";
    
    // Add order data
    yearlyOrders.forEach(order => {
        const date = order.timestamp ? formatDate(order.timestamp) : 'Unknown';
        const profit = calculateProfit(order.total || 0);
        csvContent += `${date},${order.orderId || 'Unknown'},${order.total || 0},${profit}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `M&T_Statement_${currentYear}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    showToast(`Statement downloaded for ${currentYear}`);
}

// Show confirm modal for logout
function showLogoutConfirmModal() {
    confirmMessage.textContent = 'Are you sure you want to logout?';
    confirmModal.classList.add('active');
    
    // Set up confirm action
    confirmAction.onclick = () => {
        handleLogout();
    };
}

// Handle logout
function handleLogout() {
    // Clear current user from localStorage
    localStorage.removeItem('currentUser');
    // Redirect to main site
    window.location.href = 'index.html';
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
        showLogoutConfirmModal();
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
    // Load initial data
    loadOrders();
    updateDashboardStats();
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
adminForm?.addEventListener('submit', saveAdminData);

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

// Order search
orderSearch?.addEventListener('input', searchOrders);

// Download statement button
downloadStatementBtn?.addEventListener('click', downloadStatement);

// Confirm modal
closeConfirmModal?.addEventListener('click', () => {
    confirmModal.classList.remove('active');
});
cancelConfirm?.addEventListener('click', () => {
    confirmModal.classList.remove('active');
});

// Close confirm modal when clicking outside
confirmModal?.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        confirmModal.classList.remove('active');
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

// Listen for real-time order updates
window.addEventListener('ordersUpdated', function() {
    loadOrders();
    updateDashboardStats();
    if (document.getElementById('orders').classList.contains('active')) {
        displayCompletedOrders();
    }
});

// Initial check and resize listener
window.addEventListener('resize', checkDevice);