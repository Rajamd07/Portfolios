/* ============================================================
   ADMIN.JS — Admin Panel Logic
   ============================================================ */

let adminAuthenticated = false;

/* ---------- Authentication ---------- */
window.adminLogin = function () {
  const pwd = document.getElementById('adminPassword').value;
  const errEl = document.getElementById('loginError');

  // Check password from appsettings or default
  const correctPwd = APP_DATA ? APP_DATA.siteConfig.adminPassword : 'hasain@admin2026';

  if (pwd === correctPwd) {
    adminAuthenticated = true;
    sessionStorage.setItem('adminAuth', 'true');
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadAdminDashboard();
  } else {
    errEl.style.display = 'block';
    document.getElementById('adminPassword').style.borderColor = 'var(--magenta)';
    setTimeout(() => {
      errEl.style.display = 'none';
      document.getElementById('adminPassword').style.borderColor = '';
    }, 3000);
  }
};

window.adminLogout = function () {
  adminAuthenticated = false;
  sessionStorage.removeItem('adminAuth');
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminLogin').style.display = 'flex';
  document.getElementById('adminPassword').value = '';
};

// Auto-login if session is active
document.addEventListener('DOMContentLoaded', async () => {
  await loadAppData();
  if (sessionStorage.getItem('adminAuth') === 'true') {
    adminAuthenticated = true;
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadAdminDashboard();
  }

  // Enter key login
  const pwdInput = document.getElementById('adminPassword');
  if (pwdInput) {
    pwdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') adminLogin();
    });
  }
});

/* ---------- Dashboard Overview ---------- */
function loadAdminDashboard() {
  if (!APP_DATA) return;
  const data = getMergedData();

  // Stats
  const articles = data.journalArticles;
  const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  const queries = JSON.parse(localStorage.getItem('contactQueries') || '[]');

  setText('statArticles', articles.length);
  setText('statFeedbacks', feedbacks.length);
  setText('statBookings', bookings.length);
  setText('statQueries', queries.length);

  // Load current section data
  loadFeedbacksAdmin();
  loadArticlesAdmin();
  loadContentEditor();
  loadBookingsAdmin();
  loadQueriesAdmin();
}

/* ---------- Section Navigation ---------- */
window.showAdminSection = function (section) {
  const titles = {
    overview: 'Dashboard Overview',
    feedbacks: 'Feedback Management',
    articles: 'Articles Management',
    content: 'Edit Content',
    bookings: 'Consultation Bookings',
    queries: 'Contact Queries'
  };

  document.querySelectorAll('.admin-section').forEach(el => el.style.display = 'none');
  document.getElementById(`section-${section}`).style.display = 'block';
  document.getElementById('adminPageTitle').textContent = titles[section] || 'Admin';

  document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('active'));
  const navItem = document.getElementById(`nav-${section}`);
  if (navItem) navItem.classList.add('active');

  // Close sidebar on mobile
  const sidebar = document.getElementById('adminSidebar');
  if (window.innerWidth < 992) sidebar.classList.remove('open');
};

window.toggleAdminSidebar = function () {
  document.getElementById('adminSidebar').classList.toggle('open');
};

/* ---------- Feedback Management ---------- */
function loadFeedbacksAdmin() {
  const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
  renderFeedbackList(feedbacks, 'all');
}

