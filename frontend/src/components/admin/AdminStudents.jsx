import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../Card';
import Button from '../Button';
import Input from '../Input';
import { Users, BookOpen, Plus, X, Search, Filter, Edit2, Trash2, Clock, Mail, Phone, Calendar, MapPin, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrollments, setEnrollments] = useState([]);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '',
        dob: '', address: '', gender: 'Male',
        guardian_name: '', guardian_contact: '',
        previous_qualification: '', batch_id: '', course_id: ''
    });

    const [editingStudent, setEditingStudent] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [studentsRes, coursesRes, batchesRes] = await Promise.all([
                api.get('/admin/students'),
                api.get('/courses'),
                api.get('/batches')
            ]);
            setStudents(studentsRes.data);
            setCourses(coursesRes.data);
            setBatches(batchesRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch data", error);
            setLoading(false);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            if (editingStudent) {
                await api.put(`/admin/students/${editingStudent.id}`, formData);
                alert("Operative Profile Updated.");
            } else {
                await api.post('/admin/students', formData);
                alert("New Operative Registered.");
            }
            setShowAddModal(false);
            setEditingStudent(null);
            fetchData();
            setFormData({
                name: '', email: '', password: '', phone: '',
                dob: '', address: '', gender: 'Male',
                guardian_name: '', guardian_contact: '',
                previous_qualification: '', batch_id: '', course_id: ''
            });
        } catch (error) {
            alert(error.response?.data?.message || "Operation Failed");
        }
    };

    const handleEdit = async (student) => {
        try {
            let formattedDob = '';
            if (student.dob) {
                const date = new Date(student.dob);
                if (!isNaN(date.getTime())) {
                    formattedDob = date.toISOString().split('T')[0];
                }
            }

            // Fetch current enrollments
            const enrollRes = await api.get(`/admin/students/${student.id}/enrollments`);
            setEnrollments(enrollRes.data);

            setEditingStudent(student);
            setFormData({
                name: student.name,
                email: student.email,
                password: student.raw_token || '',
                phone: student.phone || '',
                dob: formattedDob,
                address: student.address || '',
                gender: student.gender || 'Male',
                guardian_name: student.guardian_name || '',
                guardian_contact: student.guardian_contact || '',
                previous_qualification: student.previous_qualification || '',
                batch_id: student.batch_id ? String(student.batch_id) : '',
                course_id: student.course_id ? String(student.course_id) : ''
            });
            setShowAddModal(true);
        } catch (error) {
            alert("Error loading operative intelligence");
        }
    };

    const handleDelete = async (studentId) => {
        if (!window.confirm("Terminate this operative's access?")) return;
        try {
            await api.delete(`/admin/students/${studentId}`);
            fetchData();
        } catch (error) {
            alert("Termination Failed");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
                        <span style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Human Resources Terminal</span>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'white', letterSpacing: '-0.04em' }}>
                        Operative Directory
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Filter by name or email..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ 
                                padding: '0.875rem 1rem 0.875rem 3rem', 
                                width: '350px', 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid var(--border-color)', 
                                borderRadius: '1rem', 
                                color: 'white',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }} 
                        />
                    </div>
                    <Button onClick={() => { setEditingStudent(null); setFormData({ name: '', email: '', password: '', phone: '', dob: '', address: '', gender: 'Male', guardian_name: '', guardian_contact: '', previous_qualification: '', batch_id: '', course_id: '' }); setShowAddModal(true); }}>
                        <Plus size={20} /> Deploy New Operative
                    </Button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
                    <div className="loading-spinner"></div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                    <AnimatePresence>
                        {filteredStudents.map((student, i) => (
                            <motion.div
                                key={student.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card padding="0" style={{ height: '100%' }}>
                                    <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-color)', background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.05) 0%, transparent 100%)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                            <div style={{ width: '60px', height: '60px', borderRadius: '1.25rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '900' }}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleEdit(student)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(student.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#EF4444' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'white', marginBottom: '0.25rem' }}>{student.name}</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Mail size={14} /> {student.email}
                                        </p>
                                    </div>

                                    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '800', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Squadron</span>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>
                                                    {batches.find(b => String(b.id) === String(student.batch_id))?.batch_name || 'UNASSIGNED'}
                                                </span>
                                            </div>
                                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '800', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Discipline</span>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                                    {courses.find(c => String(c.id) === String(student.course_id))?.title || 'GENERAL'}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                            {student.phone && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.75rem', borderRadius: '99px' }}>
                                                    <Phone size={12} /> {student.phone}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--primary)', background: 'rgba(14, 165, 233, 0.05)', padding: '0.4rem 0.75rem', borderRadius: '99px', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                                                <Award size={12} /> TOKEN: {student.raw_token || 'SECURED'}
                                            </div>
                                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.75rem', borderRadius: '99px' }}>
                                                 <Clock size={12} /> {new Date(student.created_at).toLocaleDateString()}
                                             </div>
                                        </div>
                                    </div>
                                    <div className="scanline-effect" style={{ opacity: 0.3 }}></div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {showAddModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} style={{ position: 'relative', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <Card padding="3rem" style={{ border: '1px solid var(--primary-dark)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>
                                            {editingStudent ? 'Recalibrate Operative' : 'Deploy New Operative'}
                                        </h2>
                                        <p style={{ color: 'var(--text-muted)' }}>Configure clearance levels and personnel details.</p>
                                    </div>
                                    <button onClick={() => setShowAddModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleAddStudent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'black', fontWeight: '900', fontSize: '0.7rem', borderRadius: '0.5rem' }}>IDENTITY</div>
                                            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                                        </div>
                                    </div>
                                    
                                    <Input label="Full Designation" name="name" value={formData.name} onChange={handleChange} required />
                                    <Input label="Clearance Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
                                    <Input label="Security Token" type="text" name="password" value={formData.password} onChange={handleChange} required placeholder="Set access key" />
                                    <Input label="Comm Link (Phone)" name="phone" value={formData.phone} onChange={handleChange} />

                                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: '900', fontSize: '0.7rem', borderRadius: '0.5rem' }}>DEPLOYMENT</div>
                                            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>Assigned Discipline</label>
                                        <select name="course_id" value={formData.course_id} onChange={handleChange} className="cynex-input">
                                            <option value="" style={{ background: '#0A0A0A', color: '#fff' }}>-- Select Course --</option>
                                            {courses.map(c => <option key={c.id} value={c.id} style={{ background: '#0A0A0A', color: '#fff' }}>{c.title}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>Squadron Assignment</label>
                                        <select name="batch_id" value={formData.batch_id} onChange={handleChange} className="cynex-input">
                                            <option value="" style={{ background: '#0A0A0A', color: '#fff' }}>-- Select Batch --</option>
                                            {batches.map(b => <option key={b.id} value={b.id} style={{ background: '#0A0A0A', color: '#fff' }}>{b.batch_name}</option>)}
                                        </select>
                                    </div>

                                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: '900', fontSize: '0.7rem', borderRadius: '0.5rem' }}>BIOMETRICS</div>
                                            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                                        </div>
                                    </div>

                                    <Input label="Activation Date (DOB)" type="date" name="dob" value={formData.dob} onChange={handleChange} />
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>Classification</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className="cynex-input">
                                            <option value="Male" style={{ background: '#0A0A0A', color: '#fff' }}>Male</option>
                                            <option value="Female" style={{ background: '#0A0A0A', color: '#fff' }}>Female</option>
                                            <option value="Other" style={{ background: '#0A0A0A', color: '#fff' }}>Other</option>
                                        </select>
                                    </div>

                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <Input label="Base Location" textarea name="address" value={formData.address} onChange={handleChange} />
                                    </div>

                                    <div style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
                                        <Button type="submit" size="large" style={{ width: '100%' }}>
                                            {editingStudent ? 'Execute Recalibration' : 'Execute Deployment'}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            <style>{`
                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 3px solid var(--border-color);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AdminStudents;
