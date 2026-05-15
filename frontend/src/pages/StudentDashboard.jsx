import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import api from '../services/api';
import Card from '../components/Card';
import { BookOpen, Award, CheckCircle, Clock, FileText, PlayCircle, ChevronRight, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Assignments from '../components/student/Assignments';
import MockTests from '../components/student/MockTests';
import Certificates from '../components/student/Certificates';
import StudentAttendance from '../components/student/StudentAttendance';
import StudentCourseView from '../components/student/StudentCourseView';

// Import generated image path (simulated as we know the filename)
const HERO_IMAGE = '/student_dashboard_hero_1775205866026.png'; // This will be resolved by Vite if in public or handled manually.
// Actually, since I'm in a browser environment, I should just use the path as is if I can or use a placeholder if it fails.
// For now, I'll use a local path that works in the dev server context or just a beautiful gradient if not found.


const StudentDashboard = () => {
    const { currentUser } = useAuth();
    const { data } = useData();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    // Live data for overview
    const [assignments, setAssignments] = useState([]);
    const [tests, setTests] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [testResults, setTestResults] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [overviewLoading, setOverviewLoading] = useState(true);

    const myCourses = data.courses || [];

    useEffect(() => {
        const fetchOverviewData = async () => {
            try {
                const [aRes, tRes, sRes, trRes, attRes] = await Promise.all([
                    api.get('/students/assignments'),
                    api.get('/students/tests'),
                    api.get('/students/submissions'),
                    api.get('/students/test-results'),
                    api.get('/attendance/my-attendance'),
                ]);
                setAssignments(aRes.data);
                setTests(tRes.data);
                setSubmissions(sRes.data);
                setTestResults(trRes.data);
                setAttendance(attRes.data);
            } catch (err) {
                console.error('Failed to fetch overview data', err);
            } finally {
                setOverviewLoading(false);
            }
        };
        fetchOverviewData();
    }, []);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <BookOpen size={18} /> },
        { id: 'attendance', label: 'Attendance', icon: <Calendar size={18} /> },
        { id: 'assignments', label: 'Assignments', icon: <FileText size={18} /> },
        { id: 'tests', label: 'Mock Tests', icon: <PlayCircle size={18} /> },
        { id: 'certificates', label: 'Certificates', icon: <Award size={18} /> },
    ];

    if (selectedCourseId) {
        return <StudentCourseView courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />;
    }

    // Compute pending assignments (not yet submitted)
    const pendingAssignments = assignments.filter(a => !submissions.find(s => s.assignment_id === a.id));
    // Compute available tests (not yet taken)
    const availableTests = tests.filter(t => 
        !testResults.find(r => r.test_id === t.id) && 
        t.questions && t.questions.length > 0
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'attendance': return <StudentAttendance />;
            case 'assignments': return <Assignments />;
            case 'tests': return <MockTests />;
            case 'certificates': return <Certificates />;
            default: return (
                <div style={{ padding: '0 1rem' }}>
                    {/* Minimalist Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        {[ 
                            { title: 'Enrolled Programs', count: myCourses.length, icon: BookOpen },
                            { title: 'Attendance Rate', count: attendance.length > 0 ? `${Math.round(((attendance.filter(a => a.status === 'Present').length + (attendance.filter(a => a.status === 'Late').length * 0.5)) / attendance.length) * 100)}%` : '0%', icon: Calendar },
                            { title: 'Active Assignments', count: pendingAssignments.length, icon: FileText },
                            { title: 'Pending Assessments', count: availableTests.length, icon: PlayCircle },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(14, 165, 233, 0.15)' }}
                                style={{
                                    background: 'var(--bg-surface)',
                                    borderRadius: '1rem',
                                    padding: '1.5rem',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
                                
                                <div>
                                    <h3 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                        {stat.title}
                                    </h3>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>
                                        {stat.count}
                                    </div>
                                </div>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <stat.icon size={24} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Action Panels */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        
                        {/* Pending Assignments */}
                        <motion.div 
                            style={{ background: 'var(--bg-surface)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={18} color="var(--primary)" /> Assignments
                                </h3>
                                <button onClick={() => setActiveTab('assignments')} style={{ color: 'var(--primary)', background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                                    View All <ChevronRight size={14} />
                                </button>
                            </div>

                            {pendingAssignments.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', opacity: 0.5 }}>
                                    <CheckCircle size={32} style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ fontSize: '0.9rem' }}>All assignments completed.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {pendingAssignments.slice(0, 3).map((a, i) => (
                                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-dark)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div>
                                                <h4 style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem' }}>{a.title}</h4>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{a.course_title}</div>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Clock size={12} /> {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'Immediate'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Available Tests */}
                        <motion.div 
                            style={{ background: 'var(--bg-surface)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <PlayCircle size={18} color="var(--primary)" /> Assessments
                                </h3>
                                <button onClick={() => setActiveTab('tests')} style={{ color: 'var(--primary)', background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                                    View All <ChevronRight size={14} />
                                </button>
                            </div>

                            {availableTests.length === 0 ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', opacity: 0.5 }}>
                                    <CheckCircle size={32} style={{ marginBottom: '0.5rem' }} />
                                    <p style={{ fontSize: '0.9rem' }}>No pending assessments.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {availableTests.slice(0, 3).map((t, i) => (
                                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-dark)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div>
                                                <h4 style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem' }}>{t.title}</h4>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t.type}</div>
                                            </div>
                                            <button style={{ background: 'var(--primary)', color: 'var(--bg-dark)', border: 'none', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                                                START
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Enrolled Courses Grid */}
                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BookOpen size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>Active Programs</h3>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {myCourses.map((course, idx) => (
                            <motion.div 
                                key={course.id} 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * idx }}
                                whileHover={{ y: -5, borderColor: 'var(--primary)', boxShadow: '0 10px 30px rgba(14, 165, 233, 0.1)' }}
                                onClick={() => setSelectedCourseId(course.id)}
                                style={{ 
                                    background: 'var(--bg-surface)',
                                    borderRadius: '1rem',
                                    border: '1px solid var(--border-color)',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{ height: '160px', position: 'relative', background: 'var(--bg-dark)' }}>
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                                    ) : (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.1 }}>
                                            <img src="/logo.png" alt="Cynex" style={{ height: '80px', filter: 'grayscale(100%)' }} onError={(e) => e.target.style.display='none'} />
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '0.25rem 0.75rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '700' }}>
                                        ACTIVE
                                    </div>
                                </div>
                                
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{course.title}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {course.description || 'Access course materials and interactive modules.'}
                                    </p>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Modules"><BookOpen size={14} /> {course.module_count || 0}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Assignments"><FileText size={14} /> {assignments.filter(a => a.course_id === course.id).length}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} title="Tests"><PlayCircle size={14} /> {tests.filter(t => t.course_id === course.id).length}</span>
                                        </div>
                                        <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: '600' }}>
                                            Enter <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {myCourses.length === 0 && (
                            <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '1rem', border: '1px dashed var(--border-color)' }}>
                                <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Active Programs</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You are not assigned to any courses currently.</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Hero Section */}
            <motion.div 
                whileHover={{ scale: 1.01 }}
                style={{
                    position: 'relative',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    marginBottom: '2rem',
                    background: 'linear-gradient(135deg, var(--bg-surface) 0%, #082F49 100%)',
                    border: '1px solid var(--primary)',
                    minHeight: '220px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2.5rem',
                    color: 'white',
                    boxShadow: '0 20px 40px rgba(14, 165, 233, 0.2)'
                }}
            >
                <div style={{ position: 'relative', zIndex: 2, maxWidth: '60%' }}>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
                    >
                        <Sparkles size={20} color="var(--primary)" />
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>Digital Learning Portal</span>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1' }}
                    >
                        Welcome back, <span style={{ color: 'var(--primary)' }}>{currentUser.name}</span>!
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '1.5rem' }}
                    >
                        Your learning journey continues. You have <strong>{pendingAssignments.length}</strong> pending tasks to complete today.
                    </motion.p>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCourseId(myCourses[0]?.id)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'var(--primary)',
                            color: 'var(--bg-dark)',
                            borderRadius: '0.75rem',
                            fontWeight: '700',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)'
                        }}
                    >
                        Learn Now <ArrowRight size={18} />
                    </motion.button>
                </div>
                
                {/* Hero Illustration */}
                <div style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10%',
                    height: '80%',
                    width: '35%',
                    zIndex: 1,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.8
                }}>
                    <img 
                        src={`/logo.png`}
                        alt="Cynex Logo"
                        onError={(e) => e.target.style.display = 'none'}
                        style={{
                            width: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 30px rgba(14,165,233,0.5))'
                        }}
                    />
                </div>
            </motion.div>

            {/* Navigation Tabs */}
            <div style={{
                display: 'flex', gap: '1rem', marginBottom: '2rem',
                overflowX: 'auto', paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--border-color)'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '0.5rem 0.5rem 0 0',
                            border: 'none',
                            backgroundColor: activeTab === tab.id ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: activeTab === tab.id ? '700' : '500',
                            cursor: 'pointer',
                            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {renderContent()}
            </motion.div>
        </motion.div>
    );
};

export default StudentDashboard;
