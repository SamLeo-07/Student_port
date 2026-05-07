// ========== STUDENT MANAGEMENT FUNCTIONS ==========

// Load and display students
function loadStudents() {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const students = portalData.students || [];
    const tbody = document.getElementById('studentsTableBody');

    if (!tbody) return;

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No students registered yet</td></tr>';
        return;
    }

    tbody.innerHTML = students.map(student => `
        <tr>
            <td><strong>${student.id || 'N/A'}</strong></td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td><span class="batch-badge">${student.batch}</span></td>
            <td>
                ${student.assignedCourses && student.assignedCourses.length > 0
            ? student.assignedCourses.map(course => `<span class="course-badge">${course}</span>`).join(' ')
            : '<span class="no-courses">No courses assigned</span>'}
            </td>
            <td><span class="status-badge status-${student.status || 'active'}">${student.status || 'active'}</span></td>
            <td>
                <button class="btn-icon" onclick="editStudent('${student.id}')" title="Edit Student">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Populate filter dropdowns
    populateStudentFilters(students);
}

// Populate filter dropdowns
function populateStudentFilters(students) {
    // Populate batch filter
    const batchFilter = document.getElementById('batchFilter');
    if (batchFilter) {
        const batches = [...new Set(students.map(s => s.batch))].filter(Boolean);
        batchFilter.innerHTML = '<option value="all">All Batches</option>' +
            batches.map(batch => `<option value="${batch}">${batch}</option>`).join('');
    }

    // Populate course filter
    const courseFilter = document.getElementById('courseFilterStudents');
    if (courseFilter) {
        const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
        const courses = portalData.courses || [];
        courseFilter.innerHTML = '<option value="all">All Courses</option>' +
            courses.map(course => `<option value="${course.name}">${course.name}</option>`).join('');
    }
}

// Setup student search and filters
function setupStudentFilters() {
    const searchInput = document.getElementById('studentSearch');
    const batchFilter = document.getElementById('batchFilter');
    const courseFilter = document.getElementById('courseFilterStudents');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterStudents);
    }
    if (batchFilter) {
        batchFilter.addEventListener('change', filterStudents);
    }
    if (courseFilter) {
        courseFilter.addEventListener('change', filterStudents);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterStudents);
    }
}

// Filter students based on search and filters
function filterStudents() {
    const searchTerm = document.getElementById('studentSearch')?.value.toLowerCase() || '';
    const batchFilter = document.getElementById('batchFilter')?.value || 'all';
    const courseFilter = document.getElementById('courseFilterStudents')?.value || 'all';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';

    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    let students = portalData.students || [];

    // Apply filters
    students = students.filter(student => {
        const matchesSearch = !searchTerm ||
            student.name.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            (student.id && student.id.toLowerCase().includes(searchTerm));

        const matchesBatch = batchFilter === 'all' || student.batch === batchFilter;

        const matchesCourse = courseFilter === 'all' ||
            (student.assignedCourses && student.assignedCourses.includes(courseFilter));

        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

        return matchesSearch && matchesBatch && matchesCourse && matchesStatus;
    });

    // Update table
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No students found matching the criteria</td></tr>';
        return;
    }

    tbody.innerHTML = students.map(student => `
        <tr>
            <td><strong>${student.id || 'N/A'}</strong></td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td><span class="batch-badge">${student.batch}</span></td>
            <td>
                ${student.assignedCourses && student.assignedCourses.length > 0
            ? student.assignedCourses.map(course => `<span class="course-badge">${course}</span>`).join(' ')
            : '<span class="no-courses">No courses assigned</span>'}
            </td>
            <td><span class="status-badge status-${student.status || 'active'}">${student.status || 'active'}</span></td>
            <td>
                <button class="btn-icon" onclick="editStudent('${student.id}')" title="Edit Student">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Edit student - open modal
function editStudent(studentId) {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const student = portalData.students?.find(s => s.id === studentId);

    if (!student) {
        alert('Student not found!');
        return;
    }

    // Populate modal fields
    document.getElementById('editStudentId').value = student.id;
    document.getElementById('displayStudentId').value = student.id;
    document.getElementById('editStudentName').value = student.name;
    document.getElementById('editStudentEmail').value = student.email;
    document.getElementById('editStudentBatch').value = student.batch;
    document.getElementById('editStudentStatus').value = student.status || 'active';

    // Populate courses multi-select
    const coursesSelect = document.getElementById('editStudentCourses');
    const courses = portalData.courses || [];
    coursesSelect.innerHTML = courses.map(course => `
        <option value="${course.name}" ${student.assignedCourses?.includes(course.name) ? 'selected' : ''}>
            ${course.name}
        </option>
    `).join('');

    // Show modal
    document.getElementById('editStudentModal').style.display = 'flex';
}

// Close edit student modal
function closeEditStudentModal() {
    document.getElementById('editStudentModal').style.display = 'none';
    document.getElementById('editStudentForm').reset();
}

// Handle edit student form submission
document.addEventListener('DOMContentLoaded', function () {
    const editForm = document.getElementById('editStudentForm');
    if (editForm) {
        editForm.addEventListener('submit', function (e) {
            e.preventDefault();
            updateStudent();
        });
    }

    // Setup student filters
    setupStudentFilters();
});

// Update student data
function updateStudent() {
    const studentId = document.getElementById('editStudentId').value;
    const batch = document.getElementById('editStudentBatch').value.trim();
    const status = document.getElementById('editStudentStatus').value;
    const coursesSelect = document.getElementById('editStudentCourses');
    const selectedCourses = Array.from(coursesSelect.selectedOptions).map(option => option.value);

    if (!batch) {
        alert('Please enter a batch number');
        return;
    }

    // Update in portalData
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const studentIndex = portalData.students?.findIndex(s => s.id === studentId);

    if (studentIndex === -1) {
        alert('Student not found!');
        return;
    }

    portalData.students[studentIndex].batch = batch;
    portalData.students[studentIndex].assignedCourses = selectedCourses;
    portalData.students[studentIndex].status = status;
    portalData.students[studentIndex].updatedAt = new Date().toISOString();

    localStorage.setItem('portalData', JSON.stringify(portalData));

    // Update in users array (for authentication)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === studentId);

    if (userIndex !== -1) {
        users[userIndex].batch = batch;
        users[userIndex].assignedCourses = selectedCourses;
        users[userIndex].status = status;
        users[userIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Close modal and reload
    closeEditStudentModal();
    loadStudents();
    showSuccessMessage('Student updated successfully!');
}
