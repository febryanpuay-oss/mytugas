import React, { useState } from 'react';
import { DB, SUBJECTS, autoStatus, statusLabel, daysUntil, shortDate, formatDate, timeAgo } from '../data/mockDb';

export default function StudentViews({ user, currentPage, setModal, addToast, refreshApp, showTaskDetail }) {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [subject, setSubject] = useState('');

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  const tasks = (DB.get(DB.TASKS) || []).filter((t) => t.owner === user.id);
  tasks.forEach((t) => { t._status = autoStatus(t); });

  const toggleTaskDone = (tid) => {
    const allTasks = DB.get(DB.TASKS) || [];
    const t = allTasks.find((x) => x.id === tid);
    if (!t) return;
    t.status = t.status === 'done' ? 'pending' : 'done';
    DB.set(DB.TASKS, allTasks);
    refreshApp();
  };

  const showCreateTaskModal = () => {
    setModal({
      title: 'Tambah Tugas Baru',
      body: (
        <div>
          <div className="form-group"><label>Judul</label><input className="form-control" id="ctTitle" placeholder="Judul tugas" /></div>
          <div className="form-group"><label>Mata Pelajaran</label><select className="form-control" id="ctSubject">{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="form-group"><label>Deadline</label><input type="date" className="form-control" id="ctDeadline" /></div>
          <div className="form-group"><label>Prioritas</label><select className="form-control" id="ctPriority" defaultValue="medium"><option value="low">Rendah</option><option value="medium">Sedang</option><option value="high">Tinggi</option></select></div>
          <div className="form-group"><label>Deskripsi</label><textarea className="form-control" id="ctDesc" placeholder="Deskripsi tugas..."></textarea></div>
        </div>
      ),
      footer: (
        <>
          <button className="btn btn-secondary" onClick={() => setModal(null)}>Batal</button>
          <button className="btn btn-primary" onClick={() => {
            const title = document.getElementById('ctTitle').value.trim();
            if (!title) { addToast('Judul harus diisi', 'error'); return; }
            const allTasks = DB.get(DB.TASKS) || [];
            allTasks.push({
              id: 't' + Date.now(), title,
              subject: document.getElementById('ctSubject').value,
              deadline: document.getElementById('ctDeadline').value || new Date().toISOString().split('T')[0],
              priority: document.getElementById('ctPriority').value,
              status: 'pending', isPersonal: true, owner: user.id,
              description: document.getElementById('ctDesc').value, notes: '', submission: null, grade: null
            });
            DB.set(DB.TASKS, allTasks);
            setModal(null);
            addToast('Tugas berhasil ditambahkan!', 'success');
            refreshApp();
          }}>Simpan</button>
        </>
      )
    });
  };

  if (currentPage === 'dashboard') {
    const total = tasks.length;
    const thisWeek = tasks.filter((t) => { const d = daysUntil(t.deadline); return d >= -1 && d <= 6; }).length;
    const done = tasks.filter((t) => t._status === 'done' || t._status === 'graded').length;
    const late = tasks.filter((t) => t._status === 'late').length;
    const high = tasks.filter((t) => t.priority === 'high' && t._status !== 'done' && t._status !== 'graded').length;

    const upcoming = tasks.filter((t) => !['done', 'graded', 'late'].includes(t._status)).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 5);
    const urgent = tasks.filter((t) => t.priority === 'high' && !['done', 'graded'].includes(t._status)).slice(0, 4);

    return (
      <div>
        <div className="grid-5" style={{ marginBottom: '24px' }}>
          <div className="stat-card"><div className="stat-value">{total}</div><div className="stat-label">Total Tugas</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--accent)' }}>{thisWeek}</div><div className="stat-label">Minggu Ini</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--success)' }}>{done}</div><div className="stat-label">Selesai</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--danger)' }}>{late}</div><div className="stat-label">Terlambat</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--warning)' }}>{high}</div><div className="stat-label">Prioritas Tinggi</div></div>
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><h3>Tugas Minggu Ini</h3></div>
            {upcoming.length ? upcoming.map((t) => (
              <div key={t.id} className={`task-item priority-${t.priority}`} onClick={() => showTaskDetail(t.id)}>
                <div className="task-info"><div className="task-title">{t.title}</div><div className="task-meta"><span>{t.subject}</span><span>{shortDate(t.deadline)}</span></div></div>
                <div className="task-badges"><span className={`badge badge-${t.priority}`}>{t.priority}</span><span className={`badge badge-${t._status}`}>{statusLabel(t._status)}</span></div>
              </div>
            )) : <div className="empty-state"><p>Belum ada tugas minggu ini</p></div>}
          </div>
          <div className="card">
            <div className="card-header"><h3>Tugas Prioritas Tinggi</h3></div>
            {urgent.length ? urgent.map((t) => (
              <div key={t.id} className={`task-item priority-${t.priority}`} onClick={() => showTaskDetail(t.id)}>
                <div className="task-info"><div className="task-title">{t.title}</div><div className="task-meta"><span>{t.subject}</span><span>Deadline: {shortDate(t.deadline)}</span></div></div>
                <div className="task-badges"><span className={`badge badge-${t.priority}`}>{t.priority}</span></div>
              </div>
            )) : <div className="empty-state"><p>Tidak ada tugas prioritas tinggi</p></div>}
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'tasks') {
    let filtered = [...tasks];
    if (search) filtered = filtered.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()));
    if (priority) filtered = filtered.filter((t) => t.priority === priority);
    if (status) filtered = filtered.filter((t) => t._status === status);
    if (subject) filtered = filtered.filter((t) => t.subject === subject);
    filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    return (
      <div>
        <div className="page-header"><h2>Tugas Saya</h2><button className="btn btn-primary" onClick={showCreateTaskModal}>+ Tambah Tugas</button></div>
        <div className="filter-bar">
          <input type="text" className="form-control" placeholder="Cari tugas..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}><option value="">Semua Prioritas</option><option value="high">Tinggi</option><option value="medium">Sedang</option><option value="low">Rendah</option></select>
          <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Semua Status</option><option value="pending">Pending</option><option value="in_progress">Dikerjakan</option><option value="done">Selesai</option><option value="late">Terlambat</option><option value="graded">Dinilai</option></select>
          <select className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)}><option value="">Semua Mata Pelajaran</option>{SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        </div>
        {filtered.length ? filtered.map((t) => {
          const isDone = t._status === 'done' || t._status === 'graded';
          return (
            <div key={t.id} className={`task-item ${isDone ? 'done' : ''} priority-${t.priority}`} onClick={() => showTaskDetail(t.id)}>
              <div className={`task-check ${isDone ? 'checked' : ''}`} onClick={(e) => { e.stopPropagation(); toggleTaskDone(t.id); }}>{isDone ? '✓' : ''}</div>
              <div className="task-info"><div className="task-title">{t.title}</div><div className="task-meta"><span>{t.subject}</span><span>{shortDate(t.deadline)}</span><span>{t.isPersonal ? 'Personal' : 'Dari Guru'}</span></div></div>
              <div className="task-badges"><span className={`badge badge-${t.priority}`}>{t.priority}</span><span className={`badge badge-${t._status}`}>{statusLabel(t._status)}</span></div>
            </div>
          );
        }) : <div className="empty-state"><p>Tidak ada tugas ditemukan</p></div>}
      </div>
    );
  }

  if (currentPage === 'calendar') {
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date();
    const cells = [];

    ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].forEach((h) => cells.push(<div key={h} className="cal-header">{h}</div>));
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} className="cal-cell empty"></div>);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTasks = tasks.filter((t) => t.deadline === dateStr);
      const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
      const cls = `cal-cell${isToday || selectedDate === dateStr ? ' today' : ''}`;
      cells.push(
        <div key={d} className={cls} onClick={() => setSelectedDate(dateStr)}>
          <div className="day-num">{d}</div>
          <div className="cal-dots">{dayTasks.map((t) => <div key={t.id} className="cal-dot" style={{ background: `var(--${t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'success'})` }} />)}</div>
        </div>
      );
    }

    const selectedTasks = selectedDate ? tasks.filter((t) => t.deadline === selectedDate) : [];

    return (
      <div>
        <div className="calendar-nav">
          <button className="btn btn-secondary" onClick={() => { let m = calMonth - 1, y = calYear; if (m < 0) { m = 11; y--; } setCalMonth(m); setCalYear(y); setSelectedDate(null); }}>◀ Prev</button>
          <h3>{monthNames[calMonth]} {calYear}</h3>
          <button className="btn btn-secondary" onClick={() => { let m = calMonth + 1, y = calYear; if (m > 11) { m = 0; y++; } setCalMonth(m); setCalYear(y); setSelectedDate(null); }}>Next ▶</button>
        </div>
        <div className="calendar-grid">{cells}</div>
        {selectedDate && (
          <div className="card">
            <div className="card-header"><h3>Tugas pada {formatDate(selectedDate)}</h3></div>
            {selectedTasks.length ? selectedTasks.map((t) => (
              <div key={t.id} className={`task-item priority-${t.priority}`} onClick={() => showTaskDetail(t.id)}>
                <div className="task-info"><div className="task-title">{t.title}</div><div className="task-meta"><span>{t.subject}</span></div></div>
                <div className="task-badges"><span className={`badge badge-${t.priority}`}>{t.priority}</span><span className={`badge badge-${t._status}`}>{statusLabel(t._status)}</span></div>
              </div>
            )) : <div className="empty-state"><p>Tidak ada tugas</p></div>}
          </div>
        )}
      </div>
    );
  }

  if (currentPage === 'notifications') {
    const myNotifs = (DB.get(DB.NOTIFS) || []).filter((n) => n.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const typeIcons = { deadline: '⏰', grade: '🎯', assignment: '📝', submission: '📦', late: '⚠️' };
    const typeColors = { deadline: 'rgba(245,158,11,.15)', grade: 'rgba(139,92,246,.15)', assignment: 'rgba(59,130,246,.15)', submission: 'rgba(16,185,129,.15)', late: 'rgba(239,68,68,.15)' };

    return (
      <div>
        <div className="page-header">
          <h2>Notifikasi</h2>
          <button className="btn btn-secondary" onClick={() => {
            const allN = DB.get(DB.NOTIFS) || [];
            allN.forEach((n) => { if (n.userId === user.id) n.read = true; });
            DB.set(DB.NOTIFS, allN);
            refreshApp();
            addToast('Semua notifikasi ditandai dibaca', 'success');
          }}>Tandai Semua Dibaca</button>
        </div>
        {myNotifs.length ? myNotifs.map((n) => (
          <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => {
            const allN = DB.get(DB.NOTIFS) || [];
            const item = allN.find((x) => x.id === n.id);
            if (item) { item.read = true; DB.set(DB.NOTIFS, allN); refreshApp(); }
          }}>
            <div className="notif-icon" style={{ background: typeColors[n.type] || 'rgba(59,130,246,.15)' }}>{typeIcons[n.type] || '🔔'}</div>
            <div className="notif-content"><div className="notif-title">{n.title}</div><div className="notif-msg">{n.message}</div><div className="notif-time">{timeAgo(n.createdAt)}</div></div>
          </div>
        )) : <div className="empty-state"><p>Tidak ada notifikasi</p></div>}
      </div>
    );
  }

  return null;
}