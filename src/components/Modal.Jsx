import React from 'react';

export default function Modal({ modal, onClose }) {
  if (!modal) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div className="modal-header">
          <h3>{modal.title}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{modal.body}</div>
        {modal.footer && <div className="modal-footer">{modal.footer}</div>}
      </div>
    </div>
  );
}