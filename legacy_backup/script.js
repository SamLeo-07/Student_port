// Navigation Active State Management
document.addEventListener('DOMContentLoaded', function () {
    // Load user data from session
    loadUserData();

    // Setup logout button
    setupLogout();

    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');
        });
    });

    // Smooth scroll for internal links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Mobile sidebar toggle (for future implementation)
    const createMobileToggle = () => {
        const toggle = document.createElement('button');
        toggle.className = 'mobile-toggle';
        toggle.innerHTML = '<i class="fas fa-bars"></i>';
        toggle.style.cssText = `
            display: none;
            position: fixed;
            top: 15px;
            left: 15px;
            z-index: 1001;
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.2rem;
        `;

        toggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('active');
        });

        document.body.appendChild(toggle);

        // Show toggle on mobile
        if (window.innerWidth <= 768) {
            toggle.style.display = 'block';
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                toggle.style.display = 'block';
            } else {
                toggle.style.display = 'none';
            }
        });
    };

    createMobileToggle();

    // Add click handlers for stat cards
    const statCardLinks = document.querySelectorAll('.stat-card');
    statCardLinks.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function (e) {
            if (!e.target.closest('.stat-link')) {
                const link = this.querySelector('.stat-link');
                if (link) {
                    console.log('Navigating to:', link.getAttribute('href'));
                    // Add navigation logic here
                }
            }
        });
    });

    // Notification bell animation
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        setInterval(() => {
            notificationIcon.style.animation = 'none';
            setTimeout(() => {
                notificationIcon.style.animation = 'bellRing 0.5s ease';
            }, 10);
        }, 30000); // Ring every 30 seconds
    }

    // Add bell ring animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bellRing {
            0%, 100% { transform: rotate(0deg); }
            10%, 30% { transform: rotate(-10deg); }
            20%, 40% { transform: rotate(10deg); }
            50% { transform: rotate(0deg); }
        }
    `;
    document.head.appendChild(style);

    // Dynamic greeting based on time
    const updateGreeting = () => {
        const hour = new Date().getHours();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userName = currentUser ? currentUser.name : 'Student';
        const welcomeTitle = document.querySelector('.welcome-title');
        if (welcomeTitle) {
            let greeting = 'Welcome back';
            if (hour < 12) greeting = 'Good morning';
            else if (hour < 18) greeting = 'Good afternoon';
            else greeting = 'Good evening';

            welcomeTitle.textContent = `${greeting}, ${userName}! 👋`;
        }
    };

    updateGreeting();
});

// Load user data from localStorage
function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        // Update user name
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = currentUser.name;
        }

        // Update user batch
        const userBatchElement = document.getElementById('userBatch');
        if (userBatchElement) {
            userBatchElement.textContent = `Batch: ${currentUser.batch}`;
        }

        // Update welcome title
        const welcomeTitle = document.getElementById('welcomeTitle');
        if (welcomeTitle) {
            const hour = new Date().getHours();
            let greeting = 'Welcome back';
            if (hour < 12) greeting = 'Good morning';
            else if (hour < 18) greeting = 'Good afternoon';
            else greeting = 'Good evening';

            welcomeTitle.textContent = `${greeting}, ${currentUser.name}! 👋`;
        }
    }
}

// Setup logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            // Confirm logout
            if (confirm('Are you sure you want to logout?')) {
                // Clear current user session
                localStorage.removeItem('currentUser');

                // Redirect to login page
                window.location.href = 'index.html';
            }
        });
    }
}

// Convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url) {
    if (!url) return '';

    // Already an embed URL
    if (url.includes('/embed/')) {
        return url;
    }

    let videoId = '';

    // Standard YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        videoId = urlParams.get('v');
    }
    // Short YouTube URL: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    // YouTube URL with /v/: https://www.youtube.com/v/VIDEO_ID
    else if (url.includes('youtube.com/v/')) {
        videoId = url.split('/v/')[1].split('?')[0];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

// Open video player modal
function openVideoPlayer(videoUrl, videoTitle) {
    const embedUrl = getYouTubeEmbedUrl(videoUrl);

    // Create modal HTML
    const modalHTML = `
        <div class="video-modal" id="videoModal">
            <div class="video-modal-backdrop" onclick="closeVideoPlayer()"></div>
            <div class="video-modal-content">
                <div class="video-modal-header">
                    <h3 class="video-modal-title">${videoTitle}</h3>
                    <button class="video-modal-close" onclick="closeVideoPlayer()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="video-modal-body">
                    <div class="video-container">
                        <iframe 
                            src="${embedUrl}" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Close video player modal
