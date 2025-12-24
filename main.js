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

// Toast element
const toast = document.getElementById('toast');

// State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
let contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];

// Show toast message
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.style.background = type === 'success' ? '#28a745' : '#dc3545';
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

// Format date to DD MMM YYYY (e.g., 12 Nov 2025)
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
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

// Check user type and redirect if needed
function checkUserTypeAndRedirect() {
    if (!currentUser) return false;
    
    // Check if user is manager
    if (currentUser.email === 'manager@mnt.com' && currentUser.password === 'manager123') {
        window.location.href = 'manager.html';
        return true;
    }
    
    // Check if user is admin
    if (currentUser.email === 'admin@admin.com' && currentUser.password === 'admin123') {
        // For now, redirect to manager dashboard
        window.location.href = 'admin.html';
        return true;
    }
    
    return false;
}

// Display orders in the orders section
function displayOrders() {
    const ordersContainer = document.getElementById('ordersContainer');
    
    if (!currentUser) {
        ordersContainer.innerHTML = `
            <div class="empty-orders">
                <p>Please login to view your orders.</p>
                <a href="#login" class="hero-btn">Login</a>
            </div>
        `;
        return;
    }
    
    const userOrders = orders.filter(order => order.userEmail === currentUser.email);
    
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
    userOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    userOrders.forEach(order => {
        const statusClass = getStatusClass(order.status);
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.dataset.orderId = order.id;
        orderElement.innerHTML = `
            <div class="order-item-header">
                <h4>${order.orderId}</h4>
                <span class="order-date">${formatDate(order.timestamp)}</span>
            </div>
            <div class="order-item-body">
                <p><strong>Status:</strong> <span class="order-status ${statusClass}">${order.status}</span></p>
                <p><strong>Total:</strong> R ${order.total.toFixed(2)}</p>
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
            const order = userOrders.find(o => o.id.toString() === orderId);
            if (order) {
                showOrderDetails(order);
            }
        });
    });
}

// Show order details in modal
function showOrderDetails(order) {
    const statusClass = getStatusClass(order.status);
    
    orderModalBody.innerHTML = `
        <div class="order-details">
            <div class="order-detail-row">
                <strong>Order ID:</strong>
                <span>${order.orderId}</span>
            </div>
            <div class="order-detail-row">
                <strong>Date:</strong>
                <span>${formatDate(order.timestamp)}</span>
            </div>
            <div class="order-detail-row">
                <strong>Status:</strong>
                <span class="order-status ${statusClass}">${order.status}</span>
            </div>
            <div class="order-pin">
                <div class="pin-label">Collection PIN:</div>
                <div class="pin-code">${order.pin}</div>
            </div>
            <div class="order-items">
                <h4>Items:</h4>
                ${order.items.map(item => `
                    <div class="order-item-detail">
                        <span>${item.quantity}x ${item.name}</span>
                        <span>R ${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <strong>Total Amount:</strong>
                <span>R ${order.total.toFixed(2)}</span>
            </div>
        </div>
    `;
    
    orderModal.classList.add('active');
}

// Close order modal
function closeOrderModalFunc() {
    orderModal.classList.remove('active');
}

// Update contact form with user details (if logged in)
function updateContactForm() {
    if (currentUser) {
        contactNameInput.value = currentUser.name;
        contactEmailInput.value = currentUser.email;
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

// Update the displayMenuItems function in main.js to ensure it only shows available items
function displayMenuItems() {
    const mealsContainer = document.querySelector('.menu-category.meals');
    const drinksContainer = document.querySelector('.menu-category.drinks');
    
    // Clear existing items
    mealsContainer.innerHTML = '';
    drinksContainer.innerHTML = '';
    
    // Filter active menu items (only those with active: true)
    const activeMenuItems = menuItems.filter(item => item.active === true);
    
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
                <h3>${item.name}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <span class="price">R ${item.price.toFixed(2)}</span>
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
                <h3>${item.name}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <span class="price">R ${item.price.toFixed(2)}</span>
                <button class="add-to-cart">Add to Cart</button>
            `;
            drinksContainer.appendChild(menuItemElement);
        });
    }
    
    // Add event listeners to new add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const menuItem = this.closest('.menu-item');
            const itemName = menuItem.querySelector('h3').textContent;
            const price = menuItem.dataset.price;
            const category = menuItem.dataset.category;
            
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
                setActiveSection('home');
            }
        }
    });
    
    if (loginLogoutLink) {
        if (isLoggedIn) {
            loginLogoutLink.textContent = 'Logout';
            loginLogoutLink.setAttribute('href', '#logout');
            loginLogoutLink.onclick = handleLogout;
        } else {
            loginLogoutLink.textContent = 'Login';
            loginLogoutLink.setAttribute('href', '#login');
            loginLogoutLink.onclick = handleNavClick;
        }
    }
}

// Toggle sidebar function
function toggleSidebar() {
    hamburgerBtn.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');

    // Prevent body scroll when sidebar is open
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

// Handle logout - Clear currentUser and redirect properly
function handleLogout(e) {
    e.preventDefault();
    
    // Clear current user
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Clear cart
    cart = [];
    saveCartToStorage();
    
    updateNavigation();
    showToast('Logged out successfully');
    setActiveSection('home');
    closeSidebar();
    window.location.hash = 'home';
}

// Show login/register form
function showLoginForm() {
    formTitle.textContent = 'Login';
    formSubtitle.textContent = 'Access your M&T account to make online orders, view order history, and more.';
    loginForm.classList.add('active-form');
    registerForm.classList.remove('active-form');
}

function showRegisterForm() {
    formTitle.textContent = 'Register';
    formSubtitle.textContent = 'Create your M&T account to make online orders and enjoy exclusive benefits.';
    loginForm.classList.remove('active-form');
    registerForm.classList.add('active-form');
}

// Update profile information
function updateProfileInfo() {
    if (currentUser) {
        profileName.textContent = currentUser.name;
        profileEmail.textContent = currentUser.email;
        profilePhone.textContent = currentUser.phone;
    }
}

// Show edit profile modal
function showEditProfileModal() {
    if (!currentUser) return;
    
    editNameInput.value = currentUser.name;
    editEmailInput.value = currentUser.email;
    editPhoneInput.value = currentUser.phone;
    
    // Clear password fields
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    
    profileEditModal.classList.add('active');
}

// Close edit profile modal
function closeEditProfileModal() {
    profileEditModal.classList.remove('active');
}

// Save profile changes
function saveProfileChanges() {
    if (!currentUser) return;
    
    const name = editNameInput.value.trim();
    const email = editEmailInput.value.trim();
    const phone = editPhoneInput.value.trim();
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Basic validation
    if (!name || !email || !phone) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Get users from storage
    const users = JSON.parse(localStorage.getItem('users')) || [];
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
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user
    currentUser = users[userIndex];
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update profile display
    updateProfileInfo();
    
    // Update contact form if email changed
    if (contactEmailInput.value === currentUser.email) {
        contactNameInput.value = currentUser.name;
        contactEmailInput.value = currentUser.email;
    }
    
    closeEditProfileModal();
    showToast('Profile updated successfully');
}

// Show delete confirmation modal
function showDeleteConfirmModal() {
    deleteConfirmModal.classList.add('active');
}

// Close delete confirmation modal
function closeDeleteConfirmModal() {
    deleteConfirmModal.classList.remove('active');
}

// Delete user profile
function deleteUserProfile() {
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.filter(u => u.email !== currentUser.email);
    
    // Remove user from storage
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Clear current user
    currentUser = null;
    localStorage.removeItem('currentUser');
    
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
        const itemName = item.querySelector('h3').textContent.toLowerCase();
        const itemDesc = item.querySelector('p').textContent.toLowerCase();
        
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
    
    const existingItem = cart.find(item => item.name === itemName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: itemName,
            price: parseFloat(price),
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
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
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
                    <h4>${item.name}</h4>
                    <p>R ${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn decrease" data-item="${item.name}">-</button>
                    <span>${item.quantity}</span>
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
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = `R ${total.toFixed(2)}`;
}

function updateCartVisibility() {
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
    cartModal.classList.toggle('active');
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function saveOrder() {
    if (cart.length === 0) return;
    
    const order = {
        id: Date.now(),
        orderId: generateOrderId(),
        timestamp: new Date().toISOString(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        userEmail: currentUser.email,
        pin: generatePin(),
        status: 'pending' // Ensure lowercase status
    };
    
    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Display updated orders
    if (document.getElementById('orders').classList.contains('active')) {
        displayOrders();
    }
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
    
    contactMessages.unshift(contactMessage);
    localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
}

// Event listeners
hamburgerBtn.addEventListener('click', toggleSidebar);
overlay.addEventListener('click', closeSidebar);

// Navigation links
navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
});

// Close sidebar on escape key press
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
        closeSidebar();
    }
});

// Handle initial page load based on URL hash
function handleInitialLoad() {
    
    // Load data from storage
    menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    orders = JSON.parse(localStorage.getItem('orders')) || [];
    contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    
    updateNavigation();
    updateCart();
    updateContactForm();
    
    const hash = window.location.hash.substring(1);
    const validSections = ['home', 'menu', 'orders', 'contact', 'profile', 'login', 'help', 'logout'];
    
    if (hash === 'logout') {
        handleLogout(new Event('click'));
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
    const validSections = ['home', 'menu', 'orders', 'contact', 'profile', 'login', 'help', 'logout'];
    
    if (hash === 'logout') {
        handleLogout(new Event('click'));
        return;
    }
    
    if (hash && validSections.includes(hash)) {
        setActiveSection(hash);
        closeSidebar();
    }
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !hamburgerBtn.contains(e.target) &&
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
            const name = contactNameInput.value.trim();
            const email = contactEmailInput.value.trim();
            const message = contactMessageInput.value.trim();
            
            if (!name || !email || !message) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            // Save contact message
            saveContactMessage(name, email, message);
            
            showToast('Thank you for your message! We will get back to you soon.');
            this.reset();
            // Re-populate with user details if logged in
            if (currentUser) {
                contactNameInput.value = currentUser.name;
                contactEmailInput.value = currentUser.email;
            }
        } else if (isLoginForm) {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Check credentials
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
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
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    checkUserTypeAndRedirect();
                    return;
                }
                
                // Check for admin credentials
                if (email === 'admin@admin.com' && password === 'admin123') {
                    currentUser = { email: 'admin@admin.com', password: 'admin123', name: 'Tumelo Segale', phone: '' };
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    checkUserTypeAndRedirect();
                    return;
                }
                
                showToast('Invalid email or password', 'error');
            }
            
            this.reset();
        } else if (isRegisterForm) {
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const phone = document.getElementById('registerPhone').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            // Validation
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            
            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('users')) || [];
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
            localStorage.setItem('users', JSON.stringify(users));
            
            // Auto login
            currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
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
showRegister?.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterForm();
});

showLogin?.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

// Menu filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        showMenuCategory(btn.dataset.filter);
        // Clear search when changing filter
        menuSearch.value = '';
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
menuSearch?.addEventListener('input', (e) => {
    searchMenuItems(e.target.value);
});

// Cart functionality
cartBtn?.addEventListener('click', toggleCartModal);
closeCart?.addEventListener('click', () => {
    cartModal.classList.remove('active');
});

// Order modal functionality
closeOrderModal?.addEventListener('click', closeOrderModalFunc);

// Close order modal when clicking outside
orderModal?.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        closeOrderModalFunc();
    }
});

// Close order modal with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && orderModal.classList.contains('active')) {
        closeOrderModalFunc();
    }
});

// Checkout button
checkoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    
    if (!currentUser) {
        showToast('Login to checkout', 'error');
        setActiveSection('login');
        return;
    }
    
    // Save order
    saveOrder();
    
    // Show success message with PIN
    const latestOrder = orders.find(order => order.userEmail === currentUser.email && order.timestamp > Date.now() - 1000);
    if (latestOrder) {
        showToast(`Order placed successfully! Your PIN: ${latestOrder.pin}. Order status: ${latestOrder.status}`);
    } else {
        showToast('Order placed successfully!');
    }
    
    // Clear cart
    cart = [];
    updateCart();
    updateCartVisibility();
    saveCartToStorage();
    cartModal.classList.remove('active');
    
    // Navigate to orders section
    setActiveSection('orders');
});

// Profile edit functionality
editProfileBtn?.addEventListener('click', showEditProfileModal);
deleteProfileBtn?.addEventListener('click', showDeleteConfirmModal);

// Profile edit modal functionality
closeProfileEditModal?.addEventListener('click', closeEditProfileModal);
cancelProfileEdit?.addEventListener('click', closeEditProfileModal);

// Close profile edit modal when clicking outside
profileEditModal?.addEventListener('click', (e) => {
    if (e.target === profileEditModal) {
        closeEditProfileModal();
    }
});

// Save profile changes
saveProfileBtn?.addEventListener('click', saveProfileChanges);

// Delete confirmation modal functionality
closeDeleteModal?.addEventListener('click', closeDeleteConfirmModal);
cancelDelete?.addEventListener('click', closeDeleteConfirmModal);

// Close delete modal when clicking outside
deleteConfirmModal?.addEventListener('click', (e) => {
    if (e.target === deleteConfirmModal) {
        closeDeleteConfirmModal();
    }
});

// Confirm delete
confirmDelete?.addEventListener('click', deleteUserProfile);

// Close modals with escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (orderModal.classList.contains('active')) {
            closeOrderModalFunc();
        }
        if (profileEditModal.classList.contains('active')) {
            closeEditProfileModal();
        }
        if (deleteConfirmModal.classList.contains('active')) {
            closeDeleteConfirmModal();
        }
    }
});

// Listen for real-time updates from manager
window.addEventListener('ordersUpdated', function() {
    // Reload orders when manager updates them
    orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (document.getElementById('orders').classList.contains('active') && currentUser) {
        displayOrders();
        showToast('Order status updated!', 'success');
    }
});

window.addEventListener('menuItemsUpdated', function() {
    // Reload menu items when manager updates them
    menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    if (document.getElementById('menu').classList.contains('active')) {
        displayMenuItems();
    }
});

// Initialize page on load
document.addEventListener('DOMContentLoaded', handleInitialLoad);

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

// Check if within operating hours
function isWithinOperatingHours() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour + minute / 60;
    
    // Operating hours:
    // Monday-Saturday: 09:00 - 20:00
    // Sunday & Holidays: 10:00 - 19:00
    
    if (day === 0) { // Sunday
        return currentTime >= 10 && currentTime < 19;
    } else { // Monday-Saturday
        return currentTime >= 9 && currentTime < 20;
    }
}

// Update checkout function in main.js
checkoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    
    if (!currentUser) {
        showToast('Login to checkout', 'error');
        setActiveSection('login');
        return;
    }
    
    // Check operating hours
    if (!isWithinOperatingHours()) {
        const now = new Date();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        showToast(`Orders can only be placed during operating hours. Today (${dayNames[now.getDay()]}) hours: ${now.getDay() === 0 ? '10:00-19:00' : '09:00-20:00'}`, 'error');
        return;
    }
    
    // Redirect to Paystack payment
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Save cart temporarily for payment callback
    localStorage.setItem('pendingCart', JSON.stringify(cart));
    
    // Initialize Paystack payment
    const handler = PaystackPop.setup({
        key: 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY', // Replace with your Paystack public key
        email: currentUser.email,
        amount: total * 100, // Convert to kobo
        currency: 'ZAR',
        ref: 'MNT' + Date.now(),
        callback: function(response) {
            // Payment successful
            if (response.status === 'success') {
                // Save order
                saveOrder();
                
                // Clear cart
                cart = [];
                updateCart();
                updateCartVisibility();
                saveCartToStorage();
                localStorage.removeItem('pendingCart');
                
                cartModal.classList.remove('active');
                
                // Show success message
                const latestOrder = orders.find(order => order.userEmail === currentUser.email && order.timestamp > Date.now() - 1000);
                if (latestOrder) {
                    showToast(`Payment successful! Order placed. Your PIN: ${latestOrder.pin}. Order status: ${latestOrder.status}`);
                } else {
                    showToast('Payment successful! Order placed.');
                }
                
                // Navigate to orders section
                setActiveSection('orders');
            }
        },
        onClose: function() {
            showToast('Payment cancelled', 'error');
        }
    });
    
    handler.openIframe();
});

// Initial check and resize listener
checkDevice();
window.addEventListener('resize', checkDevice);