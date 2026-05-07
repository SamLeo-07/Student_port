// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Load admin data
    loadAdminData();

    // Setup logout
    setupLogout();

    // Setup navigation
    setupNavigation();

    // Load statistics
    loadStatistics();

    // Load students
    loadStudents();

    // Setup form handlers
    setupFormHandlers();

    // Load dynamic content
    loadCourses();
    loadVideos();
    loadAnnouncements();

    // Populate course dropdown for videos
    updateVideoCourseDropdown();
});

// Load admin data from session
function loadAdminData() {
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));

    if (currentAdmin) {
        const adminNameElement = document.getElementById('adminName');
        if (adminNameElement) {
            adminNameElement.textContent = currentAdmin.name;
        }
    }
}

// Setup logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('currentAdmin');
                window.location.href = 'admin-login.html';
            }
        });
    }
}

// Setup navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            const sectionId = this.getAttribute('data-section');

            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Show corresponding section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${sectionId}-section`) {
                    section.classList.add('active');
                }
            });
        });
    });

    // Quick action buttons
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const sectionId = this.getAttribute('data-section');
            const targetNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
            if (targetNav) {
                targetNav.click();
            }
        });
    });
}

// Load statistics
function loadStatistics() {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Update stats
    document.getElementById('totalStudents').textContent = users.length;
    document.getElementById('totalCourses').textContent = (portalData.courses || []).length;
    document.getElementById('totalVideos').textContent = (portalData.videos || []).length;
    document.getElementById('totalCertificates').textContent = (portalData.certificates || []).length;
}

// Load students
function loadStudents() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const tbody = document.getElementById('studentsTableBody');

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">No students registered yet</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.batch}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// Setup form handlers
function setupFormHandlers() {
    // Add Course Form
    const addCourseForm = document.getElementById('addCourseForm');
    if (addCourseForm) {
        addCourseForm.addEventListener('submit', handleAddCourse);
    }

    // Add Video Form
    const addVideoForm = document.getElementById('addVideoForm');
    if (addVideoForm) {
        addVideoForm.addEventListener('submit', handleAddVideo);
    }

    // Issue Certificate Form
    const issueCertForm = document.getElementById('issueCertificateForm');
    if (issueCertForm) {
        issueCertForm.addEventListener('submit', handleIssueCertificate);
    }

    // Add Announcement Form
    const addAnnouncementForm = document.getElementById('addAnnouncementForm');
    if (addAnnouncementForm) {
        addAnnouncementForm.addEventListener('submit', handleAddAnnouncement);
    }

    // Add Question Form
    const addQuestionForm = document.getElementById('addQuestionForm');
    if (addQuestionForm) {
        addQuestionForm.addEventListener('submit', handleAddQuestion);
    }
}

// Handle Add Course
function handleAddCourse(e) {
    e.preventDefault();

    const name = document.getElementById('courseName').value;
    const category = document.getElementById('courseCategory').value;
    const description = document.getElementById('courseDescription').value;

    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    if (!portalData.courses) portalData.courses = [];

    const newCourse = {
        id: Date.now(),
        name,
        category,
        description,
        createdAt: new Date().toISOString()
    };

    portalData.courses.push(newCourse);
    localStorage.setItem('portalData', JSON.stringify(portalData));

    // Reset form
    e.target.reset();

    // Reload courses and stats
    loadCourses();
    loadStatistics();
    updateVideoCourseDropdown();

    showSuccessMessage('Course added successfully!');
}

// Handle Add Video
function handleAddVideo(e) {
    e.preventDefault();

    const title = document.getElementById('videoTitle').value;
    const course = document.getElementById('videoCourse').value;
    const url = document.getElementById('videoUrl').value;
    const description = document.getElementById('videoDescription').value;

    if (!course) {
        alert('Please select a course');
        return;
    }

    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    if (!portalData.videos) portalData.videos = [];

    const newVideo = {
        id: Date.now(),
        title,
        course,
        url,
        description,
        createdAt: new Date().toISOString()
    };

    portalData.videos.push(newVideo);
    localStorage.setItem('portalData', JSON.stringify(portalData));

    // Reset form
    e.target.reset();

    // Reload videos and stats
    loadVideos();
    loadStatistics();

    showSuccessMessage('Video added successfully!');
}

// Handle Issue Certificate
function handleIssueCertificate(e) {
    e.preventDefault();

    const studentEmail = document.getElementById('certStudentEmail').value;
    const courseName = document.getElementById('certCourseName').value;
    const issueDate = document.getElementById('certIssueDate').value;

    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    if (!portalData.certificates) portalData.certificates = [];

    const newCertificate = {
        id: Date.now(),
        studentEmail,
        courseName,
        issueDate,
        createdAt: new Date().toISOString()
    };

    portalData.certificates.push(newCertificate);
    localStorage.setItem('portalData', JSON.stringify(portalData));

    // Reset form
    e.target.reset();

    // Reload stats
    loadStatistics();

    showSuccessMessage('Certificate issued successfully!');
}

// Handle Add Announcement
function handleAddAnnouncement(e) {
    e.preventDefault();

    const title = document.getElementById('announcementTitle').value;
    const message = document.getElementById('announcementMessage').value;
    const priority = document.getElementById('announcementPriority').value;

    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    if (!portalData.announcements) portalData.announcements = [];

    const newAnnouncement = {
        id: Date.now(),
        title,
        message,
        priority,
        createdAt: new Date().toISOString()
    };

    portalData.announcements.push(newAnnouncement);
    localStorage.setItem('portalData', JSON.stringify(portalData));

    // Reset form
    e.target.reset();

    // Reload announcements
    loadAnnouncements();

    showSuccessMessage('Announcement posted successfully!');
}

// Handle Add Question
function handleAddQuestion(e) {
    e.preventDefault();

    const category = document.getElementById('questionCategory').value;
    const difficulty = document.getElementById('questionDifficulty').value;
    const question = document.getElementById('questionText').value;
    const answer = document.getElementById('questionAnswer').value;

    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    if (!portalData.interviewQuestions) portalData.interviewQuestions = [];

    const newQuestion = {
        id: Date.now(),
        category,
        difficulty,
        question,
        answer,
        createdAt: new Date().toISOString()
    };

    portalData.interviewQuestions.push(newQuestion);
    localStorage.setItem('portalData', JSON.stringify(portalData));

    // Reset form
    e.target.reset();

    showSuccessMessage('Interview question added successfully!');
}

// Load Courses
function loadCourses() {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const courses = portalData.courses || [];
    const coursesList = document.getElementById('coursesList');

    if (courses.length === 0) {
        coursesList.innerHTML = '<p class="no-data">No courses added yet</p>';
        return;
    }

    coursesList.innerHTML = courses.map(course => `
        <div class="item-card">
            <div class="item-info">
                <h4>${course.name}</h4>
                <p>${course.category} • ${course.description}</p>
            </div>
            <div class="item-actions">
                <button class="btn-delete" onclick="deleteCourse(${course.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    updateVideoCourseDropdown();
}

