import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
    children, 
    className = '', 
    glass = true, 
    hover = true,
    padding = '1.75rem',
    ...props 
}) => {
    return (
        <motion.div
            whileHover={hover ? { 
                y: -6, 
                borderColor: 'var(--primary)',
                boxShadow: '0 20px 40px -15px rgba(14, 165, 233, 0.25)',
                transition: { type: 'spring', stiffness: 400, damping: 25 }
            } : {}}
            style={{
                backgroundColor: glass ? 'rgba(10, 10, 10, 0.7)' : 'var(--bg-surface)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '1.75rem',
                border: '1px solid var(--border-color)',
                padding: padding,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                ...props.style
            }}
            className={className}
            {...props}
        >
            {/* Glossy light effect */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                zIndex: 2
            }} />

            {/* Corner Accent */}
            <div style={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: '40px',
                height: '40px',
                background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)',
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1, height: '100%', width: '100%' }}>
                {children}
            </div>
        </motion.div>
    );
};

export default Card;
