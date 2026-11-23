import React, { useState } from 'react';
import { DB } from '../data/mockDb';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = DB.get(DB.USERS) || [];
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      setError('Email atau password salah.');
      return;
    }
    onLoginSuccess(user);
  };

  const handleQuickLogin = (uid) => {
    const users = DB.get(DB.USERS) || [];
    const user = users.find((u) => u.id === uid);
    if (user) onLoginSuccess(user);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>MYTUGAS</h1>
          <p>Kelola semua tugas sekolah dalam satu tempat.</p>
        </div>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@mytugas.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" required />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}>
            Masuk
          </button>
        </form>
        <div className="login-divider">atau masuk cepat</div>
        <div className="quick-grid">
          <button className="quick-btn" onClick={() => handleQuickLogin('u3')}>
            <div className="avatar-sm avatar-role-student">AP</div>
            <div className="info"><span className="name">Andi Pratama</span><span className="role">Siswa</span></div>
          </button>
          <button className="quick-btn" onClick={() => handleQuickLogin('u4')}>
            <div className="avatar-sm avatar-role-student">SR</div>
            <div className="info"><span className="name">Siti Rahayu</span><span className="role">Siswa</span></div>
          </button>
          <button className="quick-btn" onClick={() => handleQuickLogin('u2')}>
            <div className="avatar-sm avatar-role-teacher">PB</div>
            <div className="info"><span className="name">Pak Budi</span><span className="role">Guru</span></div>
          </button>
          <button className="quick-btn" onClick={() => handleQuickLogin('u1')}>
            <div className="avatar-sm avatar-role-admin">AS</div>
            <div className="info"><span className="name">Admin Sekolah</span><span className="role">Admin</span></div>
          </button>
        </div>
      </div>
    </div>
  );
}