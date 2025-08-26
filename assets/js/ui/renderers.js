// assets/js/ui/renderers.js
import { qs, empty, el, rowsToObjects } from "../utils/dom.js";

export function renderAnnouncements(sheet){
  const wrap = qs('#announcements');
  empty(wrap);
  const items = rowsToObjects(sheet);
  if (!items.length) { wrap.append(el('div', {text: 'Chưa có thông báo'})); return; }
  items.forEach(it => {
    const card = el('div', {className:'mb-3'});
    card.append(
      el('h6', {text: it.TieuDe || it['Tiêu đề'] || 'Thông báo'}),
      el('div', {text: it.NoiDung || it['Nội dung'] || ''}),
      el('small', {className:'text-muted', text: it.Ngay || it['Ngày'] || ''}),
    );
    wrap.append(card);
  });
}

export function renderBirthdays(sheet){
  const wrap = qs('#birthdays');
  empty(wrap);
  const items = rowsToObjects(sheet);
  if (!items.length) { wrap.append(el('div', {text:'—'})); return; }
  items.slice(0, 5).forEach(it => {
    const box = el('div', {className:'mb-2 student-card'});
    box.append(
      el('h6', {text: it.HoTen || it['Họ tên'] || 'Bạn'}),
      el('small', {text: `Sinh nhật: ${it.SinhNhat || it['Sinh nhật'] || ''}`})
    );
    wrap.append(box);
  });
}

export function renderStats(sheetHocSinh){
  const total = Math.max(0, (sheetHocSinh?.length || 1) - 1);
  const elTotal = qs('#statTotal');
  elTotal.textContent = String(total);
}

export function renderStudents(sheet){
  const list = qs('#studentsList');
  empty(list);
  const items = rowsToObjects(sheet);
  if (!items.length) {
    list.append(el('div', {text:'Chưa có dữ liệu học sinh'}));
    return;
  }
  items.forEach(it => {
    const col = el('div', {className:'col-12 col-md-6 col-xl-4'});
    const card = el('div', {className:'student-card h-100'});
    card.append(
      el('h6', {text: it.HoTen || it['Họ tên'] || '—'}),
      el('small', {text: (it.Lop || it['Lớp'] || '') + (it.Ma || it['Mã'] ? ` • Mã: ${it.Ma || it['Mã']}` : '')})
    );
    col.append(card);
    list.append(col);
  });
}

export function renderTimetable(sheet){
  const wrap = qs('#timetableWrap');
  empty(wrap);
  if (!sheet?.length) { wrap.append(el('div', {text:'Chưa có thời khóa biểu'})); return; }
  const table = el('table', {className:'table table-sm table-striped align-middle'});
  const thead = el('thead');
  const tbody = el('tbody');
  const [header, ...rows] = sheet;
  const trHead = el('tr');
  header.forEach(h => trHead.append(el('th', {text: h || ''})));
  thead.append(trHead);
  rows.forEach(r => {
    const tr = el('tr');
    header.forEach((_, i) => tr.append(el('td', {text: r?.[i] ?? ''})));
    tbody.append(tr);
  });
  table.append(thead, tbody);
  wrap.append(table);
}

// ===== Helpers for card lists =====
function mountCardGrid(containerSel, items, mapper){
  const wrap = qs(containerSel);
  empty(wrap);
  if (!items.length) { wrap.append(el('div', {text:'— Chưa có dữ liệu —'})); return; }
  items.forEach(it => {
    const col = el('div', {className:'col-12 col-md-6 col-xl-4'});
    const card = el('div', {className:'item-card'});
    const mapped = mapper(it);
    card.append(
      el('h6', {text: mapped.title}),
      el('div', {className:'meta', text: mapped.meta || ''}),
    );
    if (mapped.body) card.append(el('div', {text: mapped.body}));
    if (mapped.badges && mapped.badges.length){
      const box = el('div', {className:'mt-2'});
      mapped.badges.forEach(b => box.append(el('span', {className:'badge-soft', text: b})));
      card.append(box);
    }
    if (mapped.link){
      const a = el('a', {text:'Mở liên kết', attrs:{href: mapped.link, target:'_blank', rel:'noopener'}});
      card.append(el('div', {className:'mt-2'}).appendChild(a).parentNode);
    }
    col.append(card);
    wrap.append(col);
  });
}

