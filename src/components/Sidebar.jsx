import React from 'react';

export function ColoredAvatar({ name = '', role = 'student' }) {
  const c = role === 'admin' ? 'avatar-role-admin' : role === 'teacher' ? 'avatar-role-teacher' : 'avatar-role-student';
  const initials = name.split(' ').map((w) => w[0]).join('').substring(0, 2);
  return <div className={`avatar ${c}`}>{initials}</div>;
}

export default function Sidebar({ user, currentPage, onNavigate, onLogout, isOpen, onClose }) {
  const getNavItems = (role) => {
    if (role === 'student') return [
      { page: 'dashboard', label: 'Dashboard', icon: '🏠' },
      { page: 'tasks', label: 'Tugas Saya', icon: '📋' },
      { page: 'calendar', label: 'Kalender', icon: '📅' },
      { page: 'notifications', label: 'Notifikasi', icon: '🔔' }
    ];
    if (role === 'teacher') return [
      { page: 'teacher-dashboard', label: 'Dashboard', icon: '🏠' },
      { page: 'assignments', label: 'Tugas Diberikan', icon: '📝' },
      { page: 'submissions', label: 'Pengumpulan', icon: '📦' }
    ];
    return [
      { page: 'admin-dashboard', label: 'Dashboard', icon: '🏠' },
      { page: 'users', label: 'Manajemen Pengguna', icon: '👥' }
    ];
  };

  const navs = getNavItems(user.role);

  return (
    <>
      {isOpen && (
        <div
          style={{ display: 'block', position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 99 }}
          onClick={onClose}
        />
      )}
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h2>MYTUGAS</h2>
        </div>
        <div className="sidebar-nav">
          {navs.map((n) => (
            <div
              key={n.page}
              className={`nav-item ${currentPage === n.page ? 'active' : ''}`}
              onClick={() => onNavigate(n.page)}
            >
              {n.icon} {n.label}
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <ColoredAvatar name={user.name} role={user.role} />
            <div className="user-info">
              <span className="name">{user.name}</span>
              <span className="role">{user.role}</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={onLogout}>
            ← Keluar
          </button>
        </div>
      </nav>
    </>
  );
}