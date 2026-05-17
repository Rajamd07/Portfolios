/* ============================================================
   SEARCH.JS — Global Site Search
   ============================================================ */

function initSearchPage() {
  const input = document.getElementById('globalSearch');
  if (!input) return;

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => performSearch(input.value.trim()), 300);
  });

  // Check URL params
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    input.value = q;
    performSearch(q);
  }
}

function performSearch(query) {
  const resultsEl = document.getElementById('searchResults');
  const statusEl = document.getElementById('searchStatus');
  if (!resultsEl || !query || query.length < 2) {
    if (resultsEl) resultsEl.innerHTML = '';
    if (statusEl) statusEl.textContent = query && query.length < 2 ? 'Type at least 2 characters...' : '';
    return;
  }

  const data = getMergedData();
  if (!data) return;

  const results = [];
  const q = query.toLowerCase();

  // Search publications
  data.journalArticles.forEach(pub => {
    const searchText = `${pub.title} ${pub.authors} ${pub.journal}`.toLowerCase();
    if (searchText.includes(q)) {
      results.push({
        page: 'Research',
        link: '/research#articles',
        title: pub.title,
        snippet: `${pub.authors} — ${pub.journal}, ${pub.year}`,
        text: searchText
      });
    }
  });

  // Search book chapters
  data.bookChapters.forEach(ch => {
    const searchText = `${ch.title} ${ch.authors} ${ch.source}`.toLowerCase();
    if (searchText.includes(q)) {
      results.push({
        page: 'Book Chapters',
        link: '/research#bookChapters',
        title: ch.title,
        snippet: `${ch.authors} — ${ch.source}, ${ch.year}`,
        text: searchText
      });
    }
  });

  // Search conferences
  data.conferences.forEach(c => {
    const searchText = `${c.title} ${c.conference} ${c.location}`.toLowerCase();
    if (searchText.includes(q)) {
      results.push({
        page: 'Conferences',
        link: '/research#conferences',
        title: c.title,
        snippet: `${c.conference} — ${c.location}, ${c.year}`,
        text: searchText
      });
    }
  });

  // Search education
  data.education.forEach(ed => {
    const searchText = `${ed.degree} ${ed.institution}`.toLowerCase();
    if (searchText.includes(q)) {
      results.push({
        page: 'Education',
        link: '/education#educationSection',
        title: ed.degree,
        snippet: `${ed.institution} — ${ed.period}`,
        text: searchText
      });
    }
  });

  // Search skills
  Object.entries(data.technicalSkills).forEach(([cat, skills]) => {
    skills.forEach(skill => {
      if (skill.toLowerCase().includes(q) || cat.toLowerCase().includes(q)) {
        results.push({
          page: 'Skills',
          link: '/education#skillsSection',
          title: skill,
          snippet: `Category: ${cat}`,
          text: `${skill} ${cat}`.toLowerCase()
        });
      }
    });
  });

  // Search achievements
  data.achievements.forEach(ach => {
    const searchText = `${ach.title} ${ach.description} ${ach.awardingBody}`.toLowerCase();
    if (searchText.includes(q)) {
      results.push({
        page: 'Achievements',
        link: '/academics#achievementsSection',
        title: ach.title,
        snippet: `${ach.description} — ${ach.awardingBody}`,
        text: searchText
      });
    }
  });

  // Search research interests
  data.researchInterests.forEach(interest => {
    if (interest.toLowerCase().includes(q)) {
      results.push({
        page: 'Home',
        link: '/#interests',
        title: interest,
        snippet: 'Research Interest',
        text: interest.toLowerCase()
      });
    }
  });

  // Search professional background
  if (data.professionalBackground.toLowerCase().includes(q)) {
    results.push({
      page: 'Home',
      link: '/#about',
      title: 'Professional Background',
      snippet: highlightSnippet(data.professionalBackground, query, 120),
      text: data.professionalBackground.toLowerCase()
    });
  }

  // Search peer review
  data.peerReview.journals.forEach(j => {
    if (j.name.toLowerCase().includes(q)) {
      results.push({
        page: 'Peer Review',
        link: '/academics#peerReviewSection',
        title: j.name,
        snippet: `Journal Reviewer — ${j.publisher}`,
        text: j.name.toLowerCase()
      });
    }
  });

  // Display results
  statusEl.textContent = `${results.length} result${results.length !== 1 ? 's' : ''} found for "${query}"`;

  if (results.length === 0) {
    resultsEl.innerHTML = `
      <div class="text-center" style="padding:3rem;">
        <i class="bi bi-search" style="font-size:2.5rem;color:var(--text-muted);opacity:0.3;"></i>
        <p class="mt-2" style="color:var(--text-muted);">No results found. Try different keywords.</p>
      </div>
    `;
    return;
  }

  resultsEl.innerHTML = results.map(r => `
    <a href="${r.link}" class="glass-card search-result-item hover-lift" style="text-decoration:none;display:block;">
      <div class="result-page">${r.page}</div>
      <div class="result-title">${highlightMatch(r.title, query)}</div>
      <div class="result-snippet">${highlightMatch(r.snippet, query)}</div>
    </a>
  `).join('');

  if (typeof reinitScrollReveal === 'function') reinitScrollReveal();
}

function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function highlightSnippet(text, query, maxLen) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.substring(0, maxLen) + '...';
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + maxLen - 40);
  let snippet = text.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet += '...';
  return snippet;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
