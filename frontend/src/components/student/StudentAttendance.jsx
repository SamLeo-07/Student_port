import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, CheckCircle, XCircle, Clock, Search, Filter, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await api.get('/attendance/my-attendance');
                setAttendance(res.data);
            } catch (err) {
                console.error("Failed to fetch attendance", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Present': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', icon: <CheckCircle size={16} /> };
            case 'Absent': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', icon: <XCircle size={16} /> };
            case 'Late': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', icon: <Clock size={16} /> };
            default: return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6B7280', icon: <Clock size={16} /> };
        }
    };

    const filteredAttendance = attendance.filter(item => 
        filterStatus === 'All' || item.status === filterStatus
    );

    const stats = {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'Present').length,
        absent: attendance.filter(a => a.status === 'Absent').length,
        late: attendance.filter(a => a.status === 'Late').length,
        percentage: attendance.length > 0 
            ? Math.round(((attendance.filter(a => a.status === 'Present').length + (attendance.filter(a => a.status === 'Late').length * 0.5)) / attendance.length) * 100)
            : 0
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                <Clock size={40} className="animate-spin mb-4 text-sky-500" />
                <p>Loading your attendance history...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="cynex-card p-6 border-white/5 bg-white/[0.02]">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Attendance Rate</p>
                    <h3 className="text-3xl font-black text-white">{stats.percentage}%</h3>
                    <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.percentage}%` }}
                            className="h-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                        />
                    </div>
                </div>
                <div className="cynex-card p-6 border-white/5 bg-white/[0.02]">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Present</p>
                    <h3 className="text-3xl font-black text-emerald-500">{stats.present}</h3>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold">OUT OF {stats.total} SESSIONS</p>
                </div>
                <div className="cynex-card p-6 border-white/5 bg-white/[0.02]">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Late</p>
                    <h3 className="text-3xl font-black text-amber-500">{stats.late}</h3>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold text-wrap uppercase">Calculated as half present</p>
                </div>
                <div className="cynex-card p-6 border-white/5 bg-white/[0.02]">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Absent</p>
                    <h3 className="text-3xl font-black text-red-500">{stats.absent}</h3>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase">Missed opportunities</p>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="cynex-card border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.01]">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Calendar size={20} className="text-sky-500" />
                        Session History
                    </h3>
                    <div className="flex p-1 bg-black/40 border border-white/5 rounded-xl">
                        {['All', 'Present', 'Absent', 'Late'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === status ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-100 border-collapse">
                        <thead>
                            <tr className="text-left border-b border-white/5">
                                <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest">Class / Module</th>
                                <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest">Instructor</th>
                                <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest">Schedule</th>
                                <th className="p-6 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredAttendance.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-slate-500 font-medium">
                                        No attendance records found for this criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredAttendance.map((item, idx) => {
                                    const status = getStatusStyle(item.status);
                                    return (
                                        <motion.tr 
                                            key={item.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="p-6">
                                                <div className="font-bold text-white group-hover:text-sky-400 transition-colors">{item.title}</div>
                                                <div className="text-xs text-slate-500">{item.module_name || 'General Session'}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-sm text-slate-300">{item.instructor_name || 'N/A'}</div>
                                            </td>
                                            <td className="p-6">
                                                <div className="text-sm text-slate-300">
                                                    {new Date(item.schedule).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {new Date(item.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span 
                                                    className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit"
                                                    style={{ backgroundColor: status.bg, color: status.color }}
                                                >
                                                    {status.icon}
                                                    {item.status}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 bg-sky-500/5 rounded-2xl border border-sky-500/10">
                <Info className="text-sky-500 mt-0.5" size={18} />
                <div className="text-xs text-slate-400 leading-relaxed">
                    <p className="font-bold text-sky-400 mb-1 uppercase tracking-wider">Attendance Policy</p>
                    <p>Attendance is tracked automatically for live sessions and manually marked for offline classes. Maintain at least 75% attendance to remain eligible for certifications. If you believe there is an error in your records, please contact the administrator.</p>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendance;
