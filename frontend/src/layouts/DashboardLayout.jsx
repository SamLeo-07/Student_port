import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  LogOut, 
  Menu, 
  X, 
  Video,
  ClipboardList,
  Bell,
  Search,
  Settings,
  Shield,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { currentUser, isAdmin, isSuperAdmin, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const UPLOADS_URL = import.meta.env.PROD ? '/uploads/' : 'http://localhost:5002/uploads/';

  useEffect(() => {
    if (!loading && !currentUser) {
      console.log('[Auth] No active session detected. Redirecting to login...');
      navigate('/login', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  const handleLogout = () => {
    console.log('[Auth] Executing terminal session shutdown...');
    try {
        logout();
        console.log('[Auth] Local credentials purged. Redirecting...');
        navigate('/login', { replace: true });
    } catch (error) {
        console.error('[Auth] Shutdown sequence failure:', error);
        window.location.href = '/login';
    }
  };

  if (loading) return null;
  if (!currentUser) return null;

  const allAdminItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin', roles: ['admin', 'super_admin'] },
    { icon: <Users size={20} />, label: 'Students', path: '/admin/students', roles: ['admin', 'super_admin'] },
    { icon: <Calendar size={20} />, label: 'Batches', path: '/admin/batches', roles: ['admin', 'super_admin'] },
    { icon: <BookOpen size={20} />, label: 'Courses', path: '/admin/courses', roles: ['admin', 'super_admin'] },
    { icon: <Layers size={20} />, label: 'Modules', path: '/admin/modules', roles: ['admin', 'super_admin'] },
    { icon: <Video size={20} />, label: 'Videos', path: '/admin/videos', roles: ['admin', 'super_admin'] },
    { icon: <ClipboardList size={20} />, label: 'Attendance', path: '/admin/attendance', roles: ['admin', 'super_admin'] },
  ];

  const studentItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/student' },
    { icon: <BookOpen size={20} />, label: 'Courses', path: '/student/courses' },
    { icon: <Video size={20} />, label: 'Videos', path: '/student/classes' },
    { icon: <ClipboardList size={20} />, label: 'Attendance', path: '/student/attendance' },
    { icon: <Users size={20} />, label: 'Profile', path: '/student/profile' },
  ];

  const menuItems = isAdmin ? allAdminItems.filter(item => {
    if (isSuperAdmin) return true;
    return item.roles.includes('admin');
  }) : studentItems;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-dark)', fontFamily: "'Outfit', sans-serif" }}>
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? '280px' : '80px' }}
        style={{
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(30px)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh',
          zIndex: 50,
          boxShadow: '10px 0 30px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <img src="/logo.png" alt="Cynex AI" style={{ width: '32px', height: '32px', filter: 'drop-shadow(0 0 8px var(--primary))' }} />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ fontWeight: '900', fontSize: '1.25rem', color: 'white', letterSpacing: '-0.02em' }}
              >
                CYNEX <span style={{ color: 'var(--primary)' }}>AI</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 0.75rem', overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && item.path !== '/student' && location.pathname.startsWith(item.path));
            return (
              <motion.button
                key={item.path}
                whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  gap: '1.25rem',
                  width: '100%',
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  borderRadius: '1rem',
                  border: '1px solid transparent',
                  borderColor: isActive ? 'var(--primary)' : 'transparent',
                  backgroundColor: isActive ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? '700' : '600',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-highlight"
                    style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '4px', backgroundColor: 'var(--primary)', borderRadius: '0 4px 4px 0' }} 
                  />
                )}
                <div style={{ color: isActive ? 'var(--primary)' : 'inherit' }}>{item.icon}</div>
                {sidebarOpen && <span>{item.label}</span>}
              </motion.button>
            );
          })}
        </nav>

        <div 
          style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}
        >
          <div
            id="terminate-session-btn"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('[Auth] Terminate sequence initiated');
              setShowLogoutConfirm(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setShowLogoutConfirm(true);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '1.25rem',
              width: '100%',
              padding: '1rem',
              borderRadius: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
              position: 'relative',
              zIndex: 100,
              border: '1px solid rgba(239, 68, 68, 0.2)',
              userSelect: 'none'
            }}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Terminate</span>}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? '280px' : '80px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: 'var(--bg-dark)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <header style={{
          height: '80px',
          backgroundColor: 'rgba(10, 10, 10, 0.6)',
          backdropFilter: 'blur(20px)',
          padding: '0 3rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', cursor: 'pointer', color: 'white', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </motion.button>

            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                style={{ padding: '0.75rem 1rem 0.75rem 3rem', width: '350px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '1rem', color: 'white', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Bell size={20} /></button>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Settings size={20} /></button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '2rem', borderLeft: '1px solid var(--border-color)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'white' }}>{currentUser?.name || (isAdmin ? 'Administrator' : 'Student')}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{isAdmin ? 'Administrator' : 'Student'}</div>
              </div>
              <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: '900', fontSize: '1.25rem', boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)' }}>
                {currentUser?.name?.charAt(0) || 'C'}
              </div>
            </div>
          </div>
        </header>

        <div style={{ padding: '3rem', flex: 1, maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, cubicBezier: [0.4, 0, 0.2, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Premium Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '1.5rem',
                padding: '3rem',
                maxWidth: '450px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)'
              }}
            >
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', margin: '0 auto 2rem'
              }}>
                <Shield size={40} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'white', marginBottom: '1rem', letterSpacing: '-0.02em' }}>TERMINATE SESSION?</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                You are about to disconnect from the Cynex AI Secure Node. All active transmission channels will be closed.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    flex: 1, padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)',
                    backgroundColor: 'transparent', color: 'white', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  ABORT
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    flex: 1, padding: '1rem', borderRadius: '0.75rem', border: 'none',
                    backgroundColor: '#EF4444', color: 'white', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  TERMINATE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
