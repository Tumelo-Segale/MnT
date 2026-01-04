// Storage availability check and initialization
(function() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    // Initialize storage if not available
    if (typeof localStorage === 'undefined' || !window.localStorage) {
        console.warn('localStorage is not available. Initializing fallback storage.');
        window.localStorage = {
            _data: {},
            setItem: function(id, val) {
                try {
                    this._data[id] = String(val);
                } catch (e) {
                    console.error('Error setting localStorage item:', e);
                }
            },
            getItem: function(id) {
                return this._data.hasOwnProperty(id) ? this._data[id] : null;
            },
            removeItem: function(id) {
                delete this._data[id];
            },
            clear: function() {
                this._data = {};
            },
            key: function(index) {
                const keys = Object.keys(this._data);
                return index >= 0 && index < keys.length ? keys[index] : null;
            },
            get length() {
                return Object.keys(this._data).length;
            }
        };
    }
    
    // Initialize sessionStorage if not available
    if (typeof sessionStorage === 'undefined' || !window.sessionStorage) {
        console.warn('sessionStorage is not available. Initializing fallback storage.');
        window.sessionStorage = {
            _data: {},
            setItem: function(id, val) {
                try {
                    this._data[id] = String(val);
                } catch (e) {
                    console.error('Error setting sessionStorage item:', e);
                }
            },
            getItem: function(id) {
                return this._data.hasOwnProperty(id) ? this._data[id] : null;
            },
            removeItem: function(id) {
                delete this._data[id];
            },
            clear: function() {
                this._data = {};
            },
            key: function(index) {
                const keys = Object.keys(this._data);
                return index >= 0 && index < keys.length ? keys[index] : null;
            },
            get length() {
                return Object.keys(this._data).length;
            }
        };
    }
})();

// Safe localStorage wrapper functions
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
const protectedSections = document.querySelectorAll('.protected-section');
const protectedNavLinks = document.querySelectorAll('.protected-nav');
const loginLogoutLink = document.querySelector('.login-logout');

// Cart elements
const cartContainer = document.getElementById('cartContainer');
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const totalAmount = document.getElementById('totalAmount');
const checkoutBtn = document.getElementById('checkoutBtn');

// Order elements
const orderModal = document.getElementById('orderModal');
const closeOrderModal = document.getElementById('closeOrderModal');
const orderModalBody = document.getElementById('orderModalBody');
const ordersContainer = document.getElementById('ordersContainer');

// Form elements
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginForm = document.querySelector('.login-form');
const registerForm = document.querySelector('.register-form');

// Menu elements
const filterBtns = document.querySelectorAll('.filter-btn');
const menuCategories = document.querySelectorAll('.menu-category');
const menuSearch = document.getElementById('menuSearch');

// Profile elements
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profilePhone = document.getElementById('profilePhone');
const editProfileBtn = document.getElementById('editProfileBtn');
const deleteProfileBtn = document.getElementById('deleteProfileBtn');

// Contact form elements
const contactNameInput = document.getElementById('contactName');
const contactEmailInput = document.getElementById('contactEmail');
const contactMessageInput = document.getElementById('contactMessage');

// Profile edit modal elements
const profileEditModal = document.getElementById('profileEditModal');
const closeProfileEditModal = document.getElementById('closeProfileEditModal');
const cancelProfileEdit = document.getElementById('cancelProfileEdit');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const editNameInput = document.getElementById('editName');
const editEmailInput = document.getElementById('editEmail');
const editPhoneInput = document.getElementById('editPhone');
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Delete confirmation modal
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');

// Logout confirmation modal for customer site
const logoutConfirmModal = document.getElementById('logoutConfirmModal');
const closeLogoutModal = document.getElementById('closeLogoutModal');
const cancelLogout = document.getElementById('cancelLogout');
const confirmLogout = document.getElementById('confirmLogout');

// Toast element
const toast = document.getElementById('toast');

// State - Using safeStorage wrapper
let cart = safeStorage.getJSON('cart') || [];
let currentUser = safeStorage.getJSON('currentUser') || null;
let orders = safeStorage.getJSON('orders') || [];
let menuItems = safeStorage.getJSON('menuItems') || [];
let contactMessages = safeStorage.getJSON('contactMessages') || [];

