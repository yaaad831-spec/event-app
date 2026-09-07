/* =============================================================
   EventHub — script.js
   ระบบทั้งหมดทำงานฝั่ง Client ล้วน ๆ โดยใช้ LocalStorage เป็นฐานข้อมูลจำลอง
   โครงสร้าง: DB Layer -> Helpers -> Router -> Page Renderers -> Event Handlers
============================================================= */

/* ---------------------- 1) DB LAYER ---------------------- */
const DB = {
  USERS: 'eh_users',
  EVENTS: 'eh_events',
  REGS: 'eh_registrations',
  FAVS: 'eh_favorites',
  SETTINGS: 'eh_settings',
  SESSION: 'eh_session'
};

// อ่านข้อมูลจาก LocalStorage (คืนค่า array ว่างถ้ายังไม่มี)
function dbGet(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}
// บันทึกข้อมูลลง LocalStorage
function dbSet(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// สร้าง ID สุ่มไม่ซ้ำ สำหรับใช้เป็น Primary Key ของแต่ละตาราง
function genId(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const CATEGORIES = ['ดนตรี', 'กีฬา', 'การศึกษา', 'เทคโนโลยี', 'ศิลปะ', 'บันเทิง', 'อื่น ๆ'];

// เติมข้อมูลตั้งต้น (Seed) เฉพาะตอนที่ยังไม่เคยมีข้อมูลใน LocalStorage เท่านั้น
// เพื่อไม่ให้ข้อมูลที่ผู้ใช้แก้ไขแล้วถูกเขียนทับเมื่อ Refresh หน้าเว็บ
function initDB() {
  if (!localStorage.getItem(DB.USERS)) {
    const demoUser = {
      UserID: 'u_demo_user', Name: 'สมชาย ใจดี', Email: 'user@eventhub.com',
      Password: '1234', ProfileImage: '', Role: 'User'
    };
    const demoOrganizer = {
      UserID: 'u_demo_organizer', Name: 'ทีมงาน EventHub', Email: 'organizer@eventhub.com',
      Password: '1234', ProfileImage: '', Role: 'Organizer'
    };
    dbSet(DB.USERS, [demoUser, demoOrganizer]);
  }

  if (!localStorage.getItem(DB.EVENTS)) {
    const orgId = 'u_demo_organizer';
    const events = [
      {
        EventID: genId('ev'), EventName: 'KK Music Festival', Image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
        Category: 'ดนตรี', Description: 'เทศกาลดนตรีกลางแจ้งที่รวมศิลปินหน้าใหม่และวงดนตรีชื่อดังไว้ในค่ำคืนเดียว เตรียมมาสนุกไปกับแสง สี เสียง แบบเต็มอิ่ม',
        Date: '2026-09-20', StartTime: '18:00', EndTime: '21:00', Location: 'ขอนแก่น',
        Price: 100, Capacity: 100, OrganizerID: orgId, Status: 'เปิดรับสมัคร'
      },
      {
        EventID: genId('ev'), EventName: 'Tech Workshop 2026', Image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
        Category: 'เทคโนโลยี', Description: 'เวิร์กชอปเทคโนโลยีที่พาไปรู้จักเครื่องมือและแนวคิดใหม่ ๆ ที่ใช้ได้จริงในการเรียนและการทำงาน',
        Date: '2026-09-25', StartTime: '09:00', EndTime: '16:00', Location: 'วิทยาลัยเทคโนโลยีขอนแก่น',
        Price: 0, Capacity: 50, OrganizerID: orgId, Status: 'เปิดรับสมัคร'
      },
      {
        EventID: genId('ev'), EventName: 'Sports Day', Image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
        Category: 'กีฬา', Description: 'วันแข่งขันกีฬาสีประจำปี ร่วมเชียร์และร่วมแข่งขันกีฬาหลากหลายประเภทกับเพื่อน ๆ ทุกคณะ',
        Date: '2026-09-28', StartTime: '08:00', EndTime: '16:00', Location: 'สนามกีฬาวิทยาลัย',
        Price: 50, Capacity: 200, OrganizerID: orgId, Status: 'เปิดรับสมัคร'
      },
      {
        EventID: genId('ev'), EventName: 'Creative Art Workshop', Image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80',
        Category: 'ศิลปะ', Description: 'ปลดปล่อยความคิดสร้างสรรค์ผ่านกิจกรรมศิลปะแบบลงมือทำจริง เหมาะสำหรับทุกระดับฝีมือ',
        Date: '2026-10-02', StartTime: '13:00', EndTime: '16:00', Location: 'หอศิลป์ขอนแก่น',
        Price: 150, Capacity: 30, OrganizerID: orgId, Status: 'เปิดรับสมัคร'
      },
      {
        EventID: genId('ev'), EventName: 'Coding Bootcamp', Image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
        Category: 'การศึกษา', Description: 'ค่ายอบรมเขียนโปรแกรมเข้มข้น ตั้งแต่พื้นฐานจนถึงการสร้างโปรเจกต์จริงภายในค่ายเดียว',
        Date: '2026-10-05', StartTime: '09:00', EndTime: '17:00', Location: 'อาคารนวัตกรรม ขอนแก่น',
        Price: 0, Capacity: 60, OrganizerID: orgId, Status: 'เปิดรับสมัคร'
      },
      {
        EventID: genId('ev'), EventName: 'KK Entertainment Night', Image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
        Category: 'บันเทิง', Description: 'ค่ำคืนแห่งความบันเทิงเต็มรูปแบบ พบกับการแสดง มินิคอนเสิร์ต และกิจกรรมสนุก ๆ ตลอดทั้งคืน',
        Date: '2026-10-10', StartTime: '18:30', EndTime: '22:00', Location: 'ลานกิจกรรมกลางเมืองขอนแก่น',
        Price: 120, Capacity: 150, OrganizerID: orgId, Status: 'เปิดรับสมัคร'
      }
    ];
    dbSet(DB.EVENTS, events);
  }

  if (!localStorage.getItem(DB.REGS)) dbSet(DB.REGS, []);
  if (!localStorage.getItem(DB.FAVS)) dbSet(DB.FAVS, []);
  if (!localStorage.getItem(DB.SETTINGS)) {
    dbSet(DB.SETTINGS, { siteName: 'EventHub', siteDescription: 'ระบบกิจกรรมและงานอีเว้นต์', registrationEnabled: true });
  }
}

/* ---------------------- 2) SESSION HELPERS ---------------------- */
function getSession() {
  const raw = localStorage.getItem(DB.SESSION);
  return raw ? JSON.parse(raw) : null;
}
function setSession(userId) {
  localStorage.setItem(DB.SESSION, JSON.stringify({ userId }));
}
function clearSession() {
  localStorage.removeItem(DB.SESSION);
}
function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  return dbGet(DB.USERS).find(u => u.UserID === session.userId) || null;
}

/* ---------------------- 3) GENERAL HELPERS ---------------------- */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}
function formatPrice(price) {
  const n = Number(price);
  return n === 0 ? 'ฟรี' : n.toLocaleString('th-TH') + ' บาท';
}
function registeredCountForEvent(eventId) {
  return dbGet(DB.REGS).filter(r => r.EventID === eventId && r.Status !== 'Cancelled').length;
}
function remainingSeats(evt) {
  return evt.Capacity - registeredCountForEvent(evt.EventID);
}
// คำนวณสถานะกิจกรรมใหม่ตามจำนวนที่นั่งคงเหลือ (คงสถานะ ปิดรับสมัคร / จบกิจกรรม ถ้าถูกตั้งไว้แล้ว)
function recalcEventStatus(evt) {
  if (evt.Status === 'ปิดรับสมัคร' || evt.Status === 'จบกิจกรรม') return evt;
  evt.Status = remainingSeats(evt) <= 0 ? 'เต็ม' : 'เปิดรับสมัคร';
  return evt;
}
function statusClass(status) {
  switch (status) {
    case 'เปิดรับสมัคร': return 'status-open';
    case 'เต็ม': return 'status-full';
    case 'ปิดรับสมัคร': return 'status-closed';
    case 'จบกิจกรรม': return 'status-done';
    default: return '';
  }
}
function isFavorite(userId, eventId) {
  return dbGet(DB.FAVS).some(f => f.UserID === userId && f.EventID === eventId);
}
function isRegistered(userId, eventId) {
  return dbGet(DB.REGS).some(r => r.UserID === userId && r.EventID === eventId && r.Status !== 'Cancelled');
}

