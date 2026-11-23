import React from 'react';

export default function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span style={{ fontSize: '18px' }}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span style={{ fontSize: '14px' }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}