// Initialize default data if not exists
function initializeDefaultData() {
    // Initialize users array if not exists
    let users = safeStorage.getJSON('users');
    if (!users || !Array.isArray(users)) {
        users = [];
        safeStorage.setJSON('users', users);
    }
    
    // Initialize menu items if not exists
    if (!menuItems || !Array.isArray(menuItems)) {
        menuItems = [
            {
                id: 1,
                name: "Chicken Burger",
                description: "Juicy chicken patty with fresh lettuce and special sauce",
                price: 129.99,
                category: "meals",
                active: true
            },
            {
                id: 2,
                name: "Beef Burger",
                description: "Classic beef patty with cheese and vegetables",
                price: 139.99,
                category: "meals",
                active: true
            },
            {
                id: 3,
                name: "Coca-Cola",
                description: "Refreshing cold drink",
                price: 25.00,
                category: "drinks",
                active: true
            },
            {
                id: 4,
                name: "Fanta",
                description: "Orange flavored soda",
                price: 25.00,
                category: "drinks",
                active: true
            }
        ];
        safeStorage.setJSON('menuItems', menuItems);
    }
    
    // Initialize orders if not exists
    if (!orders || !Array.isArray(orders)) {
        orders = [];
        safeStorage.setJSON('orders', orders);
    }
    
    // Initialize contact messages if not exists
    if (!contactMessages || !Array.isArray(contactMessages)) {
        contactMessages = [];
        safeStorage.setJSON('contactMessages', contactMessages);
    }
}

// Show toast message
function showToast(message, type = 'success') {
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.background = type === 'success' ? '#28a745' : '#dc3545';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

// Format date to DD MMM YYYY (e.g., 12 Nov 2025)
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

// Generate order ID: MNT(YYYYMMDD)-0000
function generateOrderId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    
    return `MNT${year}${month}${day}-${randomNum}`;
}

// Generate 6-digit PIN
function generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Get status class based on status
function getStatusClass(status) {
    if (!status) return 'status-pending';
    
    switch(status.toLowerCase()) {
        case 'pending':
            return 'status-pending';
        case 'ready':
            return 'status-ready';
        case 'completed':
            return 'status-complete';
        default:
            return 'status-pending';
    }
}

// Check if within operating hours
function isWithinOperatingHours() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours + (minutes / 60);
    
    // Monday - Sunday: 09:00 - 20:00 (same as home page)
    return currentTime >= 9 && currentTime < 20;
}

// Check user type and redirect if needed
// In the checkUserTypeAndRedirect function:
function checkUserTypeAndRedirect() {
    if (!currentUser) return false;
    
    // Check if user is manager
    if (currentUser.email === 'manager@mnt.com' && currentUser.password === 'manager123') {
        // Clear current user from localStorage
        safeStorage.removeItem('currentUser');
        // Set manager flag and redirect
        sessionStorage.setItem('isManager', 'true');
        window.location.href = 'manager.html';
        return true;
    }
    
    // Check if user is admin
    if (currentUser.email === 'admin@admin.com' && currentUser.password === 'admin123') {
        // Clear current user from localStorage
        safeStorage.removeItem('currentUser');
        // Set admin flag and redirect
        sessionStorage.setItem('isAdmin', 'true');
        window.location.href = 'admin.html';
        return true;
    }
    
    return false;
}

