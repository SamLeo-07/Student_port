// Authentication System

// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        // User is already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }

    initializeAuthPage();
});

function initializeAuthPage() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const formWrappers = document.querySelectorAll('.form-wrapper');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetTab = this.getAttribute('data-tab');

            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding form
            formWrappers.forEach(wrapper => {
                wrapper.classList.remove('active');
                if (wrapper.id === `${targetTab}-form`) {
                    wrapper.classList.add('active');
                }
            });

            // Clear any error messages
            clearMessages();
        });
    });

    // Switch form links
    const switchLinks = document.querySelectorAll('.switch-form');
    switchLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetTab = this.getAttribute('data-target');
            const targetBtn = document.querySelector(`.tab-btn[data-tab="${targetTab}"]`);
            if (targetBtn) {
                targetBtn.click();
            }
        });
    });

    // Password toggle
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);

            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

    // Login form submission
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);

    // Signup form submission
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', handleSignup);
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    // Validate inputs
    if (!email || !password) {
        showError('login-error', 'Please fill in all fields');
        return;
    }

    // First, check if it's an admin login
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    const admin = admins.find(a =>
        a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (admin) {
        // Admin login successful
        const adminData = {
            name: admin.name,
            email: admin.email,
            role: 'admin',
            loginTime: new Date().toISOString()
        };

        // Store current admin
        localStorage.setItem('currentAdmin', JSON.stringify(adminData));

        if (rememberMe) {
            localStorage.setItem('rememberAdmin', 'true');
        }

        // Redirect to admin dashboard
        window.location.href = 'admin-dashboard.html';
        return;
    }

    // If not admin, check student credentials
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Find user
    const user = users.find(u =>
        (u.email.toLowerCase() === email.toLowerCase() || u.name.toLowerCase() === email.toLowerCase())
        && u.password === password
    );

    if (user) {
        // Student login successful
        const userData = {
            name: user.name,
            email: user.email,
            batch: user.batch,
            loginTime: new Date().toISOString()
        };

        // Store current user
        localStorage.setItem('currentUser', JSON.stringify(userData));

        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }

        // Redirect to student dashboard
        window.location.href = 'dashboard.html';
    } else {
        showError('login-error', 'Invalid email/username or password');
    }
}

function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const batch = document.getElementById('signup-batch').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    // Validate inputs
    if (!name || !email || !batch || !password || !confirmPassword) {
        showError('signup-error', 'Please fill in all fields');
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('signup-error', 'Please enter a valid email address');
        return;
    }

    // Validate password length
    if (password.length < 6) {
        showError('signup-error', 'Password must be at least 6 characters long');
        return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        showError('signup-error', 'Passwords do not match');
        return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        showError('signup-error', 'An account with this email already exists');
        return;
    }

    // Generate unique student ID
    const studentId = 'STU' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Create new user
    const newUser = {
        id: studentId,
        name: name,
        email: email,
        batch: batch,
        password: password,
        assignedCourses: [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Add to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Sync to portalData for admin access
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    if (!portalData.students) portalData.students = [];

    // Add student (without password for security)
    portalData.students.push({
        id: studentId,
        name: name,
        email: email,
        batch: batch,
        assignedCourses: [],
        status: 'active',
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
    });

    // Update statistics
    if (!portalData.statistics) portalData.statistics = {};
    portalData.statistics.totalStudents = portalData.students.length;

    localStorage.setItem('portalData', JSON.stringify(portalData));

    // Show success message
    showSuccess('signup-success', 'Account created successfully! Redirecting to login...');

    // Clear form
    document.getElementById('signupForm').reset();

    // Switch to login tab after 2 seconds
    setTimeout(() => {
        document.querySelector('.tab-btn[data-tab="login"]').click();

        // Pre-fill email in login form
        document.getElementById('login-email').value = email;

        clearMessages();
    }, 2000);
}

function showError(elementId, message) {
    clearMessages();
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function showSuccess(elementId, message) {
    clearMessages();
    const successElement = document.getElementById(elementId);
    successElement.textContent = message;
    successElement.classList.add('show');
}

function clearMessages() {
    const messages = document.querySelectorAll('.error-message, .success-message');
    messages.forEach(msg => {
        msg.classList.remove('show');
        msg.textContent = '';
    });
}

// Create a default demo account on first load
if (!localStorage.getItem('users')) {
    const demoUsers = [
        {
            id: 'STU' + Date.now(),
            name: 'B Hemanth Kumar',
            email: 'hemanth@cynexai.com',
            batch: '37R',
            password: 'demo123',
            assignedCourses: [],
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('users', JSON.stringify(demoUsers));
}
