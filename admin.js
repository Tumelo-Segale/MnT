// Performance Optimizations
let orderUpdateQueue = [];
let isProcessingQueue = false;
let debounceTimer = null;

// Batch process orders for high volume
function processOrderBatch() {
    if (isProcessingQueue || orderUpdateQueue.length === 0) return;
    
    isProcessingQueue = true;
    const batch = orderUpdateQueue.slice(0, 100); // Process up to 100 orders at once
    orderUpdateQueue = orderUpdateQueue.slice(100);
    
    try {
        // Update stats in batch
        updateDashboardStats();
        
        // Save to localStorage in one operation
        if (batch.length > 0) {
            const currentOrders = safeStorage.getJSON('orders') || [];
            const updatedOrders = [...currentOrders];
            
            batch.forEach(orderUpdate => {
                const index = updatedOrders.findIndex(o => o.id === orderUpdate.id);
                if (index !== -1) {
                    updatedOrders[index] = orderUpdate;
                }
            });
            
            safeStorage.setJSON('orders', updatedOrders);
        }
    } catch (error) {
        console.error('Error processing order batch:', error);
    }
    
    isProcessingQueue = false;
    
    // If more orders in queue, process next batch
    if (orderUpdateQueue.length > 0) {
        setTimeout(processOrderBatch, 50); // Small delay to prevent blocking
    }
}

// Debounced function for frequent updates
function debouncedUpdateDashboard() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        updateDashboardStats();
    }, 100); // 100ms debounce
}

// Check if user is admin
function checkAdminAccess() {
    // Check session storage for admin flag
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    
    if (!isAdmin) {
        // Check if current user is admin
        const currentUser = safeStorage.getJSON('currentUser');
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
const completedOrders = document.getElementById('completedOrders');
const totalProfit = document.getElementById('totalProfit');
const yearRevenue = document.getElementById('yearRevenue');
const monthRevenue = document.getElementById('monthRevenue');
const monthProfit = document.getElementById('monthProfit');
const downloadStatementBtn = document.getElementById('downloadStatementBtn');
const statementOptions = document.querySelectorAll('.statement-option');

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
let adminData = safeStorage.getJSON('adminData') || {
    email: 'admin@admin.com',
    password: 'admin123',
    name: 'Tumelo Segale'
};

let allOrders = [];
let yearlyStats = safeStorage.getJSON('yearlyStats') || {
    year: new Date().getFullYear(),
    revenue: 0,
    orders: 0,
    profit: 0
};

let monthlyStats = safeStorage.getJSON('monthlyStats') || {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    revenue: 0,
    orders: 0,
    profit: 0
};

let currentStatementPeriod = 'month'; // 'month' or 'year'

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

// Get current month and year
function getCurrentMonthYear() {
    const now = new Date();
    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1 // 1-12
    };
}

// Check if stats need reset (new day/month/year)
function checkStatsReset() {
    const now = new Date();
    const currentMonthYear = getCurrentMonthYear();
    
    // Check for new month
    if (monthlyStats.year !== currentMonthYear.year || monthlyStats.month !== currentMonthYear.month) {
        monthlyStats = {
            year: currentMonthYear.year,
            month: currentMonthYear.month,
            revenue: 0,
            orders: 0,
            profit: 0
        };
        safeStorage.setJSON('monthlyStats', monthlyStats);
    }
    
    // Check for new year
    if (yearlyStats.year !== currentMonthYear.year) {
        yearlyStats = {
            year: currentMonthYear.year,
            revenue: 0,
            orders: 0,
            profit: 0
        };
        safeStorage.setJSON('yearlyStats', yearlyStats);
    }
}

// Load orders from main app
function loadOrders() {
    allOrders = safeStorage.getJSON('orders') || [];
}

// Update dashboard stats with optimization
function updateDashboardStats() {
    // Check if stats need reset
    checkStatsReset();
    
    const currentMonthYear = getCurrentMonthYear();
    
    // Filter completed orders
    const completedOrdersList = allOrders.filter(order => 
        order.status === 'completed'
    );
    
    // Calculate current month stats
    const monthlyOrders = completedOrdersList.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate.getFullYear() === currentMonthYear.year && 
               (orderDate.getMonth() + 1) === currentMonthYear.month;
    });
    
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const monthlyProfit = calculateProfit(monthlyRevenue);
    
    // Calculate current year stats
    const yearlyOrders = completedOrdersList.filter(order => {
        const orderYear = new Date(order.timestamp).getFullYear();
        return orderYear === currentMonthYear.year;
    });
    
    const yearlyRevenue = yearlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const yearlyProfit = calculateProfit(yearlyRevenue);
    
    // Update display
    if (completedOrders) completedOrders.textContent = completedOrdersList.length;
    if (totalProfit) totalProfit.textContent = formatCurrency(yearlyProfit);
    if (yearRevenue) yearRevenue.textContent = formatCurrency(yearlyRevenue);
    if (monthRevenue) monthRevenue.textContent = formatCurrency(monthlyRevenue);
    if (monthProfit) monthProfit.textContent = formatCurrency(monthlyProfit);
    
    // Update stats storage
    monthlyStats = {
        year: currentMonthYear.year,
        month: currentMonthYear.month,
        revenue: monthlyRevenue,
        orders: monthlyOrders.length,
        profit: monthlyProfit
    };
    
    yearlyStats = {
        year: currentMonthYear.year,
        revenue: yearlyRevenue,
        orders: yearlyOrders.length,
        profit: yearlyProfit
    };
    
    // Save stats
    safeStorage.setJSON('monthlyStats', monthlyStats);
    safeStorage.setJSON('yearlyStats', yearlyStats);
}

