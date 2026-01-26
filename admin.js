// Check if user is admin
function checkAdminAccess() {
    // Check session storage for admin flag
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    
    if (!isAdmin) {
        // Check if current user is admin
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.email === 'admin@admin.com' && currentUser.password === 'admin123') {
            sessionStorage.setItem('isAdmin', 'true');
            return true;
        }
        
        // Redirect to main site if not admin
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

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
const monthRevenue = document.getElementById('monthRevenue');
const monthOrders = document.getElementById('monthOrders');

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

// Statement Modal elements
const statementModal = document.getElementById('statementModal');
const closeStatementModal = document.getElementById('closeStatementModal');
const cancelStatement = document.getElementById('cancelStatement');
const confirmStatement = document.getElementById('confirmStatement');
const statementType = document.getElementById('statementType');

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

let monthlyStats = JSON.parse(localStorage.getItem('monthlyStats')) || {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    revenue: 0,
    orders: 0,
    profit: 0
};

// Performance-optimized order storage
class OrderManager {
    constructor() {
        this.orders = [];
        this.orderMap = new Map(); // For faster lookups
        this.initialized = false;
    }
    
    init(orders) {
        this.orders = orders || [];
        this.orderMap.clear();
        // Create index for faster searching
        this.orders.forEach(order => {
            if (order.id) this.orderMap.set(order.id, order);
        });
        this.initialized = true;
    }
    
    addOrder(order) {
        if (!order.id) order.id = Date.now();
        this.orders.push(order);
        this.orderMap.set(order.id, order);
        // Performance: Keep only last 10,000 orders in memory for dashboard
        if (this.orders.length > 10000) {
            const removed = this.orders.shift();
            if (removed.id) this.orderMap.delete(removed.id);
        }
    }
    
    getOrder(id) {
        return this.orderMap.get(id);
    }
    
    getCompletedOrders() {
        return this.orders.filter(order => order.status === 'completed');
    }
    
    getOrdersByYear(year) {
        return this.orders.filter(order => {
            if (order.status !== 'completed') return false;
            const orderYear = new Date(order.timestamp).getFullYear();
            return orderYear === year;
        });
    }
    
    getOrdersByMonth(year, month) {
        return this.orders.filter(order => {
            if (order.status !== 'completed') return false;
            const orderDate = new Date(order.timestamp);
            return orderDate.getFullYear() === year && orderDate.getMonth() === month;
        });
    }
    
    searchOrders(searchTerm) {
        const term = searchTerm.toLowerCase();
        return this.orders.filter(order => 
            order.status === 'completed' &&
            order.orderId && 
            order.orderId.toLowerCase().includes(term)
        );
    }
}

const orderManager = new OrderManager();

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

// Performance-optimized statistics calculation
class StatsCalculator {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 60000; // Cache for 1 minute
    }
    
    getCacheKey(type, ...args) {
        return `${type}_${args.join('_')}`;
    }
    
    calculateYearlyStats(year, orders) {
        const cacheKey = this.getCacheKey('yearly', year);
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        
        const yearlyOrders = orders.filter(order => {
            const orderYear = new Date(order.timestamp).getFullYear();
            return orderYear === year;
        });
        
        const revenue = yearlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const profit = parseFloat((revenue * 0.05).toFixed(2));
        
        const stats = {
            year: year,
            revenue: revenue,
            orders: yearlyOrders.length,
            profit: profit
        };
        
        this.cache.set(cacheKey, {
            data: stats,
            timestamp: Date.now()
        });
        
        return stats;
    }
    
    calculateMonthlyStats(year, month, orders) {
        const cacheKey = this.getCacheKey('monthly', year, month);
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        
        const monthlyOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getFullYear() === year && 
                   orderDate.getMonth() === month;
        });
        
        const revenue = monthlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const profit = parseFloat((revenue * 0.05).toFixed(2));
        
        const stats = {
            year: year,
            month: month,
            revenue: revenue,
            orders: monthlyOrders.length,
            profit: profit
        };
        
        this.cache.set(cacheKey, {
            data: stats,
            timestamp: Date.now()
        });
        
        return stats;
    }
}

const statsCalculator = new StatsCalculator();

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

// Calculate 5% profit
function calculateProfit(amount) {
    return parseFloat((amount * 0.05).toFixed(2));
}

// Load orders from main app
function loadOrders() {
    const orders = safeStorage.getJSON('orders') || [];
    orderManager.init(orders);
}

// Update dashboard stats with caching
function updateDashboardStats() {
    // Get current year and month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Get completed orders
    const completedOrdersList = orderManager.getCompletedOrders();
    
    // Calculate yearly stats
    const yearlyOrders = orderManager.getOrdersByYear(currentYear);
    const yearlyStats = statsCalculator.calculateYearlyStats(currentYear, yearlyOrders);
    
    // Calculate monthly stats
    const monthlyStats = statsCalculator.calculateMonthlyStats(currentYear, currentMonth, yearlyOrders);
    
    // Update display with performance optimization
    requestAnimationFrame(() => {
        if (completedOrders) completedOrders.textContent = completedOrdersList.length;
        if (totalProfit) totalProfit.textContent = formatCurrency(yearlyStats.profit);
        if (yearRevenue) yearRevenue.textContent = formatCurrency(yearlyStats.revenue);
        
        // New monthly stats
        if (monthRevenue) monthRevenue.textContent = formatCurrency(monthlyStats.revenue);
        if (monthOrders) monthOrders.textContent = monthlyStats.orders;
    });
    
    // Update stored stats
    safeStorage.setJSON('yearlyStats', yearlyStats);
    safeStorage.setJSON('monthlyStats', monthlyStats);
}

