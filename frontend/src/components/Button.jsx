import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    className = '',
    isLoading = false,
    disabled = false,
    style: customStyle = {},
    ...props
}) => {
    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        fontWeight: '800',
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        letterSpacing: '0.02em',
        fontFamily: "'Outfit', sans-serif",
        gap: '0.6rem',
        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
    };

    const variants = {
        primary: {
            background: 'var(--primary)',
            color: 'white',
            boxShadow: '0 8px 20px -6px rgba(14, 165, 233, 0.4)'
        },
        secondary: {
            background: 'white',
            color: 'black',
            boxShadow: '0 8px 20px -6px rgba(255, 255, 255, 0.2)'
        },
        danger: {
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#EF4444',
            boxShadow: 'none'
        },
        outline: {
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'white',
            boxShadow: 'none'
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-muted)',
            boxShadow: 'none'
        },
        glass: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white'
        }
    };

    const sizes = {
        small: { padding: '0.6rem 1.25rem', fontSize: '0.75rem' },
        medium: { padding: '0.875rem 1.75rem', fontSize: '0.9rem' },
        large: { padding: '1.25rem 2.5rem', fontSize: '1.1rem' }
    };

    const currentVariant = variants[variant] || variants.primary;
    const currentSize = sizes[size] || sizes.medium;

    return (
        <motion.button
            whileHover={{ scale: disabled || isLoading ? 1 : 1.05, y: -2 }}
            whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
            style={{
                ...baseStyles,
                ...currentVariant,
                ...currentSize,
                ...customStyle,
                opacity: disabled || isLoading ? 0.6 : 1,
                cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
            }}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '1.2rem', height: '1.2rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                </div>
            ) : children}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </motion.button>
    );
};

export default Button;