function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast ' + type;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.classList.add('hidden'); }, 2600);
}
function showConfirm(message, onConfirm) {
  const overlay = document.getElementById('confirm-overlay');
  document.getElementById('confirm-message').textContent = message;
  overlay.classList.remove('hidden');
  const okBtn = document.getElementById('confirm-ok');
  const cancelBtn = document.getElementById('confirm-cancel');
  const cleanup = () => {
    overlay.classList.add('hidden');
    okBtn.removeEventListener('click', onOk);
    cancelBtn.removeEventListener('click', onCancel);
  };
  const onOk = () => { cleanup(); onConfirm(); };
  const onCancel = () => { cleanup(); };
  okBtn.addEventListener('click', onOk);
  cancelBtn.addEventListener('click', onCancel);
}
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

/* ---------------------- 4) ROUTER ---------------------- */
function navigate(hash) { window.location.hash = hash; }

function currentRoute() {
  const hash = window.location.hash.slice(1) || '/login';
  const parts = hash.split('/').filter(Boolean);
  return { hash, parts };
}

const PUBLIC_ROUTES = ['login'];

function router() {
  const user = getCurrentUser();
  const { parts } = currentRoute();
  const page = parts[0] || 'login';

  // Auth Guard: ถ้ายังไม่ Login ให้บังคับไปหน้า Login เสมอ
  if (!user && !PUBLIC_ROUTES.includes(page)) {
    navigate('/login');
    return;
  }
  // ถ้า Login แล้วพยายามเข้าหน้า Login ให้เด้งไปหน้าแรกตาม Role
  if (user && page === 'login') {
    navigate(user.Role === 'Organizer' ? '/dashboard' : '/home');
    return;
  }
  // ป้องกันหน้าเฉพาะ Organizer
  const organizerOnly = ['dashboard', 'create-event', 'edit-event', 'participants', 'users', 'reports', 'settings'];
  if (user && organizerOnly.includes(page) && user.Role !== 'Organizer') {
    navigate('/home');
    return;
  }

  renderHeader(user, page);
  hideAllPages();

  switch (page) {
    case 'login': renderLoginPage(); break;
    case 'home': showPage('page-home'); renderHomePage(user); break;
    case 'explore': showPage('page-explore'); renderExplorePage(); break;
    case 'event': showPage('page-detail'); renderDetailPage(parts[1], user); break;
    case 'myevents': showPage('page-myevents'); renderMyEventsPage(user); break;
    case 'profile': showPage('page-profile'); renderProfilePage(user); break;
    case 'dashboard': showPage('page-dashboard'); renderDashboardPage(user); break;
    case 'create-event': showPage('page-eventform'); renderEventFormPage(null); break;
    case 'edit-event': showPage('page-eventform'); renderEventFormPage(parts[1]); break;
    case 'participants': showPage('page-participants'); renderParticipantsPage(parts[1]); break;
    case 'users': showPage('page-users'); renderUsersPage(); break;
    case 'reports': showPage('page-reports'); renderReportsPage(); break;
    case 'settings': showPage('page-settings'); renderSettingsPage(); break;
    default: navigate('/home');
  }
}

function hideAllPages() {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
}
function showPage(id) {
  document.getElementById(id).classList.remove('hidden');
}

