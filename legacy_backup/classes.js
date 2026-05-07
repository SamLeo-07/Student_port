// Classes Page JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Load user data
    loadUserData();

    // Setup logout
    setupLogout();

    // Load videos
    loadVideos();

    // Setup course filter
    setupCourseFilter();
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
    }
}

// Setup logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('currentUser');
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


// Load videos from admin portal
function loadVideos(filterCourse = 'all') {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const videos = portalData.videos || [];
    const videosGrid = document.getElementById('videosGrid');
    const videoCount = document.getElementById('videoCount');

    // Filter videos by course if needed
    let filteredVideos = videos;
    if (filterCourse !== 'all') {
        filteredVideos = videos.filter(video => video.course === filterCourse);
    }

    // Update video count
    if (videoCount) {
        videoCount.textContent = filteredVideos.length;
    }

    // Display videos or empty state
    if (filteredVideos.length === 0) {
        videosGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-video"></i>
                <h3>No Videos Available</h3>
                <p>${filterCourse === 'all' ? 'Videos added by your instructors will appear here.' : 'No videos found for this course.'}</p>
            </div>
        `;
        return;
    }

    // Display video cards
    videosGrid.innerHTML = filteredVideos.map((video, index) => `
        <div class="video-card" data-course="${video.course}" data-video-index="${index}">
            <div class="video-thumbnail">
                <i class="fas fa-play-circle"></i>
                <div class="video-duration">
                    <i class="fas fa-clock"></i> Video
                </div>
            </div>
            <div class="video-details">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-course">
                    <i class="fas fa-book"></i> ${video.course}
                </p>
                ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                <div class="video-meta">
                    <span class="video-date">
                        <i class="fas fa-calendar"></i>
                        ${new Date(video.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
            <div class="video-actions">
                <button class="btn-watch" onclick="openVideoPlayer('${video.url.replace(/'/g, "\\'")}', '${video.title.replace(/'/g, "\\'")}')">
                    <i class="fas fa-play"></i> Watch Video
                </button>
            </div>
        </div>
    `).join('');

    // Add animation to cards
    const cards = document.querySelectorAll('.video-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
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


// Setup course filter
function setupCourseFilter() {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const courses = portalData.courses || [];
    const courseFilter = document.getElementById('courseFilter');

    console.log('Setting up course filter...');
    console.log('Found courses:', courses.length);

    if (!courseFilter) {
        console.error('Course filter element not found!');
        return;
    }

    // Populate filter dropdown with all available courses
    courseFilter.innerHTML = '<option value="all">All Courses</option>' +
        courses.map(course => `<option value="${course.name}">${course.name}</option>`).join('');

    console.log('Course filter populated with', courses.length, 'courses');

    // Add change event listener
    courseFilter.addEventListener('change', function () {
        loadVideos(this.value);
    });
}

// Notification bell animation
const notificationIcon = document.querySelector('.notification-icon');
if (notificationIcon) {
    setInterval(() => {
        notificationIcon.style.animation = 'none';
        setTimeout(() => {
            notificationIcon.style.animation = 'bellRing 0.5s ease';
        }, 10);
    }, 30000);
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