// Display orders in the orders section
function displayOrders() {
    if (!ordersContainer) return;
    
    if (!currentUser) {
        ordersContainer.innerHTML = `
            <div class="empty-orders">
                <p>Please login to view your orders.</p>
                <a href="#login" class="hero-btn">Login</a>
            </div>
        `;
        return;
    }
    
    const userOrders = Array.isArray(orders) ? orders.filter(order => order.userEmail === currentUser.email) : [];
    
    if (userOrders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-orders">
                <p>You haven't placed any orders yet.</p>
                <a href="#menu" class="hero-btn">Browse Menu</a>
            </div>
        `;
        return;
    }
    
    ordersContainer.innerHTML = '';
    
    // Sort orders by date (newest first)
    userOrders.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : new Date(0);
        const dateB = b.timestamp ? new Date(b.timestamp) : new Date(0);
        return dateB - dateA;
    });
    
    userOrders.forEach(order => {
        const statusClass = getStatusClass(order.status);
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.dataset.orderId = order.id;
        orderElement.innerHTML = `
            <div class="order-item-header">
                <h4>${order.orderId || 'Unknown ID'}</h4>
                <span class="order-date">${formatDate(order.timestamp)}</span>
            </div>
            <div class="order-item-body">
                <p><strong>Status:</strong> <span class="order-status ${statusClass}">${order.status || 'pending'}</span></p>
                <p><strong>Total:</strong> R ${(order.total || 0).toFixed(2)}</p>
            </div>
            <button class="view-order-btn" data-order-id="${order.id}">View Details</button>
        `;
        ordersContainer.appendChild(orderElement);
    });
    
    // Add event listeners to view order buttons
    document.querySelectorAll('.view-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const orderId = btn.dataset.orderId;
            const order = userOrders.find(o => o.id && o.id.toString() === orderId);
            if (order) {
                showOrderDetails(order);
            }
        });
    });
}

// Show order details in modal
function showOrderDetails(order) {
    if (!orderModalBody || !orderModal) return;
    
    const statusClass = getStatusClass(order.status);
    
    orderModalBody.innerHTML = `
        <div class="order-details">
            <div class="order-detail-row">
                <strong>Order ID:</strong>
                <span>${order.orderId || 'Unknown ID'}</span>
            </div>
            <div class="order-detail-row">
                <strong>Date:</strong>
                <span>${formatDate(order.timestamp)}</span>
            </div>
            <div class="order-detail-row">
                <strong>Status:</strong>
                <span class="order-status ${statusClass}">${order.status || 'pending'}</span>
            </div>
            <div class="order-pin">
                <div class="pin-label">Collection PIN:</div>
                <div class="pin-code">${order.pin || '000000'}</div>
            </div>
            <div class="order-items">
                <h4>Items:</h4>
                ${order.items && Array.isArray(order.items) ? order.items.map(item => `
                    <div class="order-item-detail">
                        <span>${item.quantity || 1}x ${item.name || 'Unknown item'}</span>
                        <span>R ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                `).join('') : '<p>No items in this order</p>'}
            </div>
            <div class="order-total">
                <strong>Total Amount:</strong>
                <span>R ${(order.total || 0).toFixed(2)}</span>
            </div>
        </div>
    `;
    
    orderModal.classList.add('active');
}

// Close order modal
function closeOrderModalFunc() {
    if (orderModal) {
        orderModal.classList.remove('active');
    }
}

// Update contact form with user details (if logged in)
function updateContactForm() {
    if (!contactNameInput || !contactEmailInput) return;
    
    if (currentUser) {
        contactNameInput.value = currentUser.name || '';
        contactEmailInput.value = currentUser.email || '';
        contactNameInput.readOnly = true;
        contactEmailInput.readOnly = true;
        contactNameInput.style.backgroundColor = '#f5f5f5';
        contactEmailInput.style.backgroundColor = '#f5f5f5';
    } else {
        contactNameInput.value = '';
        contactEmailInput.value = '';
        contactNameInput.readOnly = false;
        contactEmailInput.readOnly = false;
        contactNameInput.style.backgroundColor = '';
        contactEmailInput.style.backgroundColor = '';
    }
}

// Display menu items
function displayMenuItems() {
    const mealsContainer = document.querySelector('.menu-category.meals');
    const drinksContainer = document.querySelector('.menu-category.drinks');
    
    if (!mealsContainer || !drinksContainer) return;
    
    // Clear existing items
    mealsContainer.innerHTML = '';
    drinksContainer.innerHTML = '';
    
    // Filter active menu items (only those with active: true)
    const activeMenuItems = Array.isArray(menuItems) ? menuItems.filter(item => item.active === true) : [];
    
    // Display meals
    const meals = activeMenuItems.filter(item => item.category === 'meals');
    if (meals.length === 0) {
        mealsContainer.innerHTML = '<div class="empty-state"><p>No meals available</p></div>';
    } else {
        meals.forEach(item => {
            const menuItemElement = document.createElement('div');
            menuItemElement.className = 'menu-item';
            menuItemElement.dataset.category = item.category;
            menuItemElement.dataset.price = item.price;
            menuItemElement.innerHTML = `
                <h3>${item.name || 'Unknown Item'}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <span class="price">R ${(item.price || 0).toFixed(2)}</span>
                <button class="add-to-cart">Add to Cart</button>
            `;
            mealsContainer.appendChild(menuItemElement);
        });
    }
    
    // Display drinks
    const drinks = activeMenuItems.filter(item => item.category === 'drinks');
    if (drinks.length === 0) {
        drinksContainer.innerHTML = '<div class="empty-state"><p>No drinks available</p></div>';
    } else {
        drinks.forEach(item => {
            const menuItemElement = document.createElement('div');
            menuItemElement.className = 'menu-item';
            menuItemElement.dataset.category = item.category;
            menuItemElement.dataset.price = item.price;
            menuItemElement.innerHTML = `
                <h3>${item.name || 'Unknown Item'}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <span class="price">R ${(item.price || 0).toFixed(2)}</span>
                <button class="add-to-cart">Add to Cart</button>
            `;
            drinksContainer.appendChild(menuItemElement);
        });
    }
    
    // Add event listeners to new add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!isWithinOperatingHours()) {
                showToast('Orders can only be placed during operating hours', 'error');
                return;
            }
            
            const menuItem = this.closest('.menu-item');
            if (!menuItem) return;
            
            const itemName = menuItem.querySelector('h3')?.textContent || 'Unknown Item';
            const price = menuItem.dataset.price || '0';
            const category = menuItem.dataset.category || 'meals';
            
            addToCart(itemName, price, category);
            
            // Visual feedback
            const originalText = this.textContent;
            const originalBg = this.style.background;
            this.textContent = 'Added';
            this.style.background = '#28a745';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = originalBg;
            }, 1000);
        });
    });
}

// Set active section and update active nav link
function setActiveSection(sectionId) {
    // Check if section requires authentication
    if ((sectionId === 'orders' || sectionId === 'profile') && !currentUser) {
        showToast('Login to access this section', 'error');
        sectionId = 'login';
    }
    
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
        
        // If menu section, show meals by default and display menu
        if (sectionId === 'menu') {
            showMenuCategory('meals');
            displayMenuItems();
        }
        
        // If profile section, update profile info
        if (sectionId === 'profile' && currentUser) {
            updateProfileInfo();
        }
        
        // If orders section, display orders
        if (sectionId === 'orders' && currentUser) {
            displayOrders();
        }
        
        // If contact section, update form with user details
        if (sectionId === 'contact') {
            updateContactForm();
        }
    }
    
    // Update active nav link
    updateActiveNavLink(sectionId);
    
    // Update cart visibility
    updateCartVisibility();
}

// Update active navigation link
function updateActiveNavLink(sectionId) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
}

// Update navigation based on login state
function updateNavigation() {
    const isLoggedIn = currentUser !== null;
    
    protectedNavLinks.forEach(link => {
        if (isLoggedIn) {
            link.style.display = 'block';
        } else {
            link.style.display = 'none';
            if (link.classList.contains('active')) {
                link.classList.remove('active');
            }
        }
    });
    
    if (loginLogoutLink) {
        if (isLoggedIn) {
            loginLogoutLink.textContent = 'Logout';
            loginLogoutLink.setAttribute('href', '#logout');
        } else {
            loginLogoutLink.textContent = 'Login';
            loginLogoutLink.setAttribute('href', '#login');
        }
    }
}

// Toggle sidebar function
function toggleSidebar() {
    if (!hamburgerBtn || !sidebar || !overlay) return;
    
    hamburgerBtn.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');

    // Prevent body scroll when sidebar is open
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
    
    // Set active section
    setActiveSection(targetId);
    
    // Close sidebar
    closeSidebar();
    
    // Update URL hash
    window.location.hash = targetId;
    
    // Scroll to top of the section
    const section = document.getElementById(targetId);
    if (section) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Show logout confirmation modal
function showLogoutConfirmModal() {
    if (logoutConfirmModal) {
        logoutConfirmModal.classList.add('active');
    }
}

// Close logout confirmation modal
function closeLogoutConfirmModal() {
    if (logoutConfirmModal) {
        logoutConfirmModal.classList.remove('active');
    }
}

// Handle logout
function handleLogout() {
    // Clear current user
    currentUser = null;
    safeStorage.removeItem('currentUser');
    
    // Clear session flags
    sessionStorage.removeItem('isManager');
    sessionStorage.removeItem('isAdmin');
    
    // Clear cart
    cart = [];
    saveCartToStorage();
    
    updateNavigation();
    showToast('Logged out successfully');
    setActiveSection('home');
    closeSidebar();
    window.location.hash = 'home';
    closeLogoutConfirmModal();
}

// Show login/register form
function showLoginForm() {
    if (!formTitle || !formSubtitle || !loginForm || !registerForm) return;
    
    formTitle.textContent = 'Login';
    formSubtitle.textContent = 'Access your M&T account to make online orders, view order history, and more.';
    loginForm.classList.add('active-form');
    registerForm.classList.remove('active-form');
}

function showRegisterForm() {
    if (!formTitle || !formSubtitle || !loginForm || !registerForm) return;
    
    formTitle.textContent = 'Register';
    formSubtitle.textContent = 'Create your M&T account to make online orders and enjoy exclusive benefits.';
    loginForm.classList.remove('active-form');
    registerForm.classList.add('active-form');
}

// Update profile information
function updateProfileInfo() {
    if (!currentUser || !profileName || !profileEmail || !profilePhone) return;
    
    profileName.textContent = currentUser.name || '-';
    profileEmail.textContent = currentUser.email || '-';
    profilePhone.textContent = currentUser.phone || '-';
}

// Show edit profile modal
function showEditProfileModal() {
    if (!currentUser || !profileEditModal) return;
    
    if (editNameInput) editNameInput.value = currentUser.name || '';
    if (editEmailInput) editEmailInput.value = currentUser.email || '';
    if (editPhoneInput) editPhoneInput.value = currentUser.phone || '';
    
    // Clear password fields
    if (currentPasswordInput) currentPasswordInput.value = '';
    if (newPasswordInput) newPasswordInput.value = '';
    if (confirmPasswordInput) confirmPasswordInput.value = '';
    
    profileEditModal.classList.add('active');
}

// Close edit profile modal
function closeEditProfileModal() {
    if (profileEditModal) {
        profileEditModal.classList.remove('active');
    }
}

// Save profile changes
function saveProfileChanges() {
    if (!currentUser) return;
    
    const name = editNameInput?.value.trim() || '';
    const email = editEmailInput?.value.trim() || '';
    const phone = editPhoneInput?.value.trim() || '';
    const currentPassword = currentPasswordInput?.value || '';
    const newPassword = newPasswordInput?.value || '';
    const confirmPassword = confirmPasswordInput?.value || '';
    
    // Basic validation
    if (!name || !email || !phone) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Get users from storage - ensure it's an array
    let users = safeStorage.getJSON('users');
    if (!users || !Array.isArray(users)) {
        users = [];
    }
    
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex === -1) {
        showToast('User not found', 'error');
        return;
    }
    
    // Check if email is being changed to one that already exists (excluding current user)
    if (email !== currentUser.email) {
        const emailExists = users.some(u => u.email === email && u.email !== currentUser.email);
        if (emailExists) {
            showToast('Email already registered', 'error');
            return;
        }
    }
    
    // Check if password is being changed
    if (currentPassword || newPassword || confirmPassword) {
        // Validate current password
        if (currentPassword !== users[userIndex].password) {
            showToast('Current password is incorrect', 'error');
            return;
        }
        
        // Validate new password
        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        
        // Update password
        users[userIndex].password = newPassword;
    }
    
    // Update user details
    users[userIndex].name = name;
    users[userIndex].email = email;
    users[userIndex].phone = phone;
    
    // Save updated users
    safeStorage.setJSON('users', users);
    
    // Update current user
    currentUser = users[userIndex];
    safeStorage.setJSON('currentUser', currentUser);
    
    // Update profile display
    updateProfileInfo();
    
    // Update contact form if email changed
    if (contactEmailInput && contactEmailInput.value === currentUser.email) {
        contactNameInput.value = currentUser.name;
        contactEmailInput.value = currentUser.email;
    }
    
    closeEditProfileModal();
    showToast('Profile updated successfully');
}

// Show delete confirmation modal
function showDeleteConfirmModal() {
    if (deleteConfirmModal) {
        deleteConfirmModal.classList.add('active');
    }
}

// Close delete confirmation modal
function closeDeleteConfirmModal() {
    if (deleteConfirmModal) {
        deleteConfirmModal.classList.remove('active');
    }
}

// Delete user profile
function deleteUserProfile() {
    if (!currentUser) return;
    
    let users = safeStorage.getJSON('users');
    if (!users || !Array.isArray(users)) {
        users = [];
    }
    
    const updatedUsers = users.filter(u => u.email !== currentUser.email);
    
    // Remove user from storage
    safeStorage.setJSON('users', updatedUsers);
    
    // Clear current user
    currentUser = null;
    safeStorage.removeItem('currentUser');
    
    // Clear user's cart
    cart = [];
    saveCartToStorage();
    
    // Update navigation
    updateNavigation();
    
    // Show success message
    showToast('Profile deleted successfully');
    
    // Redirect to home
    setActiveSection('home');
    window.location.hash = 'home';
    
    // Close modal
    closeDeleteConfirmModal();
}

// Show menu category based on filter
function showMenuCategory(filter) {
    // Update active filter button
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    // Show/hide menu categories
    menuCategories.forEach(category => {
        if (category.classList.contains(filter)) {
            category.classList.add('active');
        } else {
            category.classList.remove('active');
        }
    });
}

// Search menu items
function searchMenuItems(searchTerm) {
    const items = document.querySelectorAll('.menu-item');
    const categories = document.querySelectorAll('.menu-category');
    
    // Show all categories during search
    categories.forEach(category => {
        category.style.display = 'block';
    });
    
    let hasResults = false;
    
    items.forEach(item => {
        const itemName = item.querySelector('h3')?.textContent.toLowerCase() || '';
        const itemDesc = item.querySelector('p') ? item.querySelector('p').textContent.toLowerCase() : '';
        
        if (itemName.includes(searchTerm.toLowerCase()) || itemDesc.includes(searchTerm.toLowerCase())) {
            item.style.display = 'block';
            hasResults = true;
            
            // Make sure parent category is visible
            const category = item.closest('.menu-category');
            if (category) {
                category.style.display = 'block';
            }
        } else {
            item.style.display = 'none';
        }
    });
    
    // If no results, show message
    if (!hasResults) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No menu items found';
        noResults.style.textAlign = 'center';
        noResults.style.padding = '20px';
        noResults.style.color = '#666';
        
        // Remove existing no-results message
        document.querySelectorAll('.no-results').forEach(el => el.remove());
        
        // Add to first visible category
        const visibleCategory = document.querySelector('.menu-category.active');
        if (visibleCategory) {
            visibleCategory.appendChild(noResults);
        }
    } else {
        // Remove any existing no-results messages
        document.querySelectorAll('.no-results').forEach(el => el.remove());
    }
}

// Cart functions
function addToCart(itemName, price, category) {
    if (!currentUser) {
        showToast('Login to add items to cart', 'error');
        setActiveSection('login');
        return;
    }
    
    if (!isWithinOperatingHours()) {
        showToast('Orders can only be placed during operating hours', 'error');
        return;
    }
    
    const existingItem = cart.find(item => item.name === itemName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: itemName,
            price: parseFloat(price) || 0,
            quantity: 1,
            category: category
        });
    }
    
    updateCart();
    updateCartVisibility();
    saveCartToStorage();
}

function removeFromCart(itemName) {
    const itemIndex = cart.findIndex(item => item.name === itemName);
    
    if (itemIndex > -1) {
        cart.splice(itemIndex, 1);
        updateCart();
        updateCartVisibility();
        saveCartToStorage();
    }
}

function updateItemQuantity(itemName, change) {
    const item = cart.find(item => item.name === itemName);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(itemName);
        } else {
            updateCart();
            saveCartToStorage();
        }
    }
}

function updateCart() {
    if (!cartCount || !cartItems || !totalAmount) return;
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    cartCount.textContent = totalItems;
    
    // Update cart items display
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name || 'Unknown Item'}</h4>
                    <p>R ${(item.price || 0).toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn decrease" data-item="${item.name}">-</button>
                    <span>${item.quantity || 1}</span>
                    <button class="quantity-btn increase" data-item="${item.name}">+</button>
                    <button class="remove-item" data-item="${item.name}">&times;</button>
                </div>
            `;
            cartItems.appendChild(itemElement);
        });
        
        // Add event listeners to new buttons
        document.querySelectorAll('.decrease').forEach(btn => {
            btn.addEventListener('click', () => {
                updateItemQuantity(btn.dataset.item, -1);
            });
        });
        
        document.querySelectorAll('.increase').forEach(btn => {
            btn.addEventListener('click', () => {
                updateItemQuantity(btn.dataset.item, 1);
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                removeFromCart(btn.dataset.item);
            });
        });
    }
    
    // Update total amount
    const total = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    totalAmount.textContent = `R ${total.toFixed(2)}`;
}

