import React, { useEffect, useState } from 'react';

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);
    
    // Auto remove after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300); // Wait for animation
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getToastClass = () => {
    const baseClass = 'toast';
    const typeClass = `toast--${toast.type}`;
    const visibilityClass = isVisible ? 'toast--visible' : '';
    return `${baseClass} ${typeClass} ${visibilityClass}`.trim();
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={getToastClass()}>
      <div className="toast__icon">{getIcon()}</div>
      <div className="toast__message">{toast.message}</div>
      <button 
        className="toast__close"
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