/* ---------------------- 5) HEADER / NAV ---------------------- */
function renderHeader(user, activePage) {
  const header = document.getElementById('app-header');
  const footer = document.getElementById('app-footer');
  if (!user) {
    header.classList.add('hidden');
    footer.classList.add('hidden');
    return;
  }
  header.classList.remove('hidden');
  footer.classList.remove('hidden');

  const userLinks = [
    { href: '#/home', label: 'หน้าแรก', key: 'home' },
    { href: '#/explore', label: 'สำรวจกิจกรรม', key: 'explore' },
    { href: '#/myevents', label: 'กิจกรรมของฉัน', key: 'myevents' },
    { href: '#/profile', label: 'โปรไฟล์', key: 'profile' }
  ];
  const organizerLinks = [
    { href: '#/dashboard', label: 'แดชบอร์ด', key: 'dashboard' },
    { href: '#/create-event', label: 'สร้างกิจกรรม', key: 'create-event' },
    { href: '#/users', label: 'ผู้ใช้', key: 'users' },
    { href: '#/reports', label: 'รายงาน', key: 'reports' },
    { href: '#/settings', label: 'ตั้งค่า', key: 'settings' },
    { href: '#/profile', label: 'โปรไฟล์', key: 'profile' }
  ];
  const links = user.Role === 'Organizer' ? organizerLinks : userLinks;
  const linksHtml = links.map(l =>
    `<a href="${l.href}" class="${activePage === l.key ? 'active' : ''}">${l.label}</a>`
  ).join('');

  document.getElementById('main-nav').innerHTML = linksHtml;
  document.getElementById('mobile-nav').innerHTML = linksHtml;
  document.getElementById('header-avatar').href = '#/profile';
}

/* ---------------------- 6) LOGIN / REGISTER ---------------------- */
function renderLoginPage() {
  showPage('page-login');
  document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === 'login'));
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('register-error').classList.add('hidden');
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  const user = dbGet(DB.USERS).find(u => u.Email.toLowerCase() === email && u.Password === password && u.Active !== false);
  if (!user) {
    errorEl.textContent = 'อีเมล รหัสผ่านไม่ถูกต้อง หรือบัญชีถูกปิดใช้งาน';
    errorEl.classList.remove('hidden');
    return;
  }
  setSession(user.UserID);
  showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ' + user.Name, 'success');
  navigate(user.Role === 'Organizer' ? '/dashboard' : '/home');
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim().toLowerCase();
  const password = document.getElementById('register-password').value;
  const role = document.getElementById('register-role').value;
  const errorEl = document.getElementById('register-error');

  const settings = dbGet(DB.SETTINGS);
  if (settings.registrationEnabled === false) {
    errorEl.textContent = 'ขณะนี้ปิดรับการสมัครสมาชิกใหม่';
    errorEl.classList.remove('hidden');
    return;
  }

  const users = dbGet(DB.USERS);
  if (users.some(u => u.Email.toLowerCase() === email)) {
    errorEl.textContent = 'อีเมลนี้ถูกใช้สมัครสมาชิกแล้ว';
    errorEl.classList.remove('hidden');
    return;
  }
  const newUser = { UserID: genId('u'), Name: name, Email: email, Password: password, ProfileImage: '', Role: role };
  users.push(newUser);
  dbSet(DB.USERS, users);
  setSession(newUser.UserID);
  showToast('สมัครสมาชิกสำเร็จ ยินดีต้อนรับสู่ EventHub', 'success');
  navigate(role === 'Organizer' ? '/dashboard' : '/home');
}

function handleLogout() {
  clearSession();
  showToast('ออกจากระบบเรียบร้อยแล้ว');
  navigate('/login');
}

/* ---------------------- 7) EVENT CARD RENDERER (ใช้ร่วมกันหลายหน้า) ---------------------- */
function eventCardHtml(evt, user) {
  recalcEventStatus(evt);
  const seatsLeft = remainingSeats(evt);
  const fav = user ? isFavorite(user.UserID, evt.EventID) : false;
  const registered = user ? isRegistered(user.UserID, evt.EventID) : false;
  const disabled = evt.Status !== 'เปิดรับสมัคร' && !registered;

  return `
  <div class="event-card" data-event-id="${evt.EventID}">
    <div class="event-card-img" style="background-image:url('${escapeHtml(evt.Image || '')}')">
      <span class="category-badge">${escapeHtml(evt.Category)}</span>
      <button class="fav-btn js-fav" data-id="${evt.EventID}" title="บันทึกกิจกรรม">${fav ? '❤️' : '♡'}</button>
    </div>
    <div class="event-card-body">
      <h3>${escapeHtml(evt.EventName)}</h3>
      <div class="event-meta">
        <span>📅 ${formatDate(evt.Date)} · ${evt.StartTime || ''}-${evt.EndTime || ''}</span>
        <span>📍 ${escapeHtml(evt.Location)}</span>
      </div>
      <div class="event-foot">
        <span class="event-price">${formatPrice(evt.Price)}</span>
        <span class="status-pill ${statusClass(evt.Status)}">${evt.Status}</span>
      </div>
      <span class="event-seats">เหลือ ${Math.max(seatsLeft, 0)} / ${evt.Capacity} ที่นั่ง</span>
    </div>
    <div class="event-actions">
      <a href="#/event/${evt.EventID}" class="btn btn-secondary btn-sm">รายละเอียด</a>
      <button class="btn btn-sm ${registered ? 'btn-secondary' : 'btn-primary'} js-join" data-id="${evt.EventID}" ${disabled ? 'disabled' : ''}>
        ${registered ? '✓ ลงทะเบียนแล้ว' : (evt.Status === 'เปิดรับสมัคร' ? 'เข้าร่วม' : evt.Status)}
      </button>
    </div>
  </div>`;
}

function attachEventCardHandlers(container, user) {
  container.querySelectorAll('.js-fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleFavorite(user.UserID, btn.dataset.id);
      router(); // re-render current page to reflect change
    });
  });
  container.querySelectorAll('.js-join').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      registerForEvent(user, btn.dataset.id);
    });
  });
}