// Display completed orders (without customer email)
function displayCompletedOrders() {
    if (!ordersContainer) return;
    
    ordersContainer.innerHTML = '';
    
    const searchTerm = orderSearch ? orderSearch.value.toLowerCase() : '';
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
    
    // Process in batches for performance
    const batchSize = 50;
    for (let i = 0; i < completedOrdersList.length; i += batchSize) {
        const batch = completedOrdersList.slice(i, i + batchSize);
        
        batch.forEach(order => {
            const profit = calculateProfit(order.total || 0);
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
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
            ordersContainer.appendChild(orderElement);
        });
        
        // Allow UI to update between batches
        if (i + batchSize < completedOrdersList.length) {
            setTimeout(() => {}, 0);
        }
    }
}

// Search orders with debouncing
function searchOrders() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        displayCompletedOrders();
    }, 300);
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

// Download statement as Excel file
function downloadStatement() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    let filteredOrders = [];
    let periodLabel = '';
    
    if (currentStatementPeriod === 'month') {
        filteredOrders = allOrders.filter(order => 
            order.status === 'completed' && 
            new Date(order.timestamp).getFullYear() === currentYear &&
            (new Date(order.timestamp).getMonth() + 1) === currentMonth
        );
        periodLabel = `${now.toLocaleString('default', { month: 'long' })} ${currentYear}`;
    } else {
        filteredOrders = allOrders.filter(order => 
            order.status === 'completed' && 
            new Date(order.timestamp).getFullYear() === currentYear
        );
        periodLabel = `${currentYear}`;
    }
    
    if (filteredOrders.length === 0) {
        showToast(`No completed orders for ${currentStatementPeriod === 'month' ? 'this month' : 'this year'}`, 'error');
        return;
    }
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
        ["M&T Restaurant - Admin Statement"],
        [`Period: ${periodLabel}`],
        [`Generated: ${new Date().toLocaleDateString()}`],
        [],
        ["Summary"],
        ["Total Completed Orders", filteredOrders.length],
        ["Total Revenue", `R${filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}`],
        ["Total Profit (5%)", `R${filteredOrders.reduce((sum, order) => sum + calculateProfit(order.total || 0), 0).toFixed(2)}`],
        [],
        ["Order Details"]
    ];
    
    // Order details
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
        { wch: 15 }, // Date column
        { wch: 20 }, // Order ID column
        { wch: 15 }, // Amount column
        { wch: 20 }  // Profit column
    ];
    worksheet['!cols'] = colWidths;
    
    const sheetName = currentStatementPeriod === 'month' ? 
        `Statement_${currentYear}_${currentMonth.toString().padStart(2, '0')}` : 
        `Statement_${currentYear}`;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate and download Excel file
    const fileName = currentStatementPeriod === 'month' ? 
        `M&T_Admin_Statement_${currentYear}_${currentMonth.toString().padStart(2, '0')}.xlsx` : 
        `M&T_Admin_Statement_${currentYear}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
    
    showToast(`${currentStatementPeriod === 'month' ? 'Monthly' : 'Annual'} statement downloaded`);
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

// Order search with debouncing
if (orderSearch) orderSearch.addEventListener('input', searchOrders);

// Statement period selection
if (statementOptions) {
    statementOptions.forEach(option => {
        option.addEventListener('click', () => {
            statementOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            currentStatementPeriod = option.dataset.period;
        });
    });
}

// Download statement button
if (downloadStatementBtn) downloadStatementBtn.addEventListener('click', downloadStatement);

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
    
    // Start order processing queue
    setInterval(processOrderBatch, 1000);
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
    debouncedUpdateDashboard();
    if (document.getElementById('orders').classList.contains('active')) {
        displayCompletedOrders();
    }
});

// Initial check and resize listener
window.addEventListener('resize', checkDevice);