function updateCartVisibility() {
    if (!cartContainer || !cartModal) return;
    
    if (cart.length > 0 && currentUser) {
        cartContainer.classList.add('visible');
    } else {
        cartContainer.classList.remove('visible');
        cartModal.classList.remove('active');
    }
}

function toggleCartModal() {
    if (!currentUser) {
        showToast('Login to view cart', 'error');
        setActiveSection('login');
        return;
    }
    
    if (cartModal) {
        cartModal.classList.toggle('active');
    }
}

function saveCartToStorage() {
    safeStorage.setJSON('cart', cart);
}

// Paystack integration
function processPayment() {
    const total = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    
    if (total <= 0) {
        showToast('Cart total must be greater than zero', 'error');
        return;
    }
    
    // Convert to kobo (Paystack uses kobo)
    const amountInKobo = Math.round(total * 100);
    
    const handler = PaystackPop.setup({
        key: 'pk_test_328d06e1e7acac75cab1175db7c135a8f1697132',
        email: currentUser.email || '',
        amount: amountInKobo,
        currency: 'ZAR',
        ref: generateOrderId(),
        callback: function(response) {
            // Payment successful
            saveOrder();
            
            // Show success message with PIN
            const latestOrder = orders.find(order => order.userEmail === currentUser.email && order.timestamp > Date.now() - 1000);
            if (latestOrder) {
                showToast(`Payment successful! Order placed. Your PIN: ${latestOrder.pin || '000000'}. Order status: ${latestOrder.status || 'pending'}`);
            } else {
                showToast('Payment successful! Order placed.');
            }
            
            // Clear cart
            cart = [];
            updateCart();
            updateCartVisibility();
            saveCartToStorage();
            if (cartModal) cartModal.classList.remove('active');
            
            // Navigate to orders section
            setActiveSection('orders');
        },
        onClose: function() {
            showToast('Payment cancelled', 'error');
        }
    });
    
    handler.openIframe();
}

