import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../Card';
import Button from '../Button';
import Input from '../Input';
import { Users, BookOpen, Plus, Calendar, Trash2, Edit2, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminBatches = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ batch_name: '', start_date: '', end_date: '' });

    const [editingBatch, setEditingBatch] = useState(null);

    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);

    const [assignStudentsModal, setAssignStudentsModal] = useState({ isOpen: false, batchId: null, batchName: '' });
    const [assignCoursesModal, setAssignCoursesModal] = useState({ isOpen: false, batchId: null, batchName: '' });
    
    const [viewStudentsModal, setViewStudentsModal] = useState({ isOpen: false, batchId: null, batchName: '' });
    const [viewCoursesModal, setViewCoursesModal] = useState({ isOpen: false, batchId: null, batchName: '' });
    
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);

    const [currentBatchStudents, setCurrentBatchStudents] = useState([]);
    const [currentBatchCourses, setCurrentBatchCourses] = useState([]);

    const [batchStats, setBatchStats] = useState({});

    useEffect(() => {
        fetchBatches();
        fetchStudentsAndCourses();
    }, []);

    useEffect(() => {
        if (batches.length > 0) {
            batches.forEach(batch => {
                fetchBatchStats(batch.id);
            });
        }
    }, [batches]);

    const fetchBatches = async () => {
        try {
            const res = await api.get('/batches');
            setBatches(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch batches", error);
            setLoading(false);
        }
    };

    const fetchStudentsAndCourses = async () => {
        try {
            const [studentsRes, coursesRes] = await Promise.all([
                api.get('/admin/students'),
                api.get('/courses')
            ]);
            setStudents(studentsRes.data);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error("Failed to fetch students/courses", error);
        }
    };

    const fetchBatchStats = async (batchId) => {
        try {
            const [studentsRes, coursesRes] = await Promise.all([
                api.get(`/batches/${batchId}/students`),
                api.get(`/batches/${batchId}/courses`)
            ]);
            setBatchStats(prev => ({
                ...prev,
                [batchId]: {
                    studentCount: studentsRes.data.length,
                    courseCount: coursesRes.data.length
                }
            }));
        } catch (error) {
            console.error(`Failed to fetch stats for batch ${batchId}`, error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBatch) {
                await api.put(`/batches/${editingBatch.id}`, formData);
                alert("Batch parameters updated.");
            } else {
                await api.post('/batches', formData);
                alert("New batch created.");
            }
            fetchBatches();
            setShowModal(false);
            setEditingBatch(null);
            setFormData({ batch_name: '', start_date: '', end_date: '' });
        } catch (error) {
            alert("Operation Failed");
        }
    };

    const handleEdit = (batch) => {
        setEditingBatch(batch);
        const start = batch.start_date ? new Date(batch.start_date).toISOString().split('T')[0] : '';
        const end = batch.end_date ? new Date(batch.end_date).toISOString().split('T')[0] : '';

        setFormData({
            batch_name: batch.batch_name,
            start_date: start,
            end_date: end
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this batch? All student assignments will be cleared.")) return;
        try {
            await api.delete(`/batches/${id}`);
            fetchBatches();
        } catch (error) {
            alert("Deletion Failed");
        }
    };

    const handleOpenAssignStudents = async (batch) => {
        setAssignStudentsModal({ isOpen: true, batchId: batch.id, batchName: batch.batch_name });
        try {
            const res = await api.get(`/batches/${batch.id}/students`);
            setCurrentBatchStudents(res.data);
            const assignedIds = res.data.map(s => s.id);
            setSelectedStudents(assignedIds);
        } catch (error) {
            setCurrentBatchStudents([]);
            setSelectedStudents([]);
        }
    };

    const handleAssignStudents = async () => {
        try {
            await api.post(`/batches/${assignStudentsModal.batchId}/students`, {
                student_ids: selectedStudents
            });
            alert("Students Assigned Successfully.");
            setAssignStudentsModal({ isOpen: false, batchId: null, batchName: '' });
            fetchBatchStats(assignStudentsModal.batchId);
        } catch (error) {
            alert("Assignment Failed");
        }
    };

    const handleOpenAssignCourses = async (batch) => {
        setAssignCoursesModal({ isOpen: true, batchId: batch.id, batchName: batch.batch_name });
        try {
            const res = await api.get(`/batches/${batch.id}/courses`);
            setCurrentBatchCourses(res.data);
            const assignedIds = res.data.map(c => c.id);
            setSelectedCourses(assignedIds);
        } catch (error) {
            setCurrentBatchCourses([]);
            setSelectedCourses([]);
        }
    };

    const handleAssignCourses = async () => {
        try {
            for (const courseId of selectedCourses) {
                try {
                    await api.post(`/batches/${assignCoursesModal.batchId}/courses`, {
                        course_id: courseId
                    });
                } catch (err) {}
            }
            alert("Courses Mapped Successfully.");
            setAssignCoursesModal({ isOpen: false, batchId: null, batchName: '' });
            fetchBatchStats(assignCoursesModal.batchId);
        } catch (error) {
            alert("Mapping Failed");
        }
    };

    const toggleStudentSelection = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const toggleCourseSelection = (courseId) => {
        setSelectedCourses(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fb923c', boxShadow: '0 0 10px #fb923c' }}></div>
                        <span style={{ color: '#fb923c', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Batch Management</span>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'white', letterSpacing: '-0.04em' }}>
                        Batch Hub
                    </h1>
                </div>
                <Button onClick={() => { setEditingBatch(null); setFormData({ batch_name: '', start_date: '', end_date: '' }); setShowModal(true); }}>
                    <Plus size={20} /> Create New Batch
                </Button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                    <AnimatePresence>
                        {batches.map((batch, i) => {
                            const stats = batchStats[batch.id] || { studentCount: 0, courseCount: 0 };
                            return (
                                <motion.div
                                    key={batch.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Card padding="2rem">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                            <div style={{ width: '50px', height: '50px', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb923c' }}>
                                                <Shield size={24} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleEdit(batch)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(batch.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#EF4444' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', marginBottom: '1rem' }}>{batch.batch_name}</h3>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                <Calendar size={14} /> <span>Start: {new Date(batch.start_date).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                <Calendar size={14} /> <span>End: {new Date(batch.end_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                            <motion.div 
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => setViewStudentsModal({ isOpen: true, batchId: batch.id, batchName: batch.batch_name })}
                                                style={{ padding: '1.25rem', background: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.1)', borderRadius: '1.25rem', textAlign: 'center', cursor: 'pointer' }}
                                            >
                                                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--primary)' }}>{stats.studentCount}</div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>Students</div>
                                            </motion.div>
                                            <motion.div 
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => setViewCoursesModal({ isOpen: true, batchId: batch.id, batchName: batch.batch_name })}
                                                style={{ padding: '1.25rem', background: 'rgba(251, 146, 60, 0.05)', border: '1px solid rgba(251, 146, 60, 0.1)', borderRadius: '1.25rem', textAlign: 'center', cursor: 'pointer' }}
                                            >
                                                <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fb923c' }}>{stats.courseCount}</div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>Courses</div>
                                            </motion.div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <Button variant="outline" size="small" style={{ flex: 1 }} onClick={() => handleOpenAssignStudents(batch)}>
                                                Assign Students
                                            </Button>
                                            <Button variant="outline" size="small" style={{ flex: 1 }} onClick={() => handleOpenAssignCourses(batch)}>
                                                Map Courses
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowModal(false); setEditingBatch(null); }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
                            <Card padding="3rem">
                                <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'white', marginBottom: '2rem' }}>{editingBatch ? 'Update Batch' : 'New Batch'}</h2>
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <Input label="Batch Name" value={formData.batch_name} onChange={e => setFormData({ ...formData, batch_name: e.target.value })} required />
                                    <Input type="date" label="Start Date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} required />
                                    <Input type="date" label="End Date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} required />
                                    <Button type="submit" size="large" style={{ marginTop: '1rem' }}>Save Batch</Button>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Students Modal */}
            {viewStudentsModal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(10px)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{ width: '100%', maxWidth: '700px', maxHeight: '80vh', position: 'relative' }}
                    >
                        <Card style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', padding: '0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #38BDF8, #818CF8)' }} />
                            
                            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#F8FAFC', letterSpacing: '-0.025em' }}>
                                        {viewStudentsModal.batchName} Students
                                    </h3>
                                    <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Active students assigned to this batch.</p>
                                </div>
                                <button
                                    onClick={() => { setViewStudentsModal({ isOpen: false, batchId: null, batchName: '' }); setCurrentBatchStudents([]); }}
                                    style={{ border: 'none', background: 'rgba(255,255,255,0.05)', height: '40px', width: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94A3B8' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '0 2rem 2rem 2rem' }}>
                                {currentBatchStudents.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '4rem', color: '#475569', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
                                        <Users size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                        <p style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', fontSize: '0.8rem' }}>No students found.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {currentBatchStudents.map((s, i) => (
                                            <motion.div 
                                                key={s.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                style={{ 
                                                    background: 'rgba(255,255,255,0.02)', 
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    padding: '1.25rem',
                                                    borderRadius: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                                    <div style={{ width: '45px', height: '45px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8' }}>
                                                        <Users size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 style={{ color: '#F8FAFC', fontWeight: '700', fontSize: '1rem' }}>{s.name}</h4>
                                                        <div style={{ color: '#64748B', fontSize: '0.8rem', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                                                            <span>{s.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* View Courses Modal */}
            {viewCoursesModal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(10px)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', position: 'relative' }}
                    >
                        <Card style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', padding: '0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #fb923c, #fb7185)' }} />
                            
                            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#F8FAFC', letterSpacing: '-0.025em' }}>
                                        {viewCoursesModal.batchName} Curriculum
                                    </h3>
                                    <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Courses assigned to this batch.</p>
                                </div>
                                <button
                                    onClick={() => { setViewCoursesModal({ isOpen: false, batchId: null, batchName: '' }); setCurrentBatchCourses([]); }}
                                    style={{ border: 'none', background: 'rgba(255,255,255,0.05)', height: '40px', width: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94A3B8' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '0 2rem 2rem 2rem' }}>
                                {currentBatchCourses.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '4rem', color: '#475569', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
                                        <BookOpen size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                        <p style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', fontSize: '0.8rem' }}>No courses mapped.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {currentBatchCourses.map((c, i) => (
                                            <motion.div 
                                                key={c.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                style={{ 
                                                    background: 'rgba(255,255,255,0.02)', 
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    padding: '1.25rem',
                                                    borderRadius: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1.25rem'
                                                }}
                                            >
                                                <div style={{ width: '45px', height: '45px', background: 'rgba(251, 146, 60, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb923c' }}>
                                                    <BookOpen size={20} />
                                                </div>
                                                <div>
                                                    <h4 style={{ color: '#F8FAFC', fontWeight: '700', fontSize: '1rem' }}>{c.title}</h4>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            )}

            {/* Assign Students Modal */}
            <AnimatePresence>
                {assignStudentsModal.isOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAssignStudentsModal({ isOpen: false, batchId: null, batchName: '' })} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                            <Card padding="2rem">
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', marginBottom: '1.5rem' }}>Assign Students to {assignStudentsModal.batchName}</h3>
                                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    {students.map(s => (
                                        <div 
                                            key={s.id} 
                                            onClick={() => toggleStudentSelection(s.id)}
                                            style={{ 
                                                padding: '1rem', 
                                                background: selectedStudents.includes(s.id) ? 'rgba(14, 165, 233, 0.1)' : 'rgba(255,255,255,0.05)', 
                                                border: selectedStudents.includes(s.id) ? '1px solid var(--primary)' : '1px solid transparent',
                                                borderRadius: '0.75rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <span style={{ color: 'white' }}>{s.name} ({s.email})</span>
                                            {selectedStudents.includes(s.id) && <Shield size={16} color="var(--primary)" />}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <Button onClick={handleAssignStudents} style={{ flex: 1 }}>Save Assignment</Button>
                                    <Button variant="outline" onClick={() => setAssignStudentsModal({ isOpen: false, batchId: null, batchName: '' })}>Cancel</Button>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Assign Courses Modal */}
            <AnimatePresence>
                {assignCoursesModal.isOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAssignCoursesModal({ isOpen: false, batchId: null, batchName: '' })} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                            <Card padding="2rem">
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', marginBottom: '1.5rem' }}>Map Courses to {assignCoursesModal.batchName}</h3>
                                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    {courses.map(c => (
                                        <div 
                                            key={c.id} 
                                            onClick={() => toggleCourseSelection(c.id)}
                                            style={{ 
                                                padding: '1rem', 
                                                background: selectedCourses.includes(c.id) ? 'rgba(251, 146, 60, 0.1)' : 'rgba(255,255,255,0.05)', 
                                                border: selectedCourses.includes(c.id) ? '1px solid #fb923c' : '1px solid transparent',
                                                borderRadius: '0.75rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <span style={{ color: 'white' }}>{c.title}</span>
                                            {selectedCourses.includes(c.id) && <Shield size={16} color="#fb923c" />}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <Button onClick={handleAssignCourses} style={{ flex: 1 }}>Save Mapping</Button>
                                    <Button variant="outline" onClick={() => setAssignCoursesModal({ isOpen: false, batchId: null, batchName: '' })}>Cancel</Button>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminBatches;
