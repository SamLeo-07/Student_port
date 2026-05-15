import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Icosahedron, MeshDistortMaterial, Float } from '@react-three/drei';

// Interactive 3D Model
const AnimatedGeometry = () => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Icosahedron ref={meshRef} args={[2.5, 4]} scale={1}>
        <MeshDistortMaterial 
          color="#0EA5E9" 
          emissive="#FFFFFF" 
          emissiveIntensity={0.1}
          roughness={0.2}
          metalness={0.8}
          distort={0.3} 
          speed={2} 
        />
      </Icosahedron>
    </Float>
  );
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showIntro, setShowIntro] = useState(true);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Intro animation timer
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            if (result.success) {
                const user = JSON.parse(localStorage.getItem('user'));
                navigate(user.role === 'admin' ? '/admin' : '/student');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            minHeight: '100vh', 
            width: '100vw',
            backgroundColor: 'var(--bg-dark)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <div className="noise-overlay"></div>

            <AnimatePresence>
                {showIntro && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'var(--bg-dark)',
                            zIndex: 50,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ textAlign: 'center' }}
                        >
                            {/* Logo Placeholder for Intro */}
                            <img src="/logo.png" alt="Cynex AI" style={{ height: '80px', marginBottom: '2rem', objectFit: 'contain' }} onError={(e) => { e.target.style.display='none' }} />
                            <motion.h1 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                style={{ fontSize: '3rem', fontWeight: '800', fontFamily: 'Syne', color: 'var(--text-main)', letterSpacing: '0.1em' }}
                            >
                                CYNEX<span style={{ color: 'var(--primary)' }}> AI</span>
                            </motion.h1>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ delay: 1, duration: 1 }}
                                style={{ height: '2px', background: 'var(--primary)', marginTop: '1rem', margin: '0 auto', maxWidth: '200px' }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Left Side: Form */}
            <motion.div 
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: showIntro ? 0 : 1, x: showIntro ? -100 : 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                style={{ 
                    flex: '0 0 500px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '4rem',
                    backgroundColor: 'var(--bg-surface)',
                    borderRight: '1px solid var(--border-color)',
                    zIndex: 10,
                    position: 'relative',
                    boxShadow: '10px 0 30px rgba(0,0,0,0.5)'
                }}
            >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--primary)' }}></div>

                <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                        <img src="/logo.png" alt="Cynex AI" style={{ height: '40px', objectFit: 'contain' }} onError={(e) => { e.target.style.display='none' }} />
                        <span style={{ fontWeight: '800', fontFamily: 'Syne', fontSize: '1.5rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>CYNEX AI</span>
                    </div>

                    <h2 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: '1' }}>PORTAL<br/>ACCESS.</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>Enter clearance credentials to proceed to the main terminal.</p>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                backgroundColor: 'transparent',
                                color: 'var(--text-main)',
                                padding: '1rem',
                                borderLeft: '4px solid #EF4444',
                                marginBottom: '2rem',
                                fontSize: '0.875rem',
                                fontFamily: 'Syne',
                                fontWeight: '700',
                                textTransform: 'uppercase'
                            }}
                        >
                            SYS_ERROR: {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ position: 'relative' }}>
                            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '800', letterSpacing: '0.1em' }}>Identity Hash</label>
                            <input
                                className="industrial-input"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter Email"
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '800', letterSpacing: '0.1em' }}>Security Key</label>
                            <input
                                className="industrial-input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter Password"
                            />
                        </div>


                        <button 
                            type="submit" 
                            disabled={loading}
                            className="industrial-btn"
                            style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            {loading ? 'Authenticating...' : 'Authenticate'}
                            <ArrowRight size={20} />
                        </button>
                    </form>

                    <div style={{ marginTop: '3rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        NO CLEARANCE?{' '}
                        <span style={{ color: 'var(--primary)', fontWeight: '700', marginLeft: '0.5rem' }}>
                            STUDENTS MUST BE ADDED BY AN ADMINISTRATOR
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Right Side: 3D Experience */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: showIntro ? 0 : 1 }}
                transition={{ duration: 1.5, delay: 0.8 }}
                style={{ 
                    flex: '1', 
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle at center, #111 0%, var(--bg-dark) 100%)'
                }}
            >
                {/* React Three Fiber Canvas */}
                <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                    <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#0EA5E9" />
                        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#FFFFFF" />
                        <AnimatedGeometry />
                        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
                    </Canvas>
                </div>
                
                <div style={{ position: 'absolute', bottom: '4rem', right: '4rem', zIndex: 10, color: 'var(--text-muted)', fontFamily: 'Syne', fontSize: '0.8rem', letterSpacing: '0.2em' }}>
                    CYNEX AI / INTERACTIVE / SECURE
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
