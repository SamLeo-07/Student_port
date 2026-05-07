// ========== BATCH MANAGEMENT FUNCTIONS ==========

// Load and display batches
function loadBatches() {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const batches = portalData.batches || [];
    const tbody = document.getElementById('batchesTableBody');

    if (!tbody) return;

    if (batches.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No batches created yet</td></tr>';
        return;
    }

    tbody.innerHTML = batches.map(batch => {
        const studentCount = portalData.students?.filter(s => s.batchId === batch.id).length || 0;
        const duration = batch.startDate && batch.endDate
            ? `${new Date(batch.startDate).toLocaleDateString()} - ${new Date(batch.endDate).toLocaleDateString()}`
            : 'Not set';

        return `
            <tr>
                <td><strong>${batch.id}</strong></td>
                <td>${batch.name}</td>
                <td>${batch.description || '-'}</td>
                <td>${duration}</td>
                <td>
                    ${batch.assignedCourses && batch.assignedCourses.length > 0
                ? `<span class="count-badge">${batch.assignedCourses.length} courses</span>`
                : '<span class="no-courses">No courses</span>'}
                </td>
                <td><span class="count-badge">${studentCount} students</span></td>
                <td><span class="status-badge status-${batch.status || 'active'}">${batch.status || 'active'}</span></td>
                <td>
                    <button class="btn-icon" onclick="editBatch('${batch.id}')" title="Edit Batch">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-icon-danger" onclick="deleteBatch('${batch.id}')" title="Delete Batch">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Open add batch modal
function openAddBatchModal() {
    document.getElementById('batchModalTitle').textContent = 'Add Batch';
    document.getElementById('batchId').value = '';
    document.getElementById('batchForm').reset();

    // Populate courses
    populateBatchCourses();

    document.getElementById('batchModal').style.display = 'flex';
}

// Edit batch - open modal
function editBatch(batchId) {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const batch = portalData.batches?.find(b => b.id === batchId);

    if (!batch) {
        alert('Batch not found!');
        return;
    }

    document.getElementById('batchModalTitle').textContent = 'Edit Batch';
    document.getElementById('batchId').value = batch.id;
    document.getElementById('batchName').value = batch.name;
    document.getElementById('batchDescription').value = batch.description || '';
    document.getElementById('batchStartDate').value = batch.startDate || '';
    document.getElementById('batchEndDate').value = batch.endDate || '';
    document.getElementById('batchStatus').value = batch.status || 'active';

    // Populate and select courses
    populateBatchCourses(batch.assignedCourses);

    document.getElementById('batchModal').style.display = 'flex';
}

// Populate batch courses dropdown
function populateBatchCourses(selectedCourses = []) {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const courses = portalData.courses || [];
    const coursesSelect = document.getElementById('batchCourses');

    if (!coursesSelect) return;

    coursesSelect.innerHTML = courses.map(course => `
        <option value="${course.name}" ${selectedCourses.includes(course.name) ? 'selected' : ''}>
            ${course.name}
        </option>
    `).join('');
}

// Close batch modal
function closeBatchModal() {
    document.getElementById('batchModal').style.display = 'none';
    document.getElementById('batchForm').reset();
}

// Handle batch form submission
document.addEventListener('DOMContentLoaded', function () {
    const batchForm = document.getElementById('batchForm');
    if (batchForm) {
        batchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            saveBatch();
        });
    }
});

// Save batch (create or update)
function saveBatch() {
    const batchId = document.getElementById('batchId').value;
    const name = document.getElementById('batchName').value.trim();
    const description = document.getElementById('batchDescription').value.trim();
    const startDate = document.getElementById('batchStartDate').value;
    const endDate = document.getElementById('batchEndDate').value;
    const status = document.getElementById('batchStatus').value;
    const coursesSelect = document.getElementById('batchCourses');
    const selectedCourses = Array.from(coursesSelect.selectedOptions).map(option => option.value);

    if (!name) {
        alert('Please enter a batch name');
        return;
    }

    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    if (!portalData.batches) portalData.batches = [];

    if (batchId) {
        // Update existing batch
        const batchIndex = portalData.batches.findIndex(b => b.id === batchId);
        if (batchIndex !== -1) {
            const oldCourses = portalData.batches[batchIndex].assignedCourses || [];

            portalData.batches[batchIndex] = {
                ...portalData.batches[batchIndex],
                name,
                description,
                startDate,
                endDate,
                assignedCourses: selectedCourses,
                status,
                updatedAt: new Date().toISOString()
            };

            // Update students in this batch with new courses
            updateStudentCoursesFromBatch(batchId, selectedCourses, oldCourses);
        }
    } else {
        // Create new batch
        const newBatch = {
            id: 'BATCH' + Date.now(),
            name,
            description,
            startDate,
            endDate,
            assignedCourses: selectedCourses,
            status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        portalData.batches.push(newBatch);
    }

    localStorage.setItem('portalData', JSON.stringify(portalData));

    closeBatchModal();
    loadBatches();
    showSuccessMessage(batchId ? 'Batch updated successfully!' : 'Batch created successfully!');
}

// Update student courses when batch courses change
function updateStudentCoursesFromBatch(batchId, newCourses, oldCourses) {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Find students in this batch
    const studentsInBatch = portalData.students?.filter(s => s.batchId === batchId) || [];

    studentsInBatch.forEach(student => {
        // Remove old batch courses
        let studentCourses = student.assignedCourses || [];
        studentCourses = studentCourses.filter(course => !oldCourses.includes(course));

        // Add new batch courses
        newCourses.forEach(course => {
            if (!studentCourses.includes(course)) {
                studentCourses.push(course);
            }
        });

        // Update in portalData
        const studentIndex = portalData.students.findIndex(s => s.id === student.id);
        if (studentIndex !== -1) {
            portalData.students[studentIndex].assignedCourses = studentCourses;
            portalData.students[studentIndex].updatedAt = new Date().toISOString();
        }

        // Update in users
        const userIndex = users.findIndex(u => u.id === student.id);
        if (userIndex !== -1) {
            users[userIndex].assignedCourses = studentCourses;
            users[userIndex].updatedAt = new Date().toISOString();
        }
    });

    localStorage.setItem('portalData', JSON.stringify(portalData));
    localStorage.setItem('users', JSON.stringify(users));
}

// Delete batch
function deleteBatch(batchId) {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const studentsInBatch = portalData.students?.filter(s => s.batchId === batchId).length || 0;

    let confirmMessage = 'Are you sure you want to delete this batch?';
    if (studentsInBatch > 0) {
        confirmMessage += `\n\nThis batch has ${studentsInBatch} student(s). They will be unassigned from this batch.`;
    }

    if (!confirm(confirmMessage)) return;

    // Remove batch
    portalData.batches = portalData.batches.filter(b => b.id !== batchId);

    // Unassign students from this batch
    if (portalData.students) {
        portalData.students.forEach(student => {
            if (student.batchId === batchId) {
                delete student.batchId;
                student.batch = '';
            }
        });
    }

    // Update users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.forEach(user => {
        if (user.batchId === batchId) {
            delete user.batchId;
            user.batch = '';
        }
    });

    localStorage.setItem('portalData', JSON.stringify(portalData));
    localStorage.setItem('users', JSON.stringify(users));

    loadBatches();
    loadStudents();
    showSuccessMessage('Batch deleted successfully!');
}

// Get batch courses for a student
function getBatchCourses(batchId) {
    const portalData = JSON.parse(localStorage.getItem('portalData') || '{}');
    const batch = portalData.batches?.find(b => b.id === batchId);
    return batch?.assignedCourses || [];
}