/* ---------------------- 8) HOME PAGE ---------------------- */
function renderHomePage(user) {
  const events = dbGet(DB.EVENTS).map(recalcEventStatus);
  dbSet(DB.EVENTS, events);

  // หมวดหมู่
  const catRow = document.getElementById('home-categories');
  catRow.innerHTML = CATEGORIES.map(c => `<a href="#/explore?cat=${encodeURIComponent(c)}" class="category-chip js-home-cat" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</a>`).join('');
  catRow.querySelectorAll('.js-home-cat').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.setItem('eh_explore_category', a.dataset.cat);
      navigate('/explore');
    });
  });

  // กิจกรรมยอดนิยม: เรียงตามจำนวนผู้ลงทะเบียนมากสุด
  const popular = [...events].sort((a, b) => registeredCountForEvent(b.EventID) - registeredCountForEvent(a.EventID)).slice(0, 4);
  const popularEl = document.getElementById('popular-events');
  popularEl.innerHTML = popular.map(e => eventCardHtml(e, user)).join('') || '<p class="empty-state">ยังไม่มีกิจกรรม</p>';
  attachEventCardHandlers(popularEl, user);

  // กิจกรรมใกล้ถึง: เรียงตามวันที่ใกล้ที่สุด และยังไม่จบกิจกรรม
  const upcoming = [...events]
    .filter(e => e.Status !== 'จบกิจกรรม')
    .sort((a, b) => new Date(a.Date) - new Date(b.Date))
    .slice(0, 4);
  const upcomingEl = document.getElementById('upcoming-events');
  upcomingEl.innerHTML = upcoming.map(e => eventCardHtml(e, user)).join('') || '<p class="empty-state">ยังไม่มีกิจกรรม</p>';
  attachEventCardHandlers(upcomingEl, user);

  document.getElementById('home-search').oninput = (e) => {
    sessionStorage.setItem('eh_explore_search', e.target.value);
  };
  document.getElementById('home-search').onkeydown = (e) => {
    if (e.key === 'Enter') navigate('/explore');
  };
}

/* ---------------------- 9) EXPLORE PAGE ---------------------- */
function renderExplorePage() {
  const user = getCurrentUser();
  const catSelect = document.getElementById('explore-category');
  catSelect.innerHTML = '<option value="">ทุกหมวดหมู่</option>' + CATEGORIES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');

  const presetCat = sessionStorage.getItem('eh_explore_category') || '';
  const presetSearch = sessionStorage.getItem('eh_explore_search') || '';
  sessionStorage.removeItem('eh_explore_category');
  catSelect.value = presetCat;
  document.getElementById('explore-search').value = presetSearch;

  function renderResults() {
    const q = document.getElementById('explore-search').value.trim().toLowerCase();
    const cat = catSelect.value;
    const events = dbGet(DB.EVENTS).map(recalcEventStatus);
    dbSet(DB.EVENTS, events);

    const filtered = events.filter(evt => {
      const matchesQuery = !q ||
        evt.EventName.toLowerCase().includes(q) ||
        evt.Location.toLowerCase().includes(q) ||
        evt.Category.toLowerCase().includes(q);
      const matchesCat = !cat || evt.Category === cat;
      return matchesQuery && matchesCat;
    });

    const resultsEl = document.getElementById('explore-results');
    const emptyEl = document.getElementById('explore-empty');
    if (filtered.length === 0) {
      resultsEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
    } else {
      emptyEl.classList.add('hidden');
      resultsEl.innerHTML = filtered.map(e => eventCardHtml(e, user)).join('');
      attachEventCardHandlers(resultsEl, user);
    }
  }

  document.getElementById('explore-search').oninput = renderResults;
  catSelect.onchange = renderResults;
  renderResults();
}

/* ---------------------- 10) EVENT DETAIL PAGE ---------------------- */
function renderDetailPage(eventId, user) {
  const events = dbGet(DB.EVENTS);
  const evt = events.find(e => e.EventID === eventId);
  const container = document.getElementById('detail-content');
  if (!evt) {
    container.innerHTML = '<p class="empty-state">ไม่พบกิจกรรมนี้</p>';
    return;
  }
  recalcEventStatus(evt);
  dbSet(DB.EVENTS, events);

  const organizer = dbGet(DB.USERS).find(u => u.UserID === evt.OrganizerID);
  const seatsLeft = Math.max(remainingSeats(evt), 0);
  const seatsPct = Math.min(100, Math.round(((evt.Capacity - seatsLeft) / evt.Capacity) * 100));
  const fav = isFavorite(user.UserID, evt.EventID);
  const registered = isRegistered(user.UserID, evt.EventID);
  const joinDisabled = evt.Status !== 'เปิดรับสมัคร' && !registered;

  container.innerHTML = `
    <div class="detail-hero" style="background-image:url('${escapeHtml(evt.Image || '')}')"></div>
    <div class="detail-grid">
      <div class="detail-main">
        <span class="category-badge">${escapeHtml(evt.Category)}</span>
        <h1>${escapeHtml(evt.EventName)}</h1>
        <div class="detail-info-list">
          <span>📅 ${formatDate(evt.Date)}</span>
          <span>🕒 ${evt.StartTime} - ${evt.EndTime} น.</span>
          <span>📍 ${escapeHtml(evt.Location)}</span>
          <span>🙋 ผู้จัดงาน: ${escapeHtml(organizer ? organizer.Name : 'ไม่ทราบชื่อ')}</span>
        </div>
        <div class="detail-desc">${escapeHtml(evt.Description)}</div>
      </div>
      <div class="detail-side">
        <div class="detail-price">${formatPrice(evt.Price)}</div>
        <span class="status-pill ${statusClass(evt.Status)}">${evt.Status}</span>
        <div class="detail-seats-bar"><div class="detail-seats-fill" style="width:${seatsPct}%"></div></div>
        <p class="muted">เหลือ ${seatsLeft} / ${evt.Capacity} ที่นั่ง</p>
        <button class="btn ${fav ? 'btn-secondary' : 'btn-ghost'} js-fav-detail" data-id="${evt.EventID}">${fav ? '❤️ บันทึกแล้ว' : '♡ บันทึกกิจกรรม'}</button>
        <button class="btn ${registered ? 'btn-secondary' : 'btn-primary'} js-join-detail" data-id="${evt.EventID}" ${joinDisabled ? 'disabled' : ''}>
          ${registered ? '✓ ลงทะเบียนแล้ว' : 'เข้าร่วมกิจกรรม'}
        </button>
        ${registered ? `<button class="btn btn-ghost js-cancel-detail" data-id="${evt.EventID}">ยกเลิกการลงทะเบียน</button>` : ''}
      </div>
    </div>
  `;

  container.querySelector('.js-fav-detail').addEventListener('click', () => {
    toggleFavorite(user.UserID, evt.EventID);
    renderDetailPage(eventId, user);
  });
  const joinBtn = container.querySelector('.js-join-detail');
  if (joinBtn) joinBtn.addEventListener('click', () => registerForEvent(user, evt.EventID));
  const cancelBtn = container.querySelector('.js-cancel-detail');
  if (cancelBtn) cancelBtn.addEventListener('click', () => cancelRegistration(user, evt.EventID));
}