function renderFeedbackList(feedbacks, filter) {
  const list = document.getElementById('adminFeedbackList');
  if (!list) return;

  let filtered = feedbacks;
  if (filter === 'pending') filtered = feedbacks.filter(f => !f.approved);
  if (filter === 'approved') filtered = feedbacks.filter(f => f.approved);

  if (filtered.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);padding:1rem;">No feedbacks found.</p>';
    return;
  }

  list.innerHTML = filtered.map(fb => `
    <div class="glass-card feedback-admin-item ${fb.approved ? 'approved' : 'pending'}" id="fb-${fb.id}">
      <div class="fb-header">
        <div>
          <div class="fb-author">${fb.name}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);">${fb.role || 'No role specified'}</div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="tag ${fb.approved ? '' : 'tag-gold'}" style="font-size:0.65rem;">
            ${fb.approved ? '✓ Approved' : '⏳ Pending'}
          </span>
          <span class="fb-date">${new Date(fb.date).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="fb-text">"${fb.message}"</div>
      ${fb.scheduledDay ? `<div style="font-size:0.8rem;color:var(--purple);margin-bottom:0.5rem;"><i class="bi bi-calendar3 me-1"></i>Scheduled: ${fb.scheduledDay}</div>` : ''}
      <div class="fb-actions">
        ${!fb.approved ? `<button class="btn-sm btn-approve" onclick="approveFeedback(${fb.id})"><i class="bi bi-check-lg"></i> Approve</button>` : ''}
        <button class="btn-sm btn-reject" onclick="removeFeedback(${fb.id})"><i class="bi bi-trash"></i> Remove</button>
        <button class="btn-sm btn-schedule" onclick="scheduleFeedback(${fb.id})"><i class="bi bi-calendar3"></i> Schedule</button>
      </div>
    </div>
  `).join('');
}

window.filterFeedbackAdmin = function (filter, btn) {
  document.querySelectorAll('#section-feedbacks .tag').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
  renderFeedbackList(feedbacks, filter);
};

window.approveFeedback = function (id) {
  const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
  const fb = feedbacks.find(f => f.id === id);
  if (fb) {
    fb.approved = true;
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    loadFeedbacksAdmin();
    showToast('Feedback approved successfully!');
  }
};

window.removeFeedback = function (id) {
  if (!confirm('Are you sure you want to remove this feedback?')) return;
  let feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
  feedbacks = feedbacks.filter(f => f.id !== id);
  localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
  loadFeedbacksAdmin();
  loadAdminDashboard();
  showToast('Feedback removed.');
};

window.scheduleFeedback = function (id) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const day = prompt('Schedule this feedback for which day?\n\nOptions: ' + days.join(', '));
  if (!day || !days.includes(day)) {
    if (day !== null) alert('Invalid day. Please enter a valid day name.');
    return;
  }
  const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
  const fb = feedbacks.find(f => f.id === id);
  if (fb) {
    fb.scheduledDay = day;
    fb.approved = true;
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    loadFeedbacksAdmin();
    showToast(`Feedback scheduled for ${day}.`);
  }
};

