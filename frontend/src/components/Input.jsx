import React from 'react';

const Input = ({ label, type = 'text', textarea = false, ...props }) => {
    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1.25rem',
        borderRadius: '1rem',
        border: '1px solid var(--border-color)',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        color: 'var(--text-main)',
        fontSize: '0.9rem',
        outline: 'none',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
        ...props.style
    };

    return (
        <div style={{ marginBottom: '1.25rem' }}>
            {label && (
                <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontSize: '0.75rem', 
                    fontWeight: '800', 
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {label}
                </label>
            )}
            {textarea ? (
                <textarea
                    style={{
                        ...inputStyle,
                        minHeight: '120px',
                        resize: 'vertical'
                    }}
                    {...props}
                />
            ) : (
                <input
                    type={type}
                    style={inputStyle}
                    {...props}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--primary)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.target.style.boxShadow = '0 0 0 4px rgba(14, 165, 233, 0.1)';
                        if (props.onFocus) props.onFocus(e);
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-color)';
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                        e.target.style.boxShadow = 'none';
                        if (props.onBlur) props.onBlur(e);
                    }}
                />
            )}
        </div>
    );
};

export default Input;
