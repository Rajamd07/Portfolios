/* ============================================================
   COMPONENTS.JS — Dynamic Component Rendering for All Pages
   ============================================================ */

/* ==================== HOME PAGE ==================== */
function initHomePage() {
  const data = getMergedData();
  if (!data) return;

  // Greeting
  const greetEl = document.getElementById('greetingText');
  if (greetEl) greetEl.textContent = getGreeting();

  // Hero info
  setText('heroName', data.personalInfo.name);
  setText('heroDesignation', data.personalInfo.designation);
  setText('heroTagline', data.personalInfo.tagline);

  const instEl = document.getElementById('heroInstitution');
  if (instEl) instEl.innerHTML = `<i class="bi bi-geo-alt"></i> ${data.personalInfo.institution.split(',').slice(-2).join(',').trim()}`;

  // Hero stats
  const statsEl = document.getElementById('heroStats');
  if (statsEl) {
    const m = data.researchMetrics;
    statsEl.innerHTML = `
      <div class="hero-stat-item">
        <div class="hero-stat-value counter-animate" data-target="${m.publications.value}">0</div>
        <div class="hero-stat-label">Publications</div>
      </div>
      <div class="hero-stat-item">
        <div class="hero-stat-value counter-animate" data-target="${m.citations.value}">0</div>
        <div class="hero-stat-label">Citations</div>
      </div>
      <div class="hero-stat-item">
        <div class="hero-stat-value counter-animate" data-target="${m.hIndex.value}">0</div>
        <div class="hero-stat-label">h-index</div>
      </div>
    `;
    if (typeof reinitCounters === 'function') reinitCounters();
  }

  // Professional Background
  setText('aboutText', data.professionalBackground);

  // Research Interests
  const interestsGrid = document.getElementById('interestsGrid');
  if (interestsGrid) {
    const icons = ['bi-cpu', 'bi-shield-check', 'bi-diagram-3', 'bi-graph-up-arrow', 'bi-bar-chart-steps'];
    interestsGrid.innerHTML = data.researchInterests.map((interest, i) => `
      <div class="col-lg-4 col-md-6">
        <div class="glass-card hover-lift" style="text-align:center;padding:2rem;">
          <div style="width:56px;height:56px;border-radius:var(--radius-md);background:rgba(0,240,255,0.08);border:1px solid rgba(0,240,255,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:1.5rem;color:var(--cyan);">
            <i class="bi ${icons[i % icons.length]}"></i>
          </div>
          <h4 style="font-size:1rem;margin-bottom:0.3rem;">${interest}</h4>
          <span class="tag" style="font-size:0.65rem;">Focus Area ${i + 1}</span>
        </div>
      </div>
    `).join('');
  }

  // Journal Marquee
  renderMarquee(data);

  // Key Publications (highlighted)
  const keyPubs = document.getElementById('keyPubsList');
  if (keyPubs) {
    const highlighted = data.journalArticles.filter(a => a.highlighted);
    keyPubs.innerHTML = highlighted.map(pub => `
      <div class="col-lg-4 col-md-6 reveal">
        <div class="glass-card pub-card highlighted hover-lift" style="height:100%;">
          <div class="pub-year">${pub.year}</div>
          <div class="pub-title">${pub.title}</div>
          <div class="pub-authors">${pub.authors}</div>
          <div class="pub-journal">${pub.journal} ${pub.volume ? ', ' + pub.volume : ''}</div>
          ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank" class="pub-doi"><i class="bi bi-box-arrow-up-right"></i> DOI</a>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Feedbacks
  renderFeedbacks();

  if (typeof reinitScrollReveal === 'function') reinitScrollReveal();
}

/* ==================== RESEARCH PAGE ==================== */
function initResearchPage() {
  const data = getMergedData();
  if (!data) return;

  // Metrics
  const metricsGrid = document.getElementById('metricsGrid');
  if (metricsGrid) {
    const m = data.researchMetrics;
    const metrics = [
      { ...m.publications, icon: 'bi-journal-richtext' },
      { ...m.citations, icon: 'bi-chat-quote' },
      { ...m.hIndex, icon: 'bi-graph-up' },
      { ...m.i10Index, icon: 'bi-trophy' },
    ];
    metricsGrid.innerHTML = metrics.map(met => `
      <div class="col-lg-3 col-md-6">
        <div class="glass-card metric-card hover-lift">
          <div class="metric-icon"><i class="bi ${met.icon}"></i></div>
          <div class="metric-value counter-animate" data-target="${met.value}">0</div>
          <div class="metric-label">${met.label}</div>
          <div class="metric-source">Source: ${met.source}</div>
        </div>
      </div>
    `).join('');
    if (typeof reinitCounters === 'function') reinitCounters();
  }

  // Marquee
  renderMarquee(data);

  // Journal Articles
  renderArticles(data.journalArticles, 'all');

  // Book Chapters
  const bookList = document.getElementById('bookChaptersList');
  if (bookList) {
    bookList.innerHTML = data.bookChapters.map(ch => `
      <div class="col-12 reveal">
        <div class="glass-card pub-card hover-lift">
          <div class="pub-year">${ch.year}</div>
          <div class="pub-title">${ch.title}</div>
          <div class="pub-authors">${ch.authors}</div>
          <div class="pub-journal">${ch.source}, ${ch.volume}, pp. ${ch.pages}</div>
          ${ch.doi ? `<a href="https://doi.org/${ch.doi}" target="_blank" class="pub-doi"><i class="bi bi-box-arrow-up-right"></i> DOI</a>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Conference Timeline
  const confTimeline = document.getElementById('conferenceTimeline');
  if (confTimeline) {
    confTimeline.innerHTML = data.conferences.map(c => `
      <div class="timeline-item reveal">
        <div class="timeline-dot"></div>
        <div class="timeline-period">${c.date}</div>
        <div class="timeline-title">${c.title}</div>
        <div class="timeline-subtitle">${c.conference}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);"><i class="bi bi-geo-alt"></i> ${c.location}</div>
        <div style="margin-top:0.3rem;"><span class="tag" style="font-size:0.65rem;">${c.authors}</span></div>
      </div>
    `).join('');
  }

  if (typeof reinitScrollReveal === 'function') reinitScrollReveal();
}

function renderArticles(articles, filter) {
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;
  const filtered = filter === 'all' ? articles : articles.filter(a => String(a.year) === filter);
  grid.innerHTML = filtered.map(pub => `
    <div class="col-12 reveal pub-item" data-year="${pub.year}">
      <div class="glass-card pub-card ${pub.highlighted ? 'highlighted' : ''} hover-lift">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <div class="pub-year">${pub.year}</div>
            <div class="pub-title">${pub.title}</div>
            <div class="pub-authors">${pub.authors}</div>
            <div class="pub-journal">${pub.journal}${pub.volume ? ', ' + pub.volume : ''}${pub.pages ? ', pp. ' + pub.pages : ''}</div>
          </div>
          ${pub.highlighted ? '<span class="tag-gold tag"><i class="bi bi-star-fill"></i> Featured</span>' : ''}
        </div>
        ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank" class="pub-doi"><i class="bi bi-box-arrow-up-right"></i> ${pub.doi}</a>` : ''}
      </div>
    </div>
  `).join('');

  if (typeof reinitScrollReveal === 'function') reinitScrollReveal();
}

// Publication filter
window.filterPubs = function (year, btn) {
  const data = getMergedData();
  if (!data) return;
  document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderArticles(data.journalArticles, year);
};

/* ==================== EDUCATION PAGE ==================== */
function initEducationPage() {
  const data = getMergedData();
  if (!data) return;

  // Education Timeline
  const eduTimeline = document.getElementById('educationTimeline');
  if (eduTimeline) {
    eduTimeline.innerHTML = data.education.map(ed => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-period">${ed.period}</div>
        <div class="timeline-title">${ed.degree}</div>
        <div class="timeline-subtitle">${ed.institution}</div>
        ${ed.achievement ? `<div class="timeline-badge"><i class="bi bi-award"></i> ${ed.achievement}</div>` : ''}
      </div>
    `).join('');
  }

  // Teaching Experience
  const teachGrid = document.getElementById('teachingGrid');
  if (teachGrid) {
    teachGrid.innerHTML = data.teachingExperience.map(te => `
      <div class="col-lg-6 reveal">
        <div class="glass-card hover-lift" style="height:100%;">
          <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
            <div>
              <h4 style="font-size:1rem;margin-bottom:0.2rem;">${te.institution}</h4>
              <span class="tag">${te.period}</span>
            </div>
            <span class="tag-purple tag">${te.role}</span>
          </div>
          <ul style="list-style:none;padding:0;margin:0;">
            ${te.courses.map(c => `
              <li style="padding:0.4rem 0;border-bottom:1px solid rgba(255,255,255,0.03);color:var(--text-secondary);font-size:0.9rem;">
                <i class="bi bi-book text-cyan me-2" style="font-size:0.8rem;"></i>${c}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  }

  // Teaching note
  const noteEl = document.getElementById('teachingNote');
  if (noteEl) noteEl.innerHTML = `<i class="bi bi-info-circle text-purple me-2"></i>${data.teachingNote}`;

  // Professional Experience
  const expCard = document.getElementById('experienceCard');
  if (expCard) {
    const exp = data.professionalExperience;
    expCard.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
        <div>
          <h3 style="font-size:1.3rem;">${exp.position}</h3>
          <p style="color:var(--text-secondary);margin-bottom:0.3rem;">${exp.lab}</p>
        </div>
        <span class="tag">${exp.period}</span>
      </div>
      <div class="glow-line" style="margin:1.5rem 0;"></div>
      <h5 style="font-size:0.9rem;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:1rem;">Research Activities</h5>
      ${exp.activities.map(act => `
        <div style="display:flex;gap:1rem;align-items:flex-start;margin-bottom:1.2rem;">
          <div style="width:10px;height:10px;min-width:10px;border-radius:50%;background:var(--cyan);margin-top:6px;"></div>
          <div>
            <div style="font-weight:600;color:var(--text-primary);margin-bottom:0.2rem;">${act.area}</div>
            <div style="font-size:0.9rem;color:var(--text-secondary);">${act.description}</div>
          </div>
        </div>
      `).join('')}
    `;
  }

  // Technical Skills
  const skillsContainer = document.getElementById('skillsContainer');
  if (skillsContainer) {
    skillsContainer.innerHTML = Object.entries(data.technicalSkills).map(([category, skills]) => `
      <div class="skill-category">
        <div class="skill-category-title">${category}</div>
        <div class="skill-tags">
          ${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  if (typeof reinitScrollReveal === 'function') reinitScrollReveal();
}

/* ==================== ACADEMICS PAGE ==================== */
function initAcademicsPage() {
  const data = getMergedData();
  if (!data) return;

  // Achievements
  const achGrid = document.getElementById('achievementsGrid');
  if (achGrid) {
    const achIcons = ['bi-award', 'bi-mortarboard', 'bi-star', 'bi-trophy'];
    achGrid.innerHTML = data.achievements.map((ach, i) => `
      <div class="col-lg-3 col-md-6">
        <div class="glass-card achievement-card hover-lift" style="height:100%;">
          <div class="achievement-icon"><i class="bi ${achIcons[i % achIcons.length]}"></i></div>
          <div class="achievement-title">${ach.title}</div>
          <div class="achievement-body">${ach.description}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.3rem;">${ach.awardingBody}</div>
          <div class="achievement-year">${ach.year}</div>
        </div>
      </div>
    `).join('');
  }

  // Mentorship
  const mentList = document.getElementById('mentorshipList');
  if (mentList) {
    mentList.innerHTML = data.mentorship.summary.map(item => `
      <div class="glass-card hover-lift" style="margin-bottom:1rem;display:flex;gap:1rem;align-items:flex-start;">
        <div style="width:10px;height:10px;min-width:10px;border-radius:50%;background:var(--purple);margin-top:6px;"></div>
        <p style="margin:0;color:var(--text-secondary);">${item}</p>
      </div>
    `).join('');
  }

  // Journal Reviews
  const jrList = document.getElementById('journalReviewList');
  if (jrList) {
    jrList.innerHTML = data.peerReview.journals.map(j => `
      <div class="glass-card review-card hover-lift" style="margin-bottom:0.8rem;">
        <div class="review-icon"><i class="bi bi-journal-bookmark"></i></div>
        <div>
          <div class="review-name">${j.name}</div>
          <div class="review-publisher">${j.publisher}</div>
        </div>
      </div>
    `).join('');
  }

  // Conference Reviews
  const crList = document.getElementById('confReviewList');
  if (crList) {
    crList.innerHTML = data.peerReview.conferences.map(c => `
      <div class="glass-card review-card hover-lift" style="margin-bottom:0.8rem;">
        <div class="review-icon" style="background:rgba(168,85,247,0.08);color:var(--purple);"><i class="bi bi-mic"></i></div>
        <div>
          <div class="review-name">${c}</div>
        </div>
      </div>
    `).join('');
  }

  // Organizing Activities
  const orgList = document.getElementById('organizingList');
  if (orgList) {
    orgList.innerHTML = data.otherActivities.organizing.map(a => `
      <div class="glass-card activity-card hover-lift" style="margin-bottom:0.8rem;">
        <div class="activity-dot"></div>
        <div>
          <div class="activity-role">${a.role}</div>
          <div class="activity-event">${a.event}</div>
          <div class="activity-venue"><i class="bi bi-geo-alt"></i> ${a.venue}</div>
        </div>
      </div>
    `).join('');
  }

  // Proposals
  const propList = document.getElementById('proposalList');
  if (propList) {
    propList.innerHTML = data.otherActivities.proposals.map(p => `
      <div class="glass-card hover-lift reveal" style="margin-bottom:0.8rem;">
        <div style="font-weight:600;color:var(--text-primary);margin-bottom:0.3rem;">${p.role}</div>
        <div style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:0.3rem;">${p.project}</div>
        <span class="tag-gold tag"><i class="bi bi-hourglass-split"></i> ${p.status}</span>
      </div>
    `).join('');
  }

  if (typeof reinitScrollReveal === 'function') reinitScrollReveal();
}

/* ==================== CONTACT PAGE ==================== */
function initContactPage() {
  const data = getMergedData();
  if (!data) return;

  // Office Address
  const addrEl = document.getElementById('officeAddress');
  if (addrEl) {
    const addr = data.contact.officeAddress;
    addrEl.innerHTML = Object.values(addr).map(l => `<div>${l}</div>`).join('');
  }

  // Social Profiles
  const socialList = document.getElementById('socialProfilesList');
  if (socialList) {
    socialList.innerHTML = data.socialProfiles.map(p => {
      const icon = getSocialIcon(p.icon);
      return `
        <a href="${p.url}" target="_blank" rel="noopener" class="glass-card hover-lift" style="display:flex;align-items:center;gap:1rem;padding:0.8rem 1.2rem;text-decoration:none;">
          <span style="font-size:1.3rem;color:var(--cyan);">${icon}</span>
          <span style="color:var(--text-secondary);">${p.name}</span>
          <i class="bi bi-arrow-up-right ms-auto" style="color:var(--text-muted);"></i>
        </a>
      `;
    }).join('');
  }
}

/* ==================== SHARED UTILITIES ==================== */

function renderMarquee(data) {
  const track = document.getElementById('marqueeTrack');
  if (!track || !data) return;
  const items = data.journalsFeatured;
  // Duplicate for seamless loop
  const content = [...items, ...items].map(j => `
    <span class="journal-marquee-item">${j} <span class="sep"></span></span>
  `).join('');
  track.innerHTML = content;
}

function renderFeedbacks() {
  const grid = document.getElementById('feedbackGrid');
  if (!grid) return;
  const feedbacks = getStoredData('feedbacks', []).filter(f => f.approved);
  // Show today's scheduled or all approved
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const scheduled = feedbacks.filter(f => f.scheduledDay === today);
  const toShow = scheduled.length > 0 ? scheduled : feedbacks.slice(0, 3);

  if (toShow.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center reveal">
        <div class="glass-card" style="padding:3rem;">
          <i class="bi bi-chat-heart" style="font-size:2.5rem;color:var(--text-muted);opacity:0.3;"></i>
          <p class="mt-2" style="color:var(--text-muted);">No testimonials yet. Be the first to leave one!</p>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = toShow.map(fb => `
    <div class="col-lg-4 col-md-6 reveal">
      <div class="glass-card feedback-card hover-lift" style="height:100%;">
        <div class="quote-icon"><i class="bi bi-quote"></i></div>
        <div class="feedback-text">"${fb.message}"</div>
        <div class="feedback-author">${fb.name}</div>
        <div class="feedback-role">${fb.role || ''}</div>
      </div>
    </div>
  `).join('');
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