function closeVideoPlayer() {
    const modal = document.getElementById('videoModal');
    if (modal) {
        modal.remove();
    }

    // Restore body scroll
    document.body.style.overflow = '';
}

// Load announcements from admin portal
function loadAnnouncements() {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const announcements = portalData.announcements || [];

    if (announcements.length > 0) {
        // Show the most recent announcement
        const latest = announcements[announcements.length - 1];
        const announcementSection = document.getElementById('announcementsSection');
        const announcementTitle = document.getElementById('announcementTitle');
        const announcementMessage = document.getElementById('announcementMessage');

        if (announcementSection && announcementTitle && announcementMessage) {
            announcementTitle.textContent = latest.title;
            announcementMessage.textContent = latest.message;
            announcementSection.style.display = 'block';
        }
    }
}

// Load courses from admin portal
function loadCourses() {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const courses = portalData.courses || [];
    const coursesContent = document.getElementById('coursesContent');

    if (!coursesContent) return;

    if (courses.length === 0) {
        coursesContent.innerHTML = '<p class="categories-placeholder">No courses available yet. Check back later!</p>';
        return;
    }

    coursesContent.innerHTML = courses.map(course => `
        <div class="course-card">
            <h4>${course.name}</h4>
            <span class="course-category">${course.category}</span>
            <p>${course.description}</p>
        </div>
    `).join('');
}

// Load videos from admin portal
function loadVideos() {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const videos = portalData.videos || [];
    const videosContent = document.getElementById('videosContent');

    if (!videosContent) return;

    if (videos.length === 0) {
        videosContent.innerHTML = '<p class="certificate-placeholder">No videos uploaded yet.</p>';
        return;
    }

    videosContent.innerHTML = videos.map(video => `
        <div class="video-card">
            <div class="video-info">
                <h4>${video.title}</h4>
                <p class="video-course">${video.course}</p>
            </div>
            <button class="video-link" onclick="openVideoPlayer('${video.url.replace(/'/g, "\\'")}'', '${video.title.replace(/'/g, "\\'")}')">
                <i class="fas fa-play"></i> Watch
            </button>
        </div>
    `).join('');
}

// Load certificates for current user
function loadCertificates() {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const certificates = portalData.certificates || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const certificatesContent = document.getElementById('certificatesContent');

    if (!certificatesContent || !currentUser) return;

    // Filter certificates for current user
    const userCertificates = certificates.filter(cert =>
        cert.studentEmail.toLowerCase() === currentUser.email.toLowerCase()
    );

    if (userCertificates.length === 0) {
        certificatesContent.innerHTML = '<p class="categories-placeholder">No certificates earned yet. Complete courses to earn certificates!</p>';
        return;
    }

    certificatesContent.innerHTML = userCertificates.map(cert => `
        <div class="certificate-card">
            <h4>Certificate of Completion</h4>
            <p class="cert-course">${cert.courseName}</p>
            <p class="cert-date">Issued on: ${new Date(cert.issueDate).toLocaleDateString()}</p>
            <i class="fas fa-certificate"></i>
        </div>
    `).join('');
}

// Load all content on page load
document.addEventListener('DOMContentLoaded', function () {
    loadAnnouncements();
    loadCourses();
    loadVideos();
    loadCertificates();
});
