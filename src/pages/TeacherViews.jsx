import React from 'react';
import { DB, SUBJECTS, shortDate, timeAgo } from '../data/mockDb';

export default function TeacherViews({ user, currentPage, setModal, addToast, refreshApp, showTaskDetail, showGradeModal }) {
  const tasks = DB.get(DB.TASKS) || [];
  const users = DB.get(DB.USERS) || [];
  const assigned = tasks.filter((t) => t.createdBy === user.id);

  if (currentPage === 'teacher-dashboard') {
    const submitted = assigned.filter((t) => t.status === 'done' || t.status === 'graded' || t.submission);
    const graded = assigned.filter((t) => t.status === 'graded');
    const students = users.filter((u) => u.role === 'student');
    const pendingReview = assigned.filter((t) => t.status === 'done' && !t.grade);

    const bySubject = {};
    SUBJECTS.forEach((s) => { bySubject[s] = { total: 0, done: 0 }; });
    assigned.forEach((t) => {
      if (bySubject[t.subject]) {
        bySubject[t.subject].total++;
        if (t.status === 'done' || t.status === 'graded') bySubject[t.subject].done++;
      }
    });

    return (
      <div>
        <div className="grid-4" style={{ marginBottom: '24px' }}>
          <div className="stat-card"><div className="stat-value">{assigned.length}</div><div className="stat-label">Total Ditugaskan</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--accent)' }}>{submitted.length}</div><div className="stat-label">Sudah Dikumpulkan</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--success)' }}>{graded.length}</div><div className="stat-label">Sudah Dinilai</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--accent2)' }}>{students.length}</div><div className="stat-label">Siswa Aktif</div></div>
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><h3>Tugas Perlu Direview</h3></div>
            {pendingReview.length ? pendingReview.map((t) => {
              const owner = users.find((u) => u.id === t.owner);
              return (
                <div key={t.id} className={`task-item priority-${t.priority}`} onClick={() => showTaskDetail(t.id)}>
                  <div className="task-info"><div className="task-title">{t.title}</div><div className="task-meta"><span>{t.subject}</span><span>{owner?.name || ''}</span></div></div>
                  <div className="task-badges"><button className="btn btn-sm btn-success" onClick={(e) => { e.stopPropagation(); showGradeModal(t.id); }}>Beri Nilai</button></div>
                </div>
              );
            }) : <div className="empty-state"><p>Tidak ada tugas perlu review</p></div>}
          </div>
          <div className="card">
            <div className="card-header"><h3>Ringkasan Per Mata Pelajaran</h3></div>
            {SUBJECTS.map((s) => {
              const info = bySubject[s] || { total: 0, done: 0 };
              const pct = info.total ? Math.round((info.done / info.total) * 100) : 0;
              return (
                <div key={s} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}><span>{s}</span><span style={{ color: 'var(--text-muted)' }}>{info.done}/{info.total}</span></div>
                  <div className="progress-bar"><div className="fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--accent),var(--accent2))' }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const grouped = {};
  assigned.forEach((t) => {
    if (!grouped[t.title]) grouped[t.title] = { task: t, items: [] };
    grouped[t.title].items.push(t);
  });

  if (currentPage === 'assignments') {
    const showCreateModal = () => {
      const students = users.filter((u) => u.role === 'student');
      setModal({
        title: 'Buat Tugas Baru',
        body: (
          <div>
            <div className="form-group"><label>Judul</label><input className="form-control" id="caTitle" placeholder="Judul tugas" /></div>
            <div className="form-group"><label>Mata Pelajaran</label><select className="form-control" id="caSubject">{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>Deadline</label><input type="date" className="form-control" id="caDeadline" /></div>
            <div className="form-group"><label>Prioritas</label><select className="form-control" id="caPriority" defaultValue="medium"><option value="low">Rendah</option><option value="medium">Sedang</option><option value="high">Tinggi</option></select></div>
            <div className="form-group"><label>Deskripsi</label><textarea className="form-control" id="caDesc" placeholder="Deskripsi tugas..."></textarea></div>
            <div className="form-group"><label>Pilih Siswa</label><div className="checkbox-grid">{students.map((s) => <label key={s.id} className="checkbox-item"><input type="checkbox" value={s.id} defaultChecked /> {s.name}</label>)}</div></div>
          </div>
        ),
        footer: (
          <>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Batal</button>
            <button className="btn btn-primary" onClick={() => {
              const title = document.getElementById('caTitle').value.trim();
              if (!title) { addToast('Judul harus diisi', 'error'); return; }
              const checked = Array.from(document.querySelectorAll('.checkbox-grid input:checked')).map((c) => c.value);
              if (!checked.length) { addToast('Pilih minimal satu siswa', 'error'); return; }

              const allTasks = DB.get(DB.TASKS) || [];
              const allNotifs = DB.get(DB.NOTIFS) || [];
              const baseId = 't' + Date.now();

              checked.forEach((sid, i) => {
                allTasks.push({
                  id: `${baseId}_${i}`, title,
                  subject: document.getElementById('caSubject').value,
                  deadline: document.getElementById('caDeadline').value || new Date().toISOString().split('T')[0],
                  priority: document.getElementById('caPriority').value,
                  status: 'pending', isPersonal: false, owner: sid, createdBy: user.id,
                  description: document.getElementById('caDesc').value, notes: '', submission: null, grade: null
                });
                allNotifs.push({ id: `n${Date.now()}_${i}`, userId: sid, type: 'assignment', title: 'Tugas Baru Dari Guru', message: `${user.name} menugaskan: ${title}`, read: false, createdAt: new Date().toISOString(), taskId: `${baseId}_${i}` });
              });

              DB.set(DB.TASKS, allTasks);
              DB.set(DB.NOTIFS, allNotifs);
              setModal(null);
              addToast('Tugas berhasil dibuat!', 'success');
              refreshApp();
            }}>Buat Tugas</button>
          </>
        )
      });
    };

    return (
      <div>
        <div className="page-header"><h2>Tugas Diberikan</h2><button className="btn btn-primary" onClick={showCreateModal}>+ Buat Tugas Baru</button></div>
        {Object.keys(grouped).length ? Object.keys(grouped).map((k) => {
          const g = grouped[k];
          const sub = g.items.filter((t) => t.status === 'done' || t.status === 'graded' || t.submission).length;
          const grad = g.items.filter((t) => t.status === 'graded').length;
          return (
            <div key={k} className="card">
              <div className="card-header">
                <div><h3>{g.task.title}</h3><span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{g.task.subject} | Deadline: {shortDate(g.task.deadline)}</span></div>
                <button className="btn btn-sm btn-danger" onClick={() => {
                  if (window.confirm(`Hapus tugas "${g.task.title}" dari semua siswa?`)) {
                    DB.set(DB.TASKS, tasks.filter((t) => !(t.createdBy === user.id && t.title === g.task.title)));
                    addToast('Tugas dihapus', 'success');
                    refreshApp();
                  }
                }}>Hapus</button>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}><span>Ditugaskan: {g.items.length}</span><span>Dikumpulkan: {sub}</span><span>Dinilai: {grad}</span></div>
              <div className="progress-bar"><div className="fill" style={{ width: `${g.items.length ? Math.round((sub / g.items.length) * 100) : 0}%`, background: 'var(--success)' }} /></div>
            </div>
          );
        }) : <div className="empty-state"><p>Belum ada tugas yang diberikan</p></div>}
      </div>
    );
  }

  if (currentPage === 'submissions') {
    return (
      <div>
        <div className="page-header"><h2>Pengumpulan Tugas</h2></div>
        {Object.keys(grouped).length ? Object.keys(grouped).map((k) => {
          const g = grouped[k];
          return (
            <div key={k} className="card">
              <div className="card-header"><h3>{g.task.title}</h3><span className={`badge badge-${g.task.priority}`}>{g.task.priority}</span></div>
              {g.items.map((t) => {
                const owner = users.find((u) => u.id === t.owner);
                return (
                  <div key={t.id} className="submission-item">
                    <div className="sub-info">
                      <div className="sub-name">{owner?.name || 'Siswa'}</div>
                      <div className="sub-meta">{t.submission ? `File: ${t.submission.fileName} | ${timeAgo(t.submission.submittedAt)}` : 'Belum dikumpulkan'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!t.submission ? <span className="badge badge-pending">Belum Mengumpulkan</span> : t.status === 'graded' ? <span className="badge badge-graded">Dinilai: {t.grade.score}</span> : <span className="badge badge-done">Dikumpulkan</span>}
                      {t.submission && t.status !== 'graded' && <button className="btn btn-sm btn-success" onClick={() => showGradeModal(t.id)}>Beri Nilai</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }) : <div className="empty-state"><p>Belum ada tugas yang diberikan</p></div>}
      </div>
    );
  }

  return null;
}