function saveOrder() {
    if (cart.length === 0) return;
    
    const order = {
        id: Date.now(),
        orderId: generateOrderId(),
        timestamp: new Date().toISOString(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0),
        userEmail: currentUser.email || '',
        pin: generatePin(),
        status: 'pending'
    };
    
    if (!Array.isArray(orders)) {
        orders = [];
    }
    
    orders.unshift(order);
    safeStorage.setJSON('orders', orders);
    
    // Display updated orders
    if (document.getElementById('orders')?.classList.contains('active')) {
        displayOrders();
    }
    
    // Trigger real-time update for manager and admin
    const event = new Event('ordersUpdated');
    window.dispatchEvent(event);
}

// Save contact message
function saveContactMessage(name, email, message) {
    const contactMessage = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        name: name,
        email: email,
        message: message,
        read: false
    };
    
    if (!Array.isArray(contactMessages)) {
        contactMessages = [];
    }
    
    contactMessages.unshift(contactMessage);
    safeStorage.setJSON('contactMessages', contactMessages);
    
    // Trigger real-time update for manager
    const event = new Event('messagesUpdated');
    window.dispatchEvent(event);
}

// Event listeners
if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleSidebar);
if (overlay) overlay.addEventListener('click', closeSidebar);

// Navigation links
navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
});