/* ---------------------- 11) REGISTRATION / FAVORITE LOGIC ---------------------- */
function toggleFavorite(userId, eventId) {
  const favs = dbGet(DB.FAVS);
  const idx = favs.findIndex(f => f.UserID === userId && f.EventID === eventId);
  if (idx >= 0) {
    favs.splice(idx, 1);
    dbSet(DB.FAVS, favs);
    showToast('นำออกจากรายการโปรดแล้ว');
  } else {
    favs.push({ FavoriteID: genId('fav'), UserID: userId, EventID: eventId });
    dbSet(DB.FAVS, favs);
    showToast('บันทึกกิจกรรมแล้ว', 'success');
  }
}

function registerForEvent(user, eventId) {
  const events = dbGet(DB.EVENTS);
  const evt = events.find(e => e.EventID === eventId);
  if (!evt) return;

  if (isRegistered(user.UserID, eventId)) {
    showToast('คุณลงทะเบียนกิจกรรมนี้แล้ว', 'error');
    return;
  }

  const currentCount = registeredCountForEvent(eventId);
  if (currentCount >= evt.Capacity) {
    evt.Status = 'เต็ม';
    dbSet(DB.EVENTS, events);
    showToast('กิจกรรมเต็มแล้ว', 'error');
    router();
    return;
  }

  const regs = dbGet(DB.REGS);
  regs.push({
    RegistrationID: genId('reg'),
    UserID: user.UserID,
    EventID: eventId,
    RegisterDate: new Date().toISOString().slice(0, 10),
    Status: 'Registered',
    CheckIn: false
  });
  dbSet(DB.REGS, regs);

  recalcEventStatus(evt);
  dbSet(DB.EVENTS, events);

  showToast('ลงทะเบียนสำเร็จ', 'success');
  router();
}

function cancelRegistration(user, eventId) {
  showConfirm('คุณต้องการยกเลิกการลงทะเบียนกิจกรรมนี้หรือไม่?', () => {
    const regs = dbGet(DB.REGS);
    const reg = regs.find(r => r.UserID === user.UserID && r.EventID === eventId && r.Status === 'Registered');
    if (reg) reg.Status = 'Cancelled';
    dbSet(DB.REGS, regs);

    const events = dbGet(DB.EVENTS);
    const evt = events.find(e => e.EventID === eventId);
    if (evt) { recalcEventStatus(evt); dbSet(DB.EVENTS, events); }

    showToast('ยกเลิกการลงทะเบียนแล้ว');
    router();
  });
}

/* ---------------------- 12) MY EVENTS PAGE ---------------------- */
function renderMyEventsPage(user) {
  const regs = dbGet(DB.REGS).filter(r => r.UserID === user.UserID);
  const events = dbGet(DB.EVENTS);
  const today = new Date().toISOString().slice(0, 10);

  const myEventCard = (reg) => {
    const evt = events.find(e => e.EventID === reg.EventID);
    if (!evt) return '';
    const cancelled = reg.Status === 'Cancelled';
    return `
    <div class="event-card">
      <div class="event-card-img" style="background-image:url('${escapeHtml(evt.Image || '')}')">
        <span class="category-badge">${escapeHtml(evt.Category)}</span>
      </div>
      <div class="event-card-body">
        <h3>${escapeHtml(evt.EventName)}</h3>
        <div class="event-meta">
          <span>📅 ${formatDate(evt.Date)} · ${evt.StartTime}-${evt.EndTime}</span>
          <span>📍 ${escapeHtml(evt.Location)}</span>
        </div>
        <span class="status-pill ${cancelled ? 'status-closed' : statusClass(evt.Status)}">${cancelled ? 'ยกเลิกแล้ว' : 'ลงทะเบียนแล้ว'}</span>
      </div>
      <div class="event-actions">
        <a href="#/event/${evt.EventID}" class="btn btn-secondary btn-sm">ดูรายละเอียด</a>
        ${!cancelled && evt.Date >= today ? `<button class="btn btn-danger btn-sm js-cancel-my" data-id="${evt.EventID}">ยกเลิก</button>` : ''}
      </div>
    </div>`;
  };

  const upcomingRegs = regs.filter(r => {
    const evt = events.find(e => e.EventID === r.EventID);
    return evt && r.Status === 'Registered' && evt.Date >= today;
  });
  const historyRegs = regs.filter(r => {
    const evt = events.find(e => e.EventID === r.EventID);
    return evt && (r.Status === 'Cancelled' || evt.Date < today);
  });

  const upcomingEl = document.getElementById('myevents-upcoming');
  const historyEl = document.getElementById('myevents-history');
  upcomingEl.innerHTML = upcomingRegs.map(myEventCard).join('');
  historyEl.innerHTML = historyRegs.map(myEventCard).join('');

  document.getElementById('myevents-empty').classList.toggle('hidden', regs.length > 0);

  [upcomingEl, historyEl].forEach(el => {
    el.querySelectorAll('.js-cancel-my').forEach(btn => {
      btn.addEventListener('click', () => cancelRegistration(user, btn.dataset.id));
    });
  });

  // Tabs
  const tabBtns = document.querySelectorAll('#page-myevents .tab-btn');
  tabBtns.forEach(btn => {
    btn.onclick = () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (btn.dataset.tab === 'upcoming') {
        upcomingEl.classList.remove('hidden');
        historyEl.classList.add('hidden');
      } else {
        upcomingEl.classList.add('hidden');
        historyEl.classList.remove('hidden');
      }
    };
  });
}