/* ---------- Articles Management ---------- */
function loadArticlesAdmin() {
  const data = getMergedData();
  if (!data) return;

  const tbody = document.getElementById('adminArticlesBody');
  if (!tbody) return;

  tbody.innerHTML = data.journalArticles.map((art, i) => `
    <tr>
      <td>${i + 1}</td>
      <td style="max-width:300px;">${art.title.substring(0, 60)}${art.title.length > 60 ? '...' : ''}</td>
      <td>${art.journal}</td>
      <td>${art.year}</td>
      <td>${art.highlighted ? '<span class="tag-gold tag" style="font-size:0.6rem;">Featured</span>' : '-'}</td>
      <td>
        <button class="btn-sm btn-approve" onclick="editArticle(${art.id})" style="margin-right:0.3rem;"><i class="bi bi-pencil"></i></button>
        <button class="btn-sm btn-reject" onclick="deleteArticle(${art.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

let editingArticleId = null;

window.showAddArticleModal = function () {
  editingArticleId = null;
  document.getElementById('articleModalTitle').textContent = 'Add New Article';
  document.getElementById('articleForm').reset();
  document.getElementById('articleModal').classList.add('show');
};

window.closeArticleModal = function () {
  document.getElementById('articleModal').classList.remove('show');
  editingArticleId = null;
};

window.editArticle = function (id) {
  const data = getMergedData();
  const art = data.journalArticles.find(a => a.id === id);
  if (!art) return;

  editingArticleId = id;
  document.getElementById('articleModalTitle').textContent = 'Edit Article';
  document.getElementById('artTitle').value = art.title;
  document.getElementById('artAuthors').value = art.authors;
  document.getElementById('artJournal').value = art.journal;
  document.getElementById('artYear').value = art.year;
  document.getElementById('artVolume').value = art.volume || '';
  document.getElementById('artPages').value = art.pages || '';
  document.getElementById('artDoi').value = art.doi || '';
  document.getElementById('artHighlighted').checked = art.highlighted;
  document.getElementById('articleModal').classList.add('show');
};

window.saveArticle = function (e) {
  e.preventDefault();
  const data = getMergedData();
  let articles = [...data.journalArticles];

  const articleData = {
    id: editingArticleId || Date.now(),
    title: document.getElementById('artTitle').value.trim(),
    authors: document.getElementById('artAuthors').value.trim(),
    journal: document.getElementById('artJournal').value.trim(),
    year: parseInt(document.getElementById('artYear').value),
    volume: document.getElementById('artVolume').value.trim(),
    pages: document.getElementById('artPages').value.trim(),
    doi: document.getElementById('artDoi').value.trim(),
    highlighted: document.getElementById('artHighlighted').checked
  };

  if (editingArticleId) {
    const idx = articles.findIndex(a => a.id === editingArticleId);
    if (idx >= 0) articles[idx] = articleData;
  } else {
    articles.unshift(articleData);
  }

  // Save to localStorage overrides
  const overrides = JSON.parse(localStorage.getItem('contentOverrides') || '{}');
  overrides.journalArticles = articles;
  localStorage.setItem('contentOverrides', JSON.stringify(overrides));

  closeArticleModal();
  loadArticlesAdmin();
  loadAdminDashboard();
  showToast(editingArticleId ? 'Article updated!' : 'Article added!');
};

window.deleteArticle = function (id) {
  if (!confirm('Are you sure you want to delete this article?')) return;
  const data = getMergedData();
  const articles = data.journalArticles.filter(a => a.id !== id);
  const overrides = JSON.parse(localStorage.getItem('contentOverrides') || '{}');
  overrides.journalArticles = articles;
  localStorage.setItem('contentOverrides', JSON.stringify(overrides));
  loadArticlesAdmin();
  loadAdminDashboard();
  showToast('Article deleted.');
};

/* ---------- Content Editor ---------- */
function loadContentEditor() {
  const data = getMergedData();
  if (!data) return;

  const nameEl = document.getElementById('editName');
  const desigEl = document.getElementById('editDesignation');
  const tagEl = document.getElementById('editTagline');
  const bgEl = document.getElementById('editBackground');

  if (nameEl) nameEl.value = data.personalInfo.name;
  if (desigEl) desigEl.value = data.personalInfo.designation;
  if (tagEl) tagEl.value = data.personalInfo.tagline;
  if (bgEl) bgEl.value = data.professionalBackground;

  // Research interests
  const interestsList = document.getElementById('editInterestsList');
  if (interestsList) {
    interestsList.innerHTML = data.researchInterests.map((interest, i) => `
      <div class="d-flex align-items-center gap-2 mb-2" id="interest-${i}">
        <input type="text" class="form-control interest-input" value="${interest}" style="flex:1;">
        <button class="btn-sm btn-reject" onclick="removeInterest(${i})"><i class="bi bi-x-lg"></i></button>
      </div>
    `).join('');
  }
}

window.saveContentChanges = function () {
  const overrides = JSON.parse(localStorage.getItem('contentOverrides') || '{}');
  overrides.personalInfo = {
    ...overrides.personalInfo,
    name: document.getElementById('editName').value.trim(),
    designation: document.getElementById('editDesignation').value.trim(),
    tagline: document.getElementById('editTagline').value.trim()
  };
  overrides.professionalBackground = document.getElementById('editBackground').value.trim();
  localStorage.setItem('contentOverrides', JSON.stringify(overrides));
  showToast('Content updated successfully!');
};

window.addInterest = function () {
  const input = document.getElementById('newInterest');
  const val = input.value.trim();
  if (!val) return;

  const data = getMergedData();
  const interests = [...data.researchInterests, val];
  const overrides = JSON.parse(localStorage.getItem('contentOverrides') || '{}');
  overrides.researchInterests = interests;
  localStorage.setItem('contentOverrides', JSON.stringify(overrides));
  input.value = '';
  loadContentEditor();
  showToast('Interest added!');
};

window.removeInterest = function (index) {
  const data = getMergedData();
  const interests = data.researchInterests.filter((_, i) => i !== index);
  const overrides = JSON.parse(localStorage.getItem('contentOverrides') || '{}');
  overrides.researchInterests = interests;
  localStorage.setItem('contentOverrides', JSON.stringify(overrides));
  loadContentEditor();
};

window.saveInterests = function () {
  const inputs = document.querySelectorAll('.interest-input');
  const interests = Array.from(inputs).map(i => i.value.trim()).filter(Boolean);
  const overrides = JSON.parse(localStorage.getItem('contentOverrides') || '{}');
  overrides.researchInterests = interests;
  localStorage.setItem('contentOverrides', JSON.stringify(overrides));
  showToast('Research interests saved!');
};

/* ---------- Bookings ---------- */
function loadBookingsAdmin() {
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  const tbody = document.getElementById('adminBookingsBody');
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="color:var(--text-muted);text-align:center;">No bookings yet.</td></tr>';
    return;
  }

  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>${b.name}</td>
      <td>${b.email}</td>
      <td>${b.day}</td>
      <td>${b.slot}</td>
      <td>${b.topic}</td>
      <td>${new Date(b.date).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

/* ---------- Queries ---------- */
function loadQueriesAdmin() {
  const queries = JSON.parse(localStorage.getItem('contactQueries') || '[]');
  const tbody = document.getElementById('adminQueriesBody');
  if (!tbody) return;

  if (queries.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="color:var(--text-muted);text-align:center;">No queries yet.</td></tr>';
    return;
  }

  tbody.innerHTML = queries.map(q => `
    <tr>
      <td>${q.name}</td>
      <td>${q.email}</td>
      <td>${q.subject}</td>
      <td><span class="tag" style="font-size:0.65rem;">${q.category}</span></td>
      <td>${new Date(q.date).toLocaleDateString()}</td>
      <td>
        <button class="btn-sm btn-approve" onclick="viewQuery(${q.id})"><i class="bi bi-eye"></i></button>
        <button class="btn-sm btn-reject" onclick="deleteQuery(${q.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

window.viewQuery = function (id) {
  const queries = JSON.parse(localStorage.getItem('contactQueries') || '[]');
  const q = queries.find(x => x.id === id);
  if (!q) return;

  const content = document.getElementById('queryModalContent');
  content.innerHTML = `
    <div class="mb-2"><strong>From:</strong> ${q.name} (${q.email})</div>
    <div class="mb-2"><strong>Subject:</strong> ${q.subject}</div>
    <div class="mb-2"><strong>Category:</strong> <span class="tag" style="font-size:0.65rem;">${q.category}</span></div>
    <div class="mb-2"><strong>Date:</strong> ${new Date(q.date).toLocaleString()}</div>
    <div class="glow-line" style="margin:1rem 0;"></div>
    <div style="color:var(--text-secondary);line-height:1.8;">${q.message}</div>
    <div class="mt-3">
      <a href="mailto:${q.email}?subject=Re: ${encodeURIComponent(q.subject)}" class="btn-glow" style="font-size:0.8rem;padding:0.5rem 1rem;">
        <i class="bi bi-reply"></i> Reply via Email
      </a>
    </div>
  `;
  document.getElementById('queryModal').classList.add('show');
};

window.deleteQuery = function (id) {
  if (!confirm('Delete this query?')) return;
  let queries = JSON.parse(localStorage.getItem('contactQueries') || '[]');
  queries = queries.filter(q => q.id !== id);
  localStorage.setItem('contactQueries', JSON.stringify(queries));
  loadQueriesAdmin();
  loadAdminDashboard();
  showToast('Query deleted.');
};

/* ---------- Toast Notification ---------- */
function showToast(msg, type = 'success') {
  const toast = document.getElementById('adminToast');
  if (!toast) return;
  toast.querySelector('#toastMsg').textContent = msg;
  toast.className = `toast-notification ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