// Close sidebar on escape key press
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
        closeSidebar();
    }
});

// Handle initial page load based on URL hash
function handleInitialLoad() {
    // Initialize default data
    initializeDefaultData();
    
    // Check if user is trying to access staff pages from customer site
    if (sessionStorage.getItem('isManager') === 'true') {
        sessionStorage.removeItem('isManager');
        window.location.href = 'manager.html';
        return;
    }
    
    if (sessionStorage.getItem('isAdmin') === 'true') {
        sessionStorage.removeItem('isAdmin');
        window.location.href = 'admin.html';
        return;
    }
    
    // Load data from storage
    menuItems = safeStorage.getJSON('menuItems') || [];
    orders = safeStorage.getJSON('orders') || [];
    contactMessages = safeStorage.getJSON('contactMessages') || [];
    
    updateNavigation();
    updateCart();
    updateContactForm();
    
    const hash = window.location.hash.substring(1);
    const validSections = ['home', 'menu', 'orders', 'contact', 'profile', 'login', 'help'];
    
    if (hash === 'logout') {
        showLogoutConfirmModal();
        return;
    }
    
    if (hash && validSections.includes(hash)) {
        setActiveSection(hash);
    } else {
        // Default to home
        setActiveSection('home');
        window.location.hash = 'home';
    }
}

