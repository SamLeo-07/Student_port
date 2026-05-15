import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import api from '../../services/api';
import { 
    Users, BookOpen, Calendar, CheckCircle, XCircle, Clock, 
    Search, Filter, FileSpreadsheet, RefreshCw, Trash2, Edit2, 
    ChevronRight, Save, X, Plus, ArrowLeft, MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GoogleSheetsAttendanceSync from './GoogleSheetsAttendanceSync';

const AdminAttendance = () => {
    const { data, fetchData: refetchGlobalData } = useData();
    const { courses = [] } = data;
    const [batches, setBatches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('mark'); // 'mark' or 'records'
    const [classes, setClasses] = useState([]);
    const [studentsForMarking, setStudentsForMarking] = useState([]);
    const [markingStatus, setMarkingStatus] = useState({}); // {studentId: status}
    const [savingId, setSavingId] = useState(null);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Filters for Records
    const [recordFilters, setRecordFilters] = useState({
        courseId: '',
        batchId: '',
        date: '',
        studentSearch: ''
    });

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchBatches(),
                    fetchClasses(),
                    refetchGlobalData()
                ]);
            } catch (err) {
                console.error("Initial load failed", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [refetchGlobalData]);


    useEffect(() => {
        if (activeTab === 'records') {
            fetchAttendanceSummary();
        }
    }, [activeTab, recordFilters, refreshKey]);

    // Automatically fetch session when course and date are selected
    useEffect(() => {
        if (selectedCourseId && selectedDate) {
            handleEnter();
        }
    }, [selectedCourseId, selectedDate]);

    const handleEnter = async () => {
        if (!selectedCourseId || !selectedDate) return;
        
        setLoading(true);
        try {
            const res = await api.post('/attendance/get-session', {
                course_id: selectedCourseId,
                date: selectedDate
            });
            const classId = res.data.class_id.toString();
            setSelectedClassId(classId);
            await fetchStudentsForMarking(classId);
        } catch (err) {
            console.error("Failed to get session", err);
            setSelectedClassId('');
        } finally {
            setLoading(false);
        }
    };

    const fetchBatches = async () => {
        try {
            const res = await api.get('/batches');
            setBatches(res.data);
        } catch (err) {
            console.error("Failed to fetch batches", err);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await api.get('/courses/classes/all'); 
            setClasses(res.data);
        } catch (err) {
            console.error("Failed to fetch classes", err);
        }
    };

    const fetchStudentsForMarking = async (classId) => {
        if (!classId) return;
        setLoading(true);
        try {
            const res = await api.get(`/attendance/class/${classId}`);
            setStudentsForMarking(res.data);
            // Initialize marking status
            const initialStatus = {};
            res.data.forEach(s => {
                initialStatus[s.id] = s.status === 'Pending' ? null : s.status;
            });
            setMarkingStatus(initialStatus);
        } catch (err) {
            console.error("Failed to fetch students for marking", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceSummary = async () => {
        setLoading(true);
        try {
            const params = {};
            if (recordFilters.batchId) params.batch_id = recordFilters.batchId;
            if (recordFilters.courseId) params.course_id = recordFilters.courseId;
            if (recordFilters.date) params.date = recordFilters.date;
            
            const res = await api.get('/attendance/summary', { params });
            setAttendanceData(res.data);
        } catch (err) {
            console.error("Failed to fetch attendance summary", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkStatus = async (studentId, status) => {
        if (!selectedClassId) {
            alert("Session not initialized. Please select course and date again.");
            return;
        }
        
        setSavingId(studentId);
        try {
            const payload = { 
                class_id: Number(selectedClassId), 
                student_id: Number(studentId), 
                status: status 
            };
            
            await api.post('/attendance/mark', payload);
            
            // Update local state immediately
            setMarkingStatus(prev => ({ 
                ...prev, 
                [studentId]: status 
            }));
            
            // Show a quick confirmation for manual marking
            // alert(`Marked ${status} successfully!`); 
        } catch (err) {
            console.error("Marking failed:", err);
            alert("Database Sync Failed: Please check your internet and try again.");
        } finally {
            setSavingId(null);
        }
    };

    const handleBulkMarkPresent = async () => {
        if (!selectedClassId) return;
        setLoading(true);
        try {
            const updates = studentsForMarking.map(s => ({ 
                student_id: parseInt(s.id), 
                status: 'Present' 
            }));
            await api.post('/attendance/mark-bulk', { 
                class_id: parseInt(selectedClassId), 
                updates 
            });
            const newStatus = {};
            updates.forEach(u => newStatus[u.student_id] = 'Present');
            setMarkingStatus(newStatus);
            alert("Successfully marked all students as Present.");
        } catch (err) {
            alert("Bulk marking failed. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRecord = async (recordId) => {
        if (!recordId) {
            alert("This record is pending and cannot be deleted.");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this attendance record?")) return;
        try {
            await api.delete(`/attendance/${recordId}`);
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            alert("Failed to delete record");
        }
    };

    const handleQuickUpdate = async (item, newStatus) => {
        setSavingId(`${item.class_id}-${item.student_id}`);
        try {
            await api.post('/attendance/mark', {
                class_id: item.class_id,
                student_id: item.student_id,
                status: newStatus
            });
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            alert("Failed to update status");
        } finally {
            setSavingId(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Present': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', icon: <CheckCircle size={14} /> };
            case 'Absent': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', icon: <XCircle size={14} /> };
            case 'Late': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', icon: <Clock size={14} /> };
            default: return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6B7280', icon: <Clock size={14} /> };
        }
    };

    const filteredRecords = attendanceData.filter(item => 
        item.student_name.toLowerCase().includes(recordFilters.studentSearch.toLowerCase()) ||
        item.class_title.toLowerCase().includes(recordFilters.studentSearch.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-white mb-1 tracking-tight">Attendance <span className="text-sky-400 font-light">Management</span></h1>
                    <p className="text-sm text-slate-400 font-light">Manage and monitor student engagement across all learning sessions.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowSyncModal(true)}
                        className="cynex-btn-outline group flex items-center gap-2"
                    >
                        <FileSpreadsheet size={18} className="group-hover:text-sky-500 transition-colors" />
                        <span>Sync Sheets</span>
                    </button>
                    <button 
                        onClick={() => {
                            setActiveTab('mark');
                            setSelectedClassId('');
                        }}
                        className="cynex-btn"
                    >
                        <Plus size={18} />
                        <span>Add New</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-white/[0.03] border border-white/10 rounded-xl w-fit">
                <button 
                    onClick={() => setActiveTab('mark')}
                    className={`px-5 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === 'mark' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <Edit2 size={16} />
                    Mark Attendance
                </button>
                <button 
                    onClick={() => setActiveTab('records')}
                    className={`px-5 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === 'records' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <BookOpen size={16} />
                    Attendance Records
                </button>
            </div>

            {activeTab === 'mark' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Selection Panel */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <Calendar className="text-sky-400" size={18} />
                                Select Session
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject / Course</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <select 
                                            className="cynex-input pl-10"
                                            value={selectedCourseId}
                                            onChange={(e) => {
                                                setSelectedCourseId(e.target.value);
                                                setSelectedClassId('');
                                            }}
                                            style={{ position: 'relative', zIndex: 50, cursor: 'pointer', appearance: 'auto' }}
                                        >
                                            <option value="">{courses.length === 0 ? 'Loading Courses...' : 'Select Course'}</option>
                                            {courses.map(c => (
                                                <option key={c.id} value={c.id} style={{ background: '#111', color: '#fff' }}>{c.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attendance Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input 
                                            type="date"
                                            className="cynex-input pl-10"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            style={{ position: 'relative', zIndex: 50, cursor: 'pointer' }}
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleEnter}
                                    disabled={loading || !selectedCourseId}
                                    className="cynex-btn w-full justify-center py-4 mt-2"
                                >
                                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <ChevronRight size={20} />}
                                    <span>ENTER SESSION</span>
                                </button>

                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex items-start gap-3 p-4 bg-sky-500/5 rounded-xl border border-sky-500/10">
                                        <Clock className="text-sky-500 mt-1" size={16} />
                                        <div>
                                            <p className="text-sm font-bold text-white">Pro Tip</p>
                                            <p className="text-xs text-slate-400">Select a course first to filter the available class sessions.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Marking Panel */}
                    <div className="lg:col-span-8">
                        {loading && !selectedClassId ? (
                            <div className="cynex-card h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10">
                                <RefreshCw size={48} className="text-sky-500 animate-spin mb-6" />
                                <h3 className="text-2xl font-bold text-white mb-2">Fetching Students</h3>
                                <p className="text-slate-500 max-w-sm">Please wait while we retrieve the enrollment list for this course.</p>
                            </div>
                        ) : !selectedClassId ? (
                            <div className="cynex-card h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                    <Users size={32} className="text-slate-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">No Session Selected</h3>
                                <p className="text-slate-500 max-w-sm">Choose a course and date from the left panel to start marking attendance.</p>
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden"
                            >
                                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white tracking-tight">Session <span className="text-sky-400 font-light">Roster</span></h3>
                                        <p className="text-xs text-slate-400 font-light mt-1">Recording presence for {courses.find(c => String(c.id) === String(selectedCourseId))?.title} on {selectedDate}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center bg-white/[0.03] px-4 py-1.5 rounded-lg border border-white/5 gap-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                                <span className="text-xs font-medium text-slate-300">
                                                    {Object.values(markingStatus).filter(s => s === 'Present').length} Present
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 border-l border-white/10 pl-5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                                <span className="text-xs font-medium text-slate-300">
                                                    {Object.values(markingStatus).filter(s => s === 'Absent').length} Absent
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleBulkMarkPresent}
                                            disabled={loading}
                                            className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                                        >
                                            Mark All Present
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-100 border-collapse">
                                        <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
                                            <tr className="text-left border-b border-white/5">
                                                <th className="p-4 px-6 text-xs font-medium text-slate-400">Student Profile</th>
                                                <th className="p-4 px-6 text-xs font-medium text-slate-400 text-center">Mark Status</th>
                                                <th className="p-4 px-6 text-xs font-medium text-slate-400 text-right">Observation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.02]">
                                            {studentsForMarking.map((student) => (
                                                <tr key={student.id} className="hover:bg-white/[0.01] transition-colors group">
                                                    <td className="p-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-sky-400 font-medium text-sm border border-white/5 transition-all duration-300">
                                                                {student.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-white text-sm">{student.name}</div>
                                                                <div className="text-xs text-slate-500 mt-0.5">
                                                                    {student.batch_name || 'Individual'} • ID: {student.id}-00{student.batch_id || 1}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 px-6">
                                                        <div className="flex justify-center items-center gap-2 bg-slate-800/30 p-1.5 rounded-lg w-fit mx-auto border border-white/5">
                                                            {['Present', 'Absent', 'Late'].map((status) => {
                                                                const isSelected = markingStatus[student.id] === status;
                                                                const config = getStatusStyle(status);
                                                                
                                                                const activeColors = {
                                                                    Present: 'bg-emerald-500 text-white border-emerald-400',
                                                                    Absent: 'bg-red-500 text-white border-red-400',
                                                                    Late: 'bg-amber-500 text-white border-amber-400'
                                                                };

                                                                const hoverColors = {
                                                                    Present: 'hover:bg-emerald-500/10 hover:text-emerald-400',
                                                                    Absent: 'hover:bg-red-500/10 hover:text-red-400',
                                                                    Late: 'hover:bg-amber-500/10 hover:text-amber-400'
                                                                };

                                                                return (
                                                                    <button
                                                                        key={status}
                                                                        onClick={() => handleMarkStatus(student.id, status)}
                                                                        className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-2 border ${
                                                                            isSelected 
                                                                            ? `${activeColors[status]} scale-105 shadow-sm` 
                                                                            : `text-slate-400 bg-transparent border-transparent ${hoverColors[status]}`
                                                                        } active:scale-95 cursor-pointer`}
                                                                    >
                                                                        {config.icon}
                                                                        {status}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 px-6 text-right whitespace-nowrap">
                                                        {savingId === student.id ? (
                                                            <div className="flex items-center justify-end gap-2 text-sky-400">
                                                                <RefreshCw size={14} className="animate-spin" />
                                                                <span className="text-xs font-medium">Saving...</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-end">
                                                                <span className={`text-xs font-semibold ${markingStatus[student.id] ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                                    {markingStatus[student.id] ? 'Confirmed' : 'Pending'}
                                                                </span>
                                                                {markingStatus[student.id] && (
                                                                    <span className="text-[10px] text-slate-500 mt-0.5">
                                                                        {new Date(selectedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-6 bg-white/[0.01] border-t border-white/5 flex justify-between items-center">
                                    <p className="text-xs text-slate-500 font-medium">
                                        Session ID: <span className="text-sky-400 font-semibold">#SESS-{selectedClassId}</span>
                                    </p>
                                    <button 
                                        onClick={() => {
                                            const present = Object.values(markingStatus).filter(s => s === 'Present').length;
                                            alert(`Session Finalized!\nTotal Marked: ${Object.keys(markingStatus).length}/${studentsForMarking.length}\nPresent: ${present}`);
                                            setActiveTab('records');
                                            setRefreshKey(prev => prev + 1);
                                        }}
                                        className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-300"
                                    >
                                        <Save size={16} />
                                        <span>Finalize Records</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Filters for Records */}
                    <div className="cynex-card p-6 border-white/5 bg-white/[0.02]">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search student or class..."
                                    className="cynex-input pl-10"
                                    value={recordFilters.studentSearch}
                                    onChange={(e) => setRecordFilters(prev => ({ ...prev, studentSearch: e.target.value }))}
                                />
                            </div>
                            <select 
                                className="cynex-input"
                                value={recordFilters.courseId}
                                onChange={(e) => {
                                    console.log("Course filter changed:", e.target.value);
                                    setRecordFilters(prev => ({ ...prev, courseId: e.target.value }));
                                }}
                                style={{ position: 'relative', zIndex: 50, appearance: 'auto', cursor: 'pointer' }}
                            >
                                <option value="">All Courses</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                            <select 
                                className="cynex-input"
                                value={recordFilters.batchId}
                                onChange={(e) => {
                                    console.log("Batch filter changed:", e.target.value);
                                    setRecordFilters(prev => ({ ...prev, batchId: e.target.value }));
                                }}
                                style={{ position: 'relative', zIndex: 50, appearance: 'auto', cursor: 'pointer' }}
                            >
                                <option value="">All Batches</option>
                                {batches.map(b => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
                            </select>
                            <input 
                                type="date"
                                className="cynex-input"
                                value={recordFilters.date}
                                onChange={(e) => setRecordFilters(prev => ({ ...prev, date: e.target.value }))}
                                style={{ position: 'relative', zIndex: 50, cursor: 'pointer' }}
                            />
                        </div>
                    </div>

                    {/* Records Table */}
                    <div className="cynex-card border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-100 border-collapse">
                                <thead>
                                    <tr className="text-left border-b border-white/5 bg-white/[0.02]">
                                        <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest">Student & Batch</th>
                                        <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest">Class Details</th>
                                        <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest">Date & Time</th>
                                        <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center">
                                                <RefreshCw size={32} className="animate-spin text-sky-500 mx-auto mb-4" />
                                                <p className="text-slate-500">Fetching records...</p>
                                            </td>
                                        </tr>
                                    ) : filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center text-slate-500">
                                                No attendance records found for the selected filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map((item) => {
                                            const status = getStatusStyle(item.status);
                                            return (
                                                <tr key={`${item.class_id}-${item.student_id}`} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="p-6">
                                                        <div className="font-bold text-white group-hover:text-sky-400 transition-colors">{item.student_name}</div>
                                                        <div className="text-xs text-slate-500">{item.batch_name}</div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="text-sm font-bold text-slate-200">{item.class_title}</div>
                                                        <div className="text-xs text-slate-500">{item.course_title}</div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="text-sm text-slate-300 font-medium">
                                                            {new Date(item.schedule).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {new Date(item.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="relative group/status">
                                                            <button 
                                                                onClick={() => {
                                                                    const nextStatus = item.status === 'Present' ? 'Absent' : (item.status === 'Absent' ? 'Late' : 'Present');
                                                                    handleQuickUpdate(item, nextStatus);
                                                                }}
                                                                disabled={savingId === `${item.class_id}-${item.student_id}`}
                                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit transition-all hover:scale-105 active:scale-95 ${savingId === `${item.class_id}-${item.student_id}` ? 'animate-pulse opacity-70' : ''}`}
                                                                style={{ backgroundColor: status.bg, color: status.color, border: `1px solid ${status.color}33` }}
                                                            >
                                                                {savingId === `${item.class_id}-${item.student_id}` ? <RefreshCw size={10} className="animate-spin" /> : status.icon}
                                                                {item.status}
                                                            </button>
                                                            <div className="absolute top-full left-0 mt-1 hidden group-hover/status:flex bg-slate-900 border border-white/10 rounded-lg p-1 shadow-xl z-20 gap-1">
                                                                {['Present', 'Absent', 'Late'].map(s => (
                                                                    <button 
                                                                        key={s}
                                                                        onClick={() => handleQuickUpdate(item, s)}
                                                                        className="px-2 py-1 hover:bg-white/5 rounded text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
                                                                    >
                                                                        {s}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => {
                                                                    console.log("Edit clicked for record:", item);
                                                                    if (!item.course_id || !item.class_id) {
                                                                        alert("Error: Missing course or class ID for this record.");
                                                                        return;
                                                                    }
                                                                    setSelectedCourseId(item.course_id.toString());
                                                                    const datePart = item.schedule ? new Date(item.schedule).toISOString().split('T')[0] : selectedDate;
                                                                    setSelectedDate(datePart);
                                                                    setSelectedClassId(item.class_id.toString());
                                                                    fetchStudentsForMarking(item.class_id.toString());
                                                                    setActiveTab('mark');
                                                                }}
                                                                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-sky-500 hover:text-white transition-all duration-300 relative z-10"
                                                                title="Edit Record"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteRecord(item.attendance_record_id);
                                                                }}
                                                                disabled={!item.attendance_record_id}
                                                                className={`p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-red-500 hover:text-white transition-all duration-300 relative z-10 ${!item.attendance_record_id ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                                title={item.attendance_record_id ? "Delete Record" : "Cannot delete pending record"}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showSyncModal && (
                    <GoogleSheetsAttendanceSync 
                        classes={classes}
                        onClose={() => setShowSyncModal(false)}
                        onSyncComplete={() => {
                            setRefreshKey(prev => prev + 1);
                            setShowSyncModal(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminAttendance;