// ===== New pages =====
export function renderAwards(sheet){
  const items = rowsToObjects(sheet);
  mountCardGrid('#awardsList', items, it => ({
    title: it.HoTen || it['Họ tên'] || it.Ten || it['Tên'] || '—',
    meta: `${it.Loai || it['Loại'] || 'Khen thưởng'} • ${it.Ngay || it['Ngày'] || ''}`.trim(),
    body: it.MoTa || it['Mô tả'] || '',
    badges: [it.Muc || it['Mức'] || it.Cap || it['Cấp']].filter(Boolean)
  }));
}

export function renderViolations(sheet){
  const items = rowsToObjects(sheet);
  mountCardGrid('#violationsList', items, it => ({
    title: it.HoTen || it['Họ tên'] || '—',
    meta: `${it.Loai || it['Loại'] || 'Vi phạm'} • ${it.MucDo || it['Mức độ'] || ''} • ${it.Ngay || it['Ngày'] || ''}`.trim(),
    body: it.MoTa || it['Mô tả'] || '',
    badges: [it.TrangThai || it['Trạng thái']].filter(Boolean)
  }));
}

export function renderDiscipline(sheet){
  const items = rowsToObjects(sheet);
  mountCardGrid('#disciplineList', items, it => ({
    title: it.NoiDung || it['Nội dung'] || it.TieuDe || it['Tiêu đề'] || 'Quy định',
    meta: `${it.Loai || it['Loại'] || 'Nề nếp'}${it.Ngay ? ' • ' + it.Ngay : ''}`,
    body: it.MoTa || it['Mô tả'] || ''
  }));
}

export function renderActivities(sheet){
  const items = rowsToObjects(sheet);
  mountCardGrid('#activitiesList', items, it => ({
    title: it.Ten || it['Tên'] || it.TieuDe || it['Tiêu đề'] || 'Hoạt động',
    meta: `${it.DonVi || it['Đơn vị'] || ''}${it.Ngay ? ' • ' + it.Ngay : ''}`.trim(),
    body: it.MoTa || it['Mô tả'] || '',
    badges: [it.CapDo || it['Cấp độ'] || it.TrangThai || it['Trạng thái']].filter(Boolean),
    link: it.Link || it.URL || it['Liên kết']
  }));
}

export function renderAttendance(sheet){
  const wrap = qs('#attendanceWrap');
  empty(wrap);
  if (!sheet?.length) { wrap.append(el('div', {text:'Chưa có dữ liệu điểm danh'})); return; }
  const table = el('table', {className:'table table-sm table-striped align-middle'});
  const thead = el('thead'); const tbody = el('tbody');
  const [header, ...rows] = sheet;
  const trHead = el('tr'); header.forEach(h => trHead.append(el('th', {text: h || ''})));
  thead.append(trHead);
  rows.forEach(r => {
    const tr = el('tr');
    header.forEach((_, i) => tr.append(el('td', {text: r?.[i] ?? ''})));
    tbody.append(tr);
  });
  table.append(thead, tbody); wrap.append(table);
}

export function renderEvents(sheet){
  const items = rowsToObjects(sheet);
  mountCardGrid('#eventsList', items, it => ({
    title: it.SuKien || it['Sự kiện'] || it.TieuDe || it['Tiêu đề'] || 'Sự kiện',
    meta: `${it.Ngay || it['Ngày'] || ''}${it.DiaDiem || it['Địa điểm'] ? ' • ' + (it.DiaDiem || it['Địa điểm']) : ''}`.trim(),
    body: it.MoTa || it['Mô tả'] || '',
    badges: [it.Loai || it['Loại']].filter(Boolean)
  }));
}

export function renderResources(sheet){
  const items = rowsToObjects(sheet);
  mountCardGrid('#resourcesList', items, it => ({
    title: it.Ten || it['Tên'] || it.TieuDe || it['Tiêu đề'] || 'Tài nguyên',
    meta: it.Loai || it['Loại'] || '',
    body: it.MoTa || it['Mô tả'] || '',
    link: it.Link || it.URL || it['Liên kết']
  }));
}

export function renderFeedback(sheet){
  const items = rowsToObjects(sheet);
  mountCardGrid('#feedbackList', items, it => ({
    title: it.NguoiGui || it['Người gửi'] || it.HoTen || it['Họ tên'] || 'Ẩn danh',
    meta: `${it.DoiTuong || it['Đối tượng'] || 'Góp ý'} • ${it.Ngay || it['Ngày'] || ''}`.trim(),
    body: it.NoiDung || it['Nội dung'] || ''
  }));
}