/* ---------------------- 13) PROFILE PAGE ---------------------- */
function renderProfilePage(user) {
  document.getElementById('profile-name').value = user.Name;
  document.getElementById('profile-email').value = user.Email;
  document.getElementById('profile-role').value = user.Role === 'Organizer' ? 'ผู้จัดกิจกรรม (Organizer)' : 'ผู้เข้าร่วมกิจกรรม (User)';

  const regs = dbGet(DB.REGS).filter(r => r.UserID === user.UserID && r.Status === 'Registered');
  const favs = dbGet(DB.FAVS).filter(f => f.UserID === user.UserID);
  document.getElementById('profile-events-count').textContent = regs.length;
  document.getElementById('profile-favs-count').textContent = favs.length;

  const events = dbGet(DB.EVENTS);
  const favEl = document.getElementById('profile-favorites');
  const favEvents = favs.map(f => events.find(e => e.EventID === f.EventID)).filter(Boolean);
  favEl.innerHTML = favEvents.map(e => eventCardHtml(e, user)).join('');
  attachEventCardHandlers(favEl, user);
  document.getElementById('profile-favorites-empty').classList.toggle('hidden', favEvents.length > 0);

  document.getElementById('profile-form').onsubmit = (e) => {
    e.preventDefault();
    const users = dbGet(DB.USERS);
    const u = users.find(x => x.UserID === user.UserID);
    u.Name = document.getElementById('profile-name').value.trim();
    dbSet(DB.USERS, users);
    showToast('บันทึกโปรไฟล์เรียบร้อย', 'success');
    renderHeader(u, 'profile');
  };
}