// Load Videos
function loadVideos() {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const videos = portalData.videos || [];
    const videosList = document.getElementById('videosList');

    if (videos.length === 0) {
        videosList.innerHTML = '<p class="no-data">No videos uploaded yet</p>';
        return;
    }

    videosList.innerHTML = videos.map(video => `
        <div class="item-card">
            <div class="item-info">
                <h4>${video.title}</h4>
                <p>${video.course} • <a href="${video.url}" target="_blank">View Video</a></p>
            </div>
            <div class="item-actions">
                <button class="btn-delete" onclick="deleteVideo(${video.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Load Announcements
function loadAnnouncements() {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const announcements = portalData.announcements || [];
    const announcementsList = document.getElementById('announcementsList');

    if (announcements.length === 0) {
        announcementsList.innerHTML = '<p class="no-data">No announcements posted yet</p>';
        return;
    }

    announcementsList.innerHTML = announcements.map(announcement => `
        <div class="item-card">
            <div class="item-info">
                <h4>${announcement.title} <span style="color: ${getPriorityColor(announcement.priority)}; font-size: 0.75rem;">[${announcement.priority.toUpperCase()}]</span></h4>
                <p>${announcement.message}</p>
                <small style="color: #6c757d;">${new Date(announcement.createdAt).toLocaleString()}</small>
            </div>
            <div class="item-actions">
                <button class="btn-delete" onclick="deleteAnnouncement(${announcement.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Update video course dropdown
function updateVideoCourseDropdown() {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const courses = portalData.courses || [];
    const dropdown = document.getElementById('videoCourse');

    console.log('Updating video course dropdown...');
    console.log('Found courses:', courses.length);
    console.log('Dropdown element:', dropdown);

    if (!dropdown) {
        console.error('Dropdown element not found!');
        return;
    }

    dropdown.innerHTML = '<option value="">Select Course</option>' +
        courses.map(course => `<option value="${course.name}">${course.name}</option>`).join('');

    console.log('Dropdown updated with', courses.length, 'courses');
}

// Delete functions
function deleteCourse(id) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    portalData.courses = (portalData.courses || []).filter(c => c.id !== id);
    localStorage.setItem('portalData', JSON.stringify(portalData));

    loadCourses();
    loadStatistics();
}

function deleteVideo(id) {
    if (!confirm('Are you sure you want to delete this video?')) return;

    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    portalData.videos = (portalData.videos || []).filter(v => v.id !== id);
    localStorage.setItem('portalData', JSON.stringify(portalData));

    loadVideos();
    loadStatistics();
}

function deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    portalData.announcements = (portalData.announcements || []).filter(a => a.id !== id);
    localStorage.setItem('portalData', JSON.stringify(portalData));

    loadAnnouncements();
}

// Helper functions
function getPriorityColor(priority) {
    switch (priority) {
        case 'urgent': return '#e74c3c';
        case 'important': return '#f39c12';
        default: return '#3498db';
    }
}

function showSuccessMessage(message) {
    // Create success message element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message show';
    successDiv.textContent = message;

    // Insert at top of active section
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        activeSection.insertBefore(successDiv, activeSection.firstChild);

        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}