// Handle browser back/forward buttons
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    const validSections = ['home', 'menu', 'orders', 'contact', 'profile', 'login', 'help'];
    
    if (hash === 'logout') {
        showLogoutConfirmModal();
        return;
    }
    
    if (hash && validSections.includes(hash)) {
        setActiveSection(hash);
        closeSidebar();
    }
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (sidebar && sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        hamburgerBtn && !hamburgerBtn.contains(e.target) &&
        e.target !== overlay) {
        closeSidebar();
    }
});

// Handle form submissions
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form type
        const isContactForm = this.classList.contains('contact-form');
        const isLoginForm = this.classList.contains('login-form');
        const isRegisterForm = this.classList.contains('register-form');
        
        if (isContactForm) {
            const name = contactNameInput?.value.trim() || '';
            const email = contactEmailInput?.value.trim() || '';
            const message = contactMessageInput?.value.trim() || '';
            
            if (!name || !email || !message) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            // Save contact message
            saveContactMessage(name, email, message);
            
            showToast('Thank you for your message! We will get back to you soon.');
            this.reset();
            // Re-populate with user details if logged in
            if (currentUser && contactNameInput && contactEmailInput) {
                contactNameInput.value = currentUser.name;
                contactEmailInput.value = currentUser.email;
            }
        } else if (isLoginForm) {
            const email = document.getElementById('loginEmail')?.value || '';
            const password = document.getElementById('loginPassword')?.value || '';
            
            // Check credentials - ensure users is an array
            let users = safeStorage.getJSON('users');
            if (!users || !Array.isArray(users)) {
                users = [];
            }
            
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                currentUser = user;
                safeStorage.setJSON('currentUser', currentUser);
                
                // Check if user is manager or admin and redirect
                if (checkUserTypeAndRedirect()) {
                    return;
                }
                
                updateNavigation();
                updateContactForm();
                showToast('Login successful!');
                showLoginForm();
                setActiveSection('home');
                updateCartVisibility();
            } else {
                // Check for manager credentials
                if (email === 'manager@mnt.com' && password === 'manager123') {
                    currentUser = { email: 'manager@mnt.com', password: 'manager123', name: 'Manager', phone: '' };
                    safeStorage.setJSON('currentUser', currentUser);
                    checkUserTypeAndRedirect();
                    return;
                }
                
                // Check for admin credentials
                if (email === 'admin@admin.com' && password === 'admin123') {
                    currentUser = { email: 'admin@admin.com', password: 'admin123', name: 'Tumelo Segale', phone: '' };
                    safeStorage.setJSON('currentUser', currentUser);
                    checkUserTypeAndRedirect();
                    return;
                }
                
                showToast('Invalid email or password', 'error');
            }
            
            this.reset();
        } else if (isRegisterForm) {
            const name = document.getElementById('registerName')?.value || '';
            const email = document.getElementById('registerEmail')?.value || '';
            const phone = document.getElementById('registerPhone')?.value || '';
            const password = document.getElementById('registerPassword')?.value || '';
            const confirmPassword = document.getElementById('registerConfirmPassword')?.value || '';
            
            // Validation
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            
            // Check if user already exists - ensure users is an array
            let users = safeStorage.getJSON('users');
            if (!users || !Array.isArray(users)) {
                users = [];
            }
            
            if (users.some(u => u.email === email)) {
                showToast('Email already registered', 'error');
                return;
            }
            
            // Don't allow registration with manager/admin emails
            if (email === 'manager@mnt.com' || email === 'admin@admin.com') {
                showToast('This email is reserved for staff', 'error');
                return;
            }
            
            // Create new user
            const newUser = { name, email, phone, password };
            users.push(newUser);
            safeStorage.setJSON('users', users);
            
            // Auto login
            currentUser = newUser;
            safeStorage.setJSON('currentUser', newUser);
            updateNavigation();
            updateContactForm();
            showToast('Registration successful!');
            showLoginForm();
            setActiveSection('home');
            
            this.reset();
        }
    });
});

// Form switching
if (showRegister) showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterForm();
});

if (showLogin) showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