// Display completed orders (without customer email)
function displayCompletedOrders() {
    if (!ordersContainer) return;
    
    ordersContainer.innerHTML = '';
    
    const searchTerm = orderSearch ? orderSearch.value.toLowerCase() : '';
    
    // Use optimized search
    const completedOrdersList = searchTerm ? 
        orderManager.searchOrders(searchTerm) : 
        orderManager.getCompletedOrders();
    
    if (completedOrdersList.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state">
                <p>${searchTerm ? 'No orders found' : 'No completed orders found'}</p>
            </div>
        `;
        return;
    }
    
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Sort by date (newest first)
    completedOrdersList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Limit display to 50 orders for performance
    const displayOrders = completedOrdersList.slice(0, 50);
    
    displayOrders.forEach(order => {
        const profit = calculateProfit(order.total || 0);
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        // REMOVED customer email from display
        orderElement.innerHTML = `
            <div class="order-item-header">
                <h4>${order.orderId || 'Unknown ID'}</h4>
                <span class="order-date">${order.timestamp ? formatDate(order.timestamp) : 'Unknown date'}</span>
            </div>
            <div class="order-item-body">
                <p><strong>Date:</strong> ${order.timestamp ? formatDate(order.timestamp) : 'N/A'}</p>
                <p><strong>Total:</strong> ${formatCurrency(order.total || 0)}</p>
                <p><strong>Profit (5%):</strong> <span class="order-profit">${formatCurrency(profit)}</span></p>
            </div>
        `;
        fragment.appendChild(orderElement);
    });
    
    ordersContainer.appendChild(fragment);
    
    // Show message if more orders exist
    if (completedOrdersList.length > 50) {
        const message = document.createElement('div');
        message.className = 'empty-state';
        message.innerHTML = `<p>Showing 50 of ${completedOrdersList.length} orders. Use search to find specific orders.</p>`;
        ordersContainer.appendChild(message);
    }
}

// Search orders
function searchOrders() {
    displayCompletedOrders();
}

// Load admin data
function loadAdminData() {
    const currentEmailInput = document.getElementById('currentAdminEmail');
    if (currentEmailInput) {
        currentEmailInput.value = adminData.email;
    }
}

// Save admin data
function saveAdminData(e) {
    e.preventDefault();
    
    const newEmail = document.getElementById('newAdminEmail') ? document.getElementById('newAdminEmail').value.trim() : '';
    const currentPassword = document.getElementById('currentAdminPassword') ? document.getElementById('currentAdminPassword').value : '';
    const newPassword = document.getElementById('newAdminPassword') ? document.getElementById('newAdminPassword').value : '';
    const confirmPassword = document.getElementById('confirmAdminPassword') ? document.getElementById('confirmAdminPassword').value : '';
    
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
    
    safeStorage.setJSON('adminData', adminData);
    showToast('Admin details updated successfully');
    
    // Clear form fields
    if (document.getElementById('newAdminEmail')) document.getElementById('newAdminEmail').value = '';
    if (document.getElementById('currentAdminPassword')) document.getElementById('currentAdminPassword').value = '';
    if (document.getElementById('newAdminPassword')) document.getElementById('newAdminPassword').value = '';
    if (document.getElementById('confirmAdminPassword')) document.getElementById('confirmAdminPassword').value = '';
    
    // Update current email display
    loadAdminData();
    
    return true;
}

// Show statement selection modal
function showStatementModal() {
    if (statementModal) {
        statementModal.classList.add('active');
    }
}

// Download statement as Excel file based on selection
function downloadStatement(statementType) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    let filteredOrders = [];
    let fileName = '';
    let sheetName = '';
    let title = '';
    
    if (statementType === 'monthly') {
        filteredOrders = orderManager.getOrdersByMonth(currentYear, currentMonth);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = monthNames[currentMonth];
        fileName = `M&T_Admin_Statement_${monthName}_${currentYear}`;
        sheetName = `Statement_${monthName}_${currentYear}`;
        title = `M&T Restaurant - Monthly Statement (Admin) - ${monthName} ${currentYear}`;
    } else {
        filteredOrders = orderManager.getOrdersByYear(currentYear);
        fileName = `M&T_Admin_Statement_${currentYear}`;
        sheetName = `Statement_${currentYear}`;
        title = `M&T Restaurant - Annual Statement (Admin) - ${currentYear}`;
    }
    
    if (filteredOrders.length === 0) {
        showToast(`No completed orders for the selected period`, 'error');
        return;
    }
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
        [title],
        statementType === 'monthly' ? 
            [`Month: ${currentMonth + 1}/${currentYear}`] : 
            [`Year: ${currentYear}`],
        [],
        ["Summary"],
        ["Total Completed Orders", filteredOrders.length],
        ["Total Revenue", `R${filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}`],
        ["Total Profit (5%)", `R${filteredOrders.reduce((sum, order) => sum + (order.total || 0) * 0.05, 0).toFixed(2)}`],
        [],
        ["Order Details"]
    ];
    
    // Order details - REMOVED customer email
    const orderDetails = filteredOrders.map(order => {
        const profit = calculateProfit(order.total || 0);
        return [
            order.timestamp ? formatDate(order.timestamp) : 'Unknown',
            order.orderId || 'Unknown',
            `R${(order.total || 0).toFixed(2)}`,
            `R${profit.toFixed(2)}`
        ];
    });
    
    // Combine data
    const allData = [...summaryData, ["Date", "Order ID", "Order Amount", "5% Transactional Profit"], ...orderDetails];
    
    const worksheet = XLSX.utils.aoa_to_sheet(allData);
    
    // Set column widths
    const colWidths = [
        { wch: 20 }, // Date column
        { wch: 20 }, // Order ID column
        { wch: 15 }, // Amount column
        { wch: 20 }  // Profit column
    ];
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate and download Excel file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    
    showToast(`${statementType === 'monthly' ? 'Monthly' : 'Annual'} statement downloaded`);
}

// Show confirm modal for logout
function showLogoutConfirmModal() {
    if (confirmMessage) {
        confirmMessage.textContent = 'Are you sure you want to logout?';
    }
    if (confirmModal) {
        confirmModal.classList.add('active');
    }
    
    // Set up confirm action
    if (confirmAction) {
        confirmAction.onclick = handleConfirmedLogout;
    }
}

// Handle logout
function handleConfirmedLogout() {
    // Clear session storage
    sessionStorage.removeItem('isAdmin');
    // Clear current user from localStorage
    safeStorage.removeItem('currentUser');
    // Redirect to main site
    window.location.href = 'index.html';
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
    // Check admin access
    if (!checkAdminAccess()) return;
    
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
if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleSidebar);
if (overlay) overlay.addEventListener('click', closeSidebar);

// Navigation links
navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
});

// Admin form
if (adminForm) adminForm.addEventListener('submit', saveAdminData);

// Cancel changes
if (cancelChanges) cancelChanges.addEventListener('click', () => {
    loadAdminData();
    // Clear form fields
    if (document.getElementById('newAdminEmail')) document.getElementById('newAdminEmail').value = '';
    if (document.getElementById('currentAdminPassword')) document.getElementById('currentAdminPassword').value = '';
    if (document.getElementById('newAdminPassword')) document.getElementById('newAdminPassword').value = '';
    if (document.getElementById('confirmAdminPassword')) document.getElementById('confirmAdminPassword').value = '';
    showToast('Changes cancelled');
});

// Order search
if (orderSearch) orderSearch.addEventListener('input', searchOrders);

// Download statement button - show modal instead of immediate download
if (downloadStatementBtn) {
    downloadStatementBtn.addEventListener('click', showStatementModal);
}

// Confirm modal
if (closeConfirmModal) closeConfirmModal.addEventListener('click', () => {
    if (confirmModal) confirmModal.classList.remove('active');
});

if (cancelConfirm) cancelConfirm.addEventListener('click', () => {
    if (confirmModal) confirmModal.classList.remove('active');
});

// Close confirm modal when clicking outside
if (confirmModal) confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        confirmModal.classList.remove('active');
    }
});

// Statement modal functionality
if (closeStatementModal) closeStatementModal.addEventListener('click', () => {
    if (statementModal) statementModal.classList.remove('active');
});

if (cancelStatement) cancelStatement.addEventListener('click', () => {
    if (statementModal) statementModal.classList.remove('active');
});

if (confirmStatement) confirmStatement.addEventListener('click', () => {
    const type = statementType ? statementType.value : 'yearly';
    downloadStatement(type);
    if (statementModal) statementModal.classList.remove('active');
});

// Close statement modal when clicking outside
if (statementModal) statementModal.addEventListener('click', (e) => {
    if (e.target === statementModal) {
        statementModal.classList.remove('active');
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
    // Load XLSX library for Excel file generation
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/xlsx/dist/xlsx.full.min.js';
    script.onload = initialize;
    script.onerror = () => {
        console.error('Failed to load XLSX library');
        showToast('Failed to load Excel library. Please check your connection.', 'error');
        initialize();
    };
    document.head.appendChild(script);
    
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

// Performance-optimized order update listener
let orderUpdateTimeout = null;
window.addEventListener('ordersUpdated', function() {
    // Debounce updates to prevent excessive processing
    if (orderUpdateTimeout) clearTimeout(orderUpdateTimeout);
    
    orderUpdateTimeout = setTimeout(() => {
        loadOrders();
        updateDashboardStats();
        if (document.getElementById('orders').classList.contains('active')) {
            displayCompletedOrders();
        }
    }, 100); // 100ms debounce
});

// Initial check and resize listener
window.addEventListener('resize', checkDevice);