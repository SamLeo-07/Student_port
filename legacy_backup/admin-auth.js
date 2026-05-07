// Admin Authentication System

// Check if admin is already logged in on page load
document.addEventListener('DOMContentLoaded', function () {
    const currentAdmin = localStorage.getItem('currentAdmin');
    if (currentAdmin) {
        // Admin is already logged in, redirect to dashboard
        window.location.href = 'admin-dashboard.html';
    }

    initializeAdminAuth();
});

function initializeAdminAuth() {
    // Password toggle
    const togglePasswordBtn = document.querySelector('.toggle-password');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function () {
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
    }

    // Admin login form submission
    const loginForm = document.getElementById('adminLoginForm');
    loginForm.addEventListener('submit', handleAdminLogin);
}

function handleAdminLogin(e) {
    e.preventDefault();

    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const rememberMe = document.getElementById('remember-admin').checked;

    // Validate inputs
    if (!email || !password) {
        showError('login-error', 'Please fill in all fields');
        return;
    }

    // Get admins from localStorage
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');

    // Find admin
    const admin = admins.find(a =>
        a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (admin) {
        // Login successful
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
    } else {
        showError('login-error', 'Invalid admin credentials');
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');

    // Hide after 5 seconds
    setTimeout(() => {
        errorElement.classList.remove('show');
    }, 5000);
}

// Create default admin account on first load
if (!localStorage.getItem('admins')) {
    const defaultAdmins = [
        {
            name: 'Administrator',
            email: 'admin@cynexai.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('admins', JSON.stringify(defaultAdmins));
}

// Initialize portal data structure if not exists
if (!localStorage.getItem('portalData')) {
    const portalData = {
        announcements: [],
        batches: [],
        courses: [
            {
                id: Date.now() + 1,
                name: 'Full Stack Development',
                category: 'Web Development',
                description: 'Master modern web development with React, Node.js, and databases. Build complete web applications from scratch.',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 2,
                name: 'Data Science & Machine Learning',
                category: 'Data Science',
                description: 'Learn Python, data analysis, machine learning algorithms, and AI fundamentals for real-world applications.',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 3,
                name: 'Cloud Computing (AWS/Azure)',
                category: 'Cloud & DevOps',
                description: 'Master cloud platforms, deployment strategies, and scalable infrastructure management.',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 4,
                name: 'DevOps & CI/CD',
                category: 'Cloud & DevOps',
                description: 'Learn automation, continuous integration, deployment pipelines, and modern DevOps practices.',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 5,
                name: 'Mobile App Development',
                category: 'Mobile Development',
                description: 'Build native and cross-platform mobile applications using React Native and Flutter.',
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 6,
                name: 'Cybersecurity Fundamentals',
                category: 'Security',
                description: 'Understand security principles, ethical hacking, network security, and threat prevention.',
                createdAt: new Date().toISOString()
            }
        ],
        videos: [],
        certificates: [],
        interviewQuestions: [],
        students: [],
        statistics: {
            totalStudents: 0,
            totalCourses: 6,
            totalVideos: 0,
            totalCertificates: 0
        }
    };
    localStorage.setItem('portalData', JSON.stringify(portalData));
}