/* ---------------------- 14) ORGANIZER DASHBOARD ---------------------- */
function renderDashboardPage(user) {
  const allEvents = dbGet(DB.EVENTS).map(recalcEventStatus);
  dbSet(DB.EVENTS, allEvents);
  const myEvents = allEvents.filter(e => e.OrganizerID === user.UserID);
  const regs = dbGet(DB.REGS).filter(r => r.Status !== 'Cancelled');

  const totalRegistrants = myEvents.reduce((sum, e) => sum + regs.filter(r => r.EventID === e.EventID).length, 0);
  const openEvents = myEvents.filter(e => e.Status === 'เปิดรับสมัคร').length;
  const today = new Date().toISOString().slice(0, 10);
  const upcomingEvents = myEvents.filter(e => e.Date >= today && e.Status !== 'จบกิจกรรม').sort((a, b) => a.Date.localeCompare(b.Date));

  document.getElementById('stat-total-events').textContent = myEvents.length;
  document.getElementById('stat-total-registrants').textContent = totalRegistrants;
  document.getElementById('stat-open-events').textContent = openEvents;
  document.getElementById('stat-upcoming-events').textContent = upcomingEvents.length;

  const chart = document.getElementById('category-chart');
  const categoryCounts = CATEGORIES.map(category => ({ category, count: myEvents.filter(evt => evt.Category === category).length })).filter(item => item.count > 0);
  const maxCategoryCount = Math.max(...categoryCounts.map(item => item.count), 1);
  chart.innerHTML = categoryCounts.map(item => `<div class="bar-row"><span>${escapeHtml(item.category)}</span><div class="bar-track"><span style="width:${Math.round(item.count / maxCategoryCount * 100)}%"></span></div><strong>${item.count}</strong></div>`).join('') || '<p class="muted">ยังไม่มีข้อมูล</p>';

  document.getElementById('dashboard-upcoming').innerHTML = upcomingEvents.slice(0, 4).map(evt => `<a class="mini-list-item" href="#/event/${evt.EventID}"><span>${escapeHtml(evt.EventName)}</span><small>${formatDate(evt.Date)}</small></a>`).join('') || '<p class="muted">ยังไม่มีกิจกรรมที่กำลังจะมาถึง</p>';

  const tbody = document.getElementById('dashboard-table-body');
  document.getElementById('dashboard-empty').classList.toggle('hidden', myEvents.length > 0);

  tbody.innerHTML = myEvents.map(evt => {
    const count = regs.filter(r => r.EventID === evt.EventID).length;
    return `
    <tr>
      <td>${escapeHtml(evt.EventName)}</td>
      <td>${formatDate(evt.Date)}</td>
      <td>${count}</td>
      <td>${evt.Capacity}</td>
      <td><button class="status-pill ${statusClass(evt.Status)} js-toggle-event-status" data-id="${evt.EventID}" title="เปลี่ยนสถานะการรับสมัคร">${evt.Status}</button></td>
      <td>
        <div class="table-actions">
          <a class="btn btn-secondary btn-sm" href="#/edit-event/${evt.EventID}">แก้ไข</a>
          <a class="btn btn-secondary btn-sm" href="#/event/${evt.EventID}">ดูรายละเอียด</a>
          <a class="btn btn-secondary btn-sm" href="#/participants/${evt.EventID}">ดูรายชื่อ</a>
          <button class="btn btn-danger btn-sm js-delete-event" data-id="${evt.EventID}">ลบ</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.js-delete-event').forEach(btn => {
    btn.addEventListener('click', () => deleteEvent(btn.dataset.id));
  });
  tbody.querySelectorAll('.js-toggle-event-status').forEach(btn => {
    btn.addEventListener('click', () => toggleEventStatus(btn.dataset.id));
  });
}

function toggleEventStatus(eventId) {
  const user = getCurrentUser();
  const events = dbGet(DB.EVENTS);
  const evt = events.find(event => event.EventID === eventId && event.OrganizerID === user.UserID);
  if (!evt) return;
  if (evt.Status === 'จบกิจกรรม') {
    showToast('กิจกรรมที่จบแล้วไม่สามารถเปิดรับสมัครได้', 'error');
    return;
  }
  evt.Status = evt.Status === 'ปิดรับสมัคร' ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร';
  if (evt.Status === 'เปิดรับสมัคร') recalcEventStatus(evt);
  dbSet(DB.EVENTS, events);
  showToast(evt.Status === 'เปิดรับสมัคร' ? 'เปิดรับสมัครแล้ว' : 'ปิดรับสมัครแล้ว', 'success');
  renderDashboardPage(user);
}

function deleteEvent(eventId) {
  const user = getCurrentUser();
  const event = dbGet(DB.EVENTS).find(evt => evt.EventID === eventId);
  if (!user || user.Role !== 'Organizer' || !event || event.OrganizerID !== user.UserID) {
    showToast('คุณไม่มีสิทธิ์จัดการกิจกรรมนี้', 'error');
    return;
  }

  showConfirm('คุณต้องการลบกิจกรรมนี้หรือไม่?', () => {
    let events = dbGet(DB.EVENTS);
    events = events.filter(e => e.EventID !== eventId);
    dbSet(DB.EVENTS, events);

    let regs = dbGet(DB.REGS);
    regs = regs.filter(r => r.EventID !== eventId);
    dbSet(DB.REGS, regs);

    let favs = dbGet(DB.FAVS);
    favs = favs.filter(f => f.EventID !== eventId);
    dbSet(DB.FAVS, favs);

    showToast('ลบกิจกรรมเรียบร้อยแล้ว');
    router();
  });
}

/* ---------------------- 15) CREATE / EDIT EVENT FORM ---------------------- */
function renderEventFormPage(eventId) {
  const catSelect = document.getElementById('ef-category');
  catSelect.innerHTML = CATEGORIES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');

  const isEdit = Boolean(eventId);
  document.getElementById('eventform-title').textContent = isEdit ? 'แก้ไขกิจกรรม' : 'สร้างกิจกรรม';
  document.getElementById('ef-submit-btn').textContent = isEdit ? 'บันทึกการแก้ไข' : 'สร้างกิจกรรม';

  const form = document.getElementById('event-form');
  form.reset();
  document.getElementById('ef-id').value = '';

  if (isEdit) {
    const evt = dbGet(DB.EVENTS).find(e => e.EventID === eventId);
    const user = getCurrentUser();
    if (!evt || !user || evt.OrganizerID !== user.UserID) {
      showToast('ไม่พบกิจกรรมหรือคุณไม่มีสิทธิ์แก้ไข', 'error');
      navigate('/dashboard');
      return;
    }
    document.getElementById('ef-id').value = evt.EventID;
    document.getElementById('ef-image').value = evt.Image || '';
    document.getElementById('ef-name').value = evt.EventName;
    document.getElementById('ef-category').value = evt.Category;
    document.getElementById('ef-description').value = evt.Description;
    document.getElementById('ef-date').value = evt.Date;
    document.getElementById('ef-starttime').value = evt.StartTime;
    document.getElementById('ef-endtime').value = evt.EndTime;
    document.getElementById('ef-location').value = evt.Location;
    document.getElementById('ef-price').value = evt.Price;
    document.getElementById('ef-capacity').value = evt.Capacity;
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    const events = dbGet(DB.EVENTS);
    const id = document.getElementById('ef-id').value;

    const data = {
      EventName: document.getElementById('ef-name').value.trim(),
      Image: document.getElementById('ef-image').value.trim(),
      Category: document.getElementById('ef-category').value,
      Description: document.getElementById('ef-description').value.trim(),
      Date: document.getElementById('ef-date').value,
      StartTime: document.getElementById('ef-starttime').value,
      EndTime: document.getElementById('ef-endtime').value,
      Location: document.getElementById('ef-location').value.trim(),
      Price: Number(document.getElementById('ef-price').value),
      Capacity: Number(document.getElementById('ef-capacity').value)
    };

    if (id) {
      const evt = events.find(x => x.EventID === id);
      if (!evt || evt.OrganizerID !== user.UserID) {
        showToast('คุณไม่มีสิทธิ์แก้ไขกิจกรรมนี้', 'error');
        navigate('/dashboard');
        return;
      }
      Object.assign(evt, data);
      recalcEventStatus(evt);
      dbSet(DB.EVENTS, events);
      showToast('แก้ไขกิจกรรมเรียบร้อยแล้ว', 'success');
    } else {
      events.push({
        EventID: genId('ev'),
        OrganizerID: user.UserID,
        Status: 'เปิดรับสมัคร',
        ...data
      });
      dbSet(DB.EVENTS, events);
      showToast('สร้างกิจกรรมสำเร็จ', 'success');
    }
    navigate('/dashboard');
  };
}

/* ---------------------- 16) PARTICIPANTS PAGE ---------------------- */
function renderParticipantsPage(eventId) {
  const evt = dbGet(DB.EVENTS).find(e => e.EventID === eventId);
  const user = getCurrentUser();
  if (!evt || !user || evt.OrganizerID !== user.UserID) {
    showToast('ไม่พบกิจกรรมหรือคุณไม่มีสิทธิ์ดูรายชื่อ', 'error');
    navigate('/dashboard');
    return;
  }
  document.getElementById('participants-title').textContent = evt ? `รายชื่อผู้เข้าร่วม — ${evt.EventName}` : 'รายชื่อผู้เข้าร่วม';

  const regs = dbGet(DB.REGS).filter(r => r.EventID === eventId && r.Status !== 'Cancelled');
  const users = dbGet(DB.USERS);
  const tbody = document.getElementById('participants-table-body');

  document.getElementById('participants-empty').classList.toggle('hidden', regs.length > 0);

  const renderRows = () => {
    const query = document.getElementById('participants-search').value.trim().toLowerCase();
    tbody.innerHTML = regs.filter(reg => {
      const participant = users.find(item => item.UserID === reg.UserID);
      return !query || (participant && `${participant.Name} ${participant.Email}`.toLowerCase().includes(query));
    }).map(reg => {
      const u = users.find(x => x.UserID === reg.UserID);
      return `
    <tr>
      <td>${escapeHtml(u ? u.Name : 'ไม่ทราบชื่อ')}</td>
      <td>${escapeHtml(u ? u.Email : '-')}</td>
      <td>${formatDate(reg.RegisterDate)}</td>
      <td><button class="btn btn-sm ${reg.CheckIn ? 'btn-primary' : 'btn-secondary'} js-toggle-checkin" data-id="${reg.RegistrationID}">${reg.CheckIn ? 'เช็คอินแล้ว' : 'ยังไม่เช็คอิน'}</button></td>
      <td><select class="participant-status js-participant-status" data-id="${reg.RegistrationID}"><option value="Registered" ${reg.Status === 'Registered' ? 'selected' : ''}>ลงทะเบียนแล้ว</option><option value="Attended" ${reg.Status === 'Attended' ? 'selected' : ''}>เข้าร่วมแล้ว</option><option value="No-show" ${reg.Status === 'No-show' ? 'selected' : ''}>ไม่มาเข้าร่วม</option></select></td>
      <td><button class="btn btn-secondary btn-sm js-participant-detail" data-id="${reg.UserID}">ดูรายละเอียด</button></td>
    </tr>`;
    }).join('');
    tbody.querySelectorAll('.js-toggle-checkin').forEach(button => button.addEventListener('click', () => {
      const allRegs = dbGet(DB.REGS);
      const reg = allRegs.find(item => item.RegistrationID === button.dataset.id);
      if (reg) reg.CheckIn = !reg.CheckIn;
      dbSet(DB.REGS, allRegs);
      renderRows();
    }));
    tbody.querySelectorAll('.js-participant-status').forEach(select => select.addEventListener('change', () => {
      const allRegs = dbGet(DB.REGS);
      const reg = allRegs.find(item => item.RegistrationID === select.dataset.id);
      if (reg) reg.Status = select.value;
      dbSet(DB.REGS, allRegs);
      showToast('อัปเดตสถานะผู้สมัครแล้ว', 'success');
    }));
    tbody.querySelectorAll('.js-participant-detail').forEach(button => button.addEventListener('click', () => {
      const participant = users.find(item => item.UserID === button.dataset.id);
      if (participant) showToast(`${participant.Name} · ${participant.Email}`);
    }));
  };
  renderRows();
  document.getElementById('participants-search').oninput = renderRows;
  document.getElementById('export-participants').onclick = () => downloadCsv(`participants-${eventId}.csv`, [['ชื่อ', 'Email', 'วันที่สมัคร', 'Check-in', 'สถานะ'], ...regs.map(reg => {
    const participant = users.find(item => item.UserID === reg.UserID);
    return [participant ? participant.Name : '', participant ? participant.Email : '', reg.RegisterDate, reg.CheckIn ? 'เช็คอินแล้ว' : 'ยังไม่เช็คอิน', reg.Status];
  })]);
}

function downloadCsv(filename, rows) {
  const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderUsersPage() {
  const tbody = document.getElementById('users-table-body');
  const renderRows = () => {
    const query = document.getElementById('users-search').value.trim().toLowerCase();
    const role = document.getElementById('users-role-filter').value;
    tbody.innerHTML = dbGet(DB.USERS).filter(user => (!role || user.Role === role) && (!query || `${user.Name} ${user.Email}`.toLowerCase().includes(query))).map(user => `
      <tr><td>${escapeHtml(user.Name)}</td><td>${escapeHtml(user.Email)}</td><td><select class="user-role" data-id="${user.UserID}"><option value="User" ${user.Role === 'User' ? 'selected' : ''}>User</option><option value="Organizer" ${user.Role === 'Organizer' ? 'selected' : ''}>Admin / Organizer</option></select></td><td><span class="status-pill ${user.Active === false ? 'status-closed' : 'status-open'}">${user.Active === false ? 'ปิดใช้งาน' : 'ใช้งานอยู่'}</span></td><td><button class="btn btn-sm ${user.Active === false ? 'btn-primary' : 'btn-danger'} js-toggle-user" data-id="${user.UserID}">${user.Active === false ? 'เปิดบัญชี' : 'ปิดบัญชี'}</button></td></tr>`).join('');
    tbody.querySelectorAll('.user-role').forEach(select => select.addEventListener('change', () => {
      const users = dbGet(DB.USERS); const target = users.find(user => user.UserID === select.dataset.id);
      if (target) target.Role = select.value; dbSet(DB.USERS, users); showToast('อัปเดตสิทธิ์แล้ว', 'success');
    }));
    tbody.querySelectorAll('.js-toggle-user').forEach(button => button.addEventListener('click', () => {
      const users = dbGet(DB.USERS); const target = users.find(user => user.UserID === button.dataset.id);
      if (target) target.Active = target.Active === false; dbSet(DB.USERS, users); renderRows();
    }));
  };
  renderRows();
  document.getElementById('users-search').oninput = renderRows;
  document.getElementById('users-role-filter').onchange = renderRows;
}

function renderReportsPage() {
  const events = dbGet(DB.EVENTS); const regs = dbGet(DB.REGS);
  document.getElementById('report-events').textContent = events.length;
  document.getElementById('report-applicants').textContent = regs.filter(reg => reg.Status !== 'Cancelled').length;
  document.getElementById('report-attendees').textContent = regs.filter(reg => reg.Status === 'Attended').length;
  document.getElementById('report-event-list').innerHTML = events.sort((a, b) => registeredCountForEvent(b.EventID) - registeredCountForEvent(a.EventID)).map(event => `<div class="report-row"><div><strong>${escapeHtml(event.EventName)}</strong><small>${formatDate(event.Date)} · ${escapeHtml(event.Category)}</small></div><span>${registeredCountForEvent(event.EventID)} / ${event.Capacity} ผู้สมัคร</span></div>`).join('');
  document.getElementById('export-report').onclick = () => downloadCsv('eventhub-report.csv', [['กิจกรรม', 'วันที่', 'ผู้สมัคร', 'เข้าร่วมแล้ว', 'ความจุ'], ...events.map(event => [event.EventName, event.Date, registeredCountForEvent(event.EventID), regs.filter(reg => reg.EventID === event.EventID && reg.Status === 'Attended').length, event.Capacity])]);
}

function renderSettingsPage() {
  const settings = dbGet(DB.SETTINGS) || {};
  document.getElementById('setting-site-name').value = settings.siteName || 'EventHub';
  document.getElementById('setting-site-description').value = settings.siteDescription || '';
  document.getElementById('setting-registration-enabled').checked = settings.registrationEnabled !== false;
  document.getElementById('settings-form').onsubmit = event => {
    event.preventDefault();
    dbSet(DB.SETTINGS, { siteName: document.getElementById('setting-site-name').value.trim(), siteDescription: document.getElementById('setting-site-description').value.trim(), registrationEnabled: document.getElementById('setting-registration-enabled').checked });
    showToast('บันทึกการตั้งค่าแล้ว', 'success');
  };
}

/* ---------------------- 17) INIT / EVENT BINDINGS ---------------------- */
function bindStaticEvents() {
  // Auth tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isLogin = tab.dataset.tab === 'login';
      document.getElementById('login-form').classList.toggle('hidden', !isLogin);
      document.getElementById('register-form').classList.toggle('hidden', isLogin);
    });
  });

  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-nav').classList.toggle('hidden');
  });

  // ปิดเมนูมือถือทุกครั้งที่มีการนำทาง
  window.addEventListener('hashchange', () => {
    document.getElementById('mobile-nav').classList.add('hidden');
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initDB();
  bindStaticEvents();
  window.addEventListener('hashchange', router);
  router();
});
