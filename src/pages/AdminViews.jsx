import React from 'react';
import { DB, timeAgo } from '../data/mockDb';
import { ColoredAvatar } from '../components/Sidebar';

export default function AdminViews({ currentPage, setModal, addToast, refreshApp }) {
  const users = DB.get(DB.USERS) || [];
  const tasks = DB.get(DB.TASKS) || [];
  const notifs = DB.get(DB.NOTIFS) || [];

  if (currentPage === 'admin-dashboard') {
    const students = users.filter((u) => u.role === 'student').length;
    const teachers = users.filter((u) => u.role === 'teacher').length;
    const recentNotifs = [...notifs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    return (
      <div>
        <div className="grid-4" style={{ marginBottom: '24px' }}>
          <div className="stat-card"><div className="stat-value">{users.length}</div><div className="stat-label">Total Pengguna</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--success)' }}>{students}</div><div className="stat-label">Siswa</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--accent)' }}>{teachers}</div><div className="stat-label">Guru</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--accent2)' }}>{tasks.length}</div><div className="stat-label">Total Tugas</div></div>
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><h3>Daftar Pengguna</h3></div>
            {users.map((u) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(42,54,84,.3)' }}>
                <ColoredAvatar name={u.name} role={u.role} />
                <div><div style={{ fontSize: '14px', fontWeight: '500' }}>{u.name}</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email} | {u.role}</div></div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header"><h3>Aktivitas Terbaru</h3></div>
            {recentNotifs.length ? recentNotifs.map((n) => (
              <div key={n.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(42,54,84,.3)' }}>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>{n.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{n.message}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{timeAgo(n.createdAt)}</div>
              </div>
            )) : <div className="empty-state"><p>Tidak ada aktivitas</p></div>}
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'users') {
    const showAddUserModal = () => {
      setModal({
        title: 'Tambah Pengguna',
        body: (
          <div>
            <div className="form-group"><label>Nama</label><input className="form-control" id="auName" placeholder="Nama lengkap" /></div>
            <div className="form-group"><label>Email</label><input type="email" className="form-control" id="auEmail" placeholder="email@mytugas.com" /></div>
            <div className="form-group"><label>Password</label><input type="password" className="form-control" id="auPass" placeholder="Password" /></div>
            <div className="form-group">
              <label>Role</label>
              <select className="form-control" id="auRole" onChange={(e) => {
                document.getElementById('auStudentFields').style.display = e.target.value === 'student' ? 'block' : 'none';
                document.getElementById('auTeacherFields').style.display = e.target.value === 'teacher' ? 'block' : 'none';
              }}>
                <option value="student">Siswa</option><option value="teacher">Guru</option><option value="admin">Admin</option>
              </select>
            </div>
            <div id="auStudentFields">
              <div className="form-group"><label>NIS</label><input className="form-control" id="auNis" placeholder="2024001" /></div>
              <div className="form-group"><label>Kelas</label><input className="form-control" id="auClass" placeholder="XII IPA 1" /></div>
            </div>
            <div id="auTeacherFields" style={{ display: 'none' }}>
              <div className="form-group"><label>NIP</label><input className="form-control" id="auNip" placeholder="G-2024-001" /></div>
            </div>
          </div>
        ),
        footer: (
          <>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Batal</button>
            <button className="btn btn-primary" onClick={() => {
              const name = document.getElementById('auName').value.trim();
              const email = document.getElementById('auEmail').value.trim();
              const pass = document.getElementById('auPass').value;
              const role = document.getElementById('auRole').value;
              if (!name || !email || !pass) { addToast('Semua field wajib diisi', 'error'); return; }
              if (users.find((u) => u.email === email)) { addToast('Email sudah digunakan', 'error'); return; }

              const newUser = { id: 'u' + Date.now(), name, email, password: pass, role };
              if (role === 'student') { newUser.studentNumber = document.getElementById('auNis').value.trim(); newUser.className = document.getElementById('auClass').value.trim(); }
              if (role === 'teacher') { newUser.employeeNumber = document.getElementById('auNip').value.trim(); }

              DB.set(DB.USERS, [...users, newUser]);
              setModal(null);
              addToast('Pengguna berhasil ditambahkan!', 'success');
              refreshApp();
            }}>Simpan</button>
          </>
        )
      });
    };

    return (
      <div>
        <div className="page-header"><h2>Manajemen Pengguna</h2><button className="btn btn-primary" onClick={showAddUserModal}>+ Tambah Pengguna</button></div>
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Detail</th><th>Aksi</th></tr></thead>
              <tbody>
                {users.map((u) => {
                  const detail = u.role === 'student' ? `${u.studentNumber || ''} ${u.className ? '- ' + u.className : ''}` : u.role === 'teacher' ? (u.employeeNumber || '') : 'Admin';
                  return (
                    <tr key={u.id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ColoredAvatar name={u.name} role={u.role} /><span>{u.name}</span></div></td>
                      <td>{u.email}</td>
                      <td><span className={`badge badge-${u.role === 'admin' ? 'high' : u.role === 'teacher' ? 'in_progress' : 'done'}`}>{u.role}</span></td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{detail}</td>
                      <td>
                        {u.id !== 'u1' && (
                          <button className="btn btn-sm btn-danger" onClick={() => {
                            if (window.confirm('Yakin ingin menghapus pengguna ini?')) {
                              DB.set(DB.USERS, users.filter((x) => x.id !== u.id));
                              DB.set(DB.TASKS, tasks.filter((t) => t.owner !== u.id && t.createdBy !== u.id));
                              addToast('Pengguna dihapus', 'success');
                              refreshApp();
                            }
                          }}>Hapus</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return null;
}