// Menu filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        showMenuCategory(btn.dataset.filter);
        // Clear search when changing filter
        if (menuSearch) menuSearch.value = '';
        // Show all items in the selected category
        document.querySelectorAll('.menu-item').forEach(item => {
            if (item.dataset.category === btn.dataset.filter) {
                item.style.display = 'block';
            }
        });
        // Remove any no-results messages
        document.querySelectorAll('.no-results').forEach(el => el.remove());
    });
});

// Menu search
if (menuSearch) menuSearch.addEventListener('input', (e) => {
    searchMenuItems(e.target.value);
});

// Cart functionality
if (cartBtn) cartBtn.addEventListener('click', toggleCartModal);
if (closeCart) closeCart.addEventListener('click', () => {
    if (cartModal) cartModal.classList.remove('active');
});

// Order modal functionality
if (closeOrderModal) closeOrderModal.addEventListener('click', closeOrderModalFunc);

// Close order modal when clicking outside
if (orderModal) orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        closeOrderModalFunc();
    }
});

// Close order modal with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && orderModal && orderModal.classList.contains('active')) {
        closeOrderModalFunc();
    }
});

// Checkout button
if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    
    if (!currentUser) {
        showToast('Login to checkout', 'error');
        setActiveSection('login');
        return;
    }
    
    if (!isWithinOperatingHours()) {
        showToast('Orders can only be placed during operating hours', 'error');
        return;
    }
    
    // Process payment with Paystack
    processPayment();
});

// Profile edit functionality
if (editProfileBtn) editProfileBtn.addEventListener('click', showEditProfileModal);
if (deleteProfileBtn) deleteProfileBtn.addEventListener('click', showDeleteConfirmModal);

// Profile edit modal functionality
if (closeProfileEditModal) closeProfileEditModal.addEventListener('click', closeEditProfileModal);
if (cancelProfileEdit) cancelProfileEdit.addEventListener('click', closeEditProfileModal);

// Close profile edit modal when clicking outside
if (profileEditModal) profileEditModal.addEventListener('click', (e) => {
    if (e.target === profileEditModal) {
        closeEditProfileModal();
    }
});

// Save profile changes
if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfileChanges);

// Delete confirmation modal functionality
if (closeDeleteModal) closeDeleteModal.addEventListener('click', closeDeleteConfirmModal);
if (cancelDelete) cancelDelete.addEventListener('click', closeDeleteConfirmModal);

// Close delete modal when clicking outside
if (deleteConfirmModal) deleteConfirmModal.addEventListener('click', (e) => {
    if (e.target === deleteConfirmModal) {
        closeDeleteConfirmModal();
    }
});

// Confirm delete
if (confirmDelete) confirmDelete.addEventListener('click', deleteUserProfile);

// Logout confirmation modal functionality
if (closeLogoutModal) closeLogoutModal.addEventListener('click', closeLogoutConfirmModal);
if (cancelLogout) cancelLogout.addEventListener('click', closeLogoutConfirmModal);

// Close logout modal when clicking outside
if (logoutConfirmModal) logoutConfirmModal.addEventListener('click', (e) => {
    if (e.target === logoutConfirmModal) {
        closeLogoutConfirmModal();
    }
});

// Confirm logout
if (confirmLogout) confirmLogout.addEventListener('click', handleLogout);

// Close modals with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (orderModal && orderModal.classList.contains('active')) {
            closeOrderModalFunc();
        }
        if (profileEditModal && profileEditModal.classList.contains('active')) {
            closeEditProfileModal();
        }
        if (deleteConfirmModal && deleteConfirmModal.classList.contains('active')) {
            closeDeleteConfirmModal();
        }
        if (logoutConfirmModal && logoutConfirmModal.classList.contains('active')) {
            closeLogoutConfirmModal();
        }
    }
});

// Listen for real-time updates from manager
window.addEventListener('ordersUpdated', function() {
    // Reload orders when manager updates them
    orders = safeStorage.getJSON('orders') || [];
    if (document.getElementById('orders')?.classList.contains('active') && currentUser) {
        displayOrders();
        showToast('Order status updated!', 'success');
    }
});

window.addEventListener('menuItemsUpdated', function() {
    // Reload menu items when manager updates them
    menuItems = safeStorage.getJSON('menuItems') || [];
    if (document.getElementById('menu')?.classList.contains('active')) {
        displayMenuItems();
    }
});

// Initialize page on load
document.addEventListener('DOMContentLoaded', handleInitialLoad);

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

// Initial check and resize listener
checkDevice();
window.addEventListener('resize', checkDevice);

// Add Paystack script dynamically if not already loaded
if (typeof PaystackPop === 'undefined') {
    const paystackScript = document.createElement('script');
    paystackScript.src = 'https://js.paystack.co/v1/inline.js';
    paystackScript.onload = function() {
        console.log('Paystack script loaded successfully');
    };
    paystackScript.onerror = function() {
        console.error('Failed to load Paystack script');
        showToast('Payment System not available.', 'error');
    };
    document.head.appendChild(paystackScript);
}