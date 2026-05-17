/* ============================================================
   TOOLS.JS — PhD Checklist, Paper Evaluator, Booking System
   ============================================================ */

function initToolsPage() {
  const data = getMergedData();
  if (!data) return;

  initChecklist(data);
  initBooking(data);
}

/* ---------- PhD / MTech Checklist ---------- */
function initChecklist(data) {
  const container = document.getElementById('checklistContainer');
  if (!container || !data.phdChecklist) return;

  const saved = JSON.parse(localStorage.getItem('checklistState') || '{}');
  let totalItems = 0;
  let checkedItems = 0;

  container.innerHTML = data.phdChecklist.categories.map((cat, ci) => {
    const categoryIcons = ['bi-folder-check', 'bi-calendar-range', 'bi-pencil-square', 'bi-exclamation-triangle'];
    return `
      <div class="checklist-category">
        <div class="checklist-category-title">
          <i class="bi ${categoryIcons[ci % categoryIcons.length]} text-cyan"></i>
          ${cat.name}
        </div>
        ${cat.items.map((item, ii) => {
          const key = `${ci}-${ii}`;
          const isChecked = saved[key] || false;
          totalItems++;
          if (isChecked) checkedItems++;
          return `
            <div class="checklist-item ${isChecked ? 'checked' : ''}">
              <input type="checkbox" ${isChecked ? 'checked' : ''} 
                onchange="toggleChecklistItem('${key}', this)">
              <span class="checklist-text">${item}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }).join('');

  updateChecklistProgress(checkedItems, totalItems);
}

window.toggleChecklistItem = function (key, checkbox) {
  const saved = JSON.parse(localStorage.getItem('checklistState') || '{}');
  saved[key] = checkbox.checked;
  localStorage.setItem('checklistState', JSON.stringify(saved));

  const item = checkbox.closest('.checklist-item');
  item.classList.toggle('checked', checkbox.checked);

  // Recalculate progress
  const allBoxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
  const checked = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked');
  updateChecklistProgress(checked.length, allBoxes.length);
};

function updateChecklistProgress(checked, total) {
  const progressEl = document.getElementById('checklistProgress');
  const barEl = document.getElementById('checklistBar');
  if (progressEl) progressEl.textContent = `${checked} / ${total} completed`;
  if (barEl) barEl.style.width = total > 0 ? `${(checked / total * 100).toFixed(1)}%` : '0%';
}

/* ---------- Research Paper Evaluator ---------- */
window.evaluatePaper = function () {
  const abstract = document.getElementById('paperAbstract').value.trim();
  const resultEl = document.getElementById('evaluationResult');
  const btn = document.getElementById('evaluateBtn');

  if (!abstract || abstract.length < 50) {
    resultEl.style.display = 'block';
    resultEl.innerHTML = `
      <div class="glass-card" style="border-left:3px solid var(--magenta);">
        <p style="color:var(--magenta);margin:0;"><i class="bi bi-exclamation-triangle me-2"></i>Please enter a substantial abstract (at least 50 characters).</p>
      </div>
    `;
    return;
  }

  // Show loading state
  btn.disabled = true;
  btn.innerHTML = '<span class="loader-ring" style="width:20px;height:20px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:0.5rem;"></span> Analyzing...';

  // Simulate AI evaluation (client-side heuristic analysis)
  setTimeout(() => {
    const evaluation = analyzeAbstract(abstract);
    resultEl.style.display = 'block';
    resultEl.innerHTML = `
      <div class="glass-card" style="border-left:3px solid var(--cyan);">
        <h5 class="mb-3"><i class="bi bi-clipboard-data text-cyan me-2"></i>Evaluation Report</h5>
        
        <div class="row g-3 mb-3">
          <div class="col-4 text-center">
            <div style="font-family:var(--font-heading);font-size:2rem;font-weight:800;color:var(--cyan);">${evaluation.clarityScore}/10</div>
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Clarity</div>
          </div>
          <div class="col-4 text-center">
            <div style="font-family:var(--font-heading);font-size:2rem;font-weight:800;color:var(--purple);">${evaluation.structureScore}/10</div>
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Structure</div>
          </div>
          <div class="col-4 text-center">
            <div style="font-family:var(--font-heading);font-size:2rem;font-weight:800;color:var(--gold);">${evaluation.overallScore}/10</div>
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;">Overall</div>
          </div>
        </div>

        <h6 style="color:var(--cyan);font-size:0.85rem;margin-bottom:0.5rem;"><i class="bi bi-check-circle me-2"></i>Strengths</h6>
        <ul style="list-style:none;padding:0;margin-bottom:1rem;">
          ${evaluation.strengths.map(s => `<li style="padding:0.3rem 0;color:var(--text-secondary);font-size:0.9rem;">✓ ${s}</li>`).join('')}
        </ul>

        <h6 style="color:var(--magenta);font-size:0.85rem;margin-bottom:0.5rem;"><i class="bi bi-exclamation-circle me-2"></i>Areas for Improvement</h6>
        <ul style="list-style:none;padding:0;margin-bottom:1rem;">
          ${evaluation.improvements.map(s => `<li style="padding:0.3rem 0;color:var(--text-secondary);font-size:0.9rem;">⚠ ${s}</li>`).join('')}
        </ul>

        <h6 style="color:var(--purple);font-size:0.85rem;margin-bottom:0.5rem;"><i class="bi bi-lightbulb me-2"></i>Suggestions</h6>
        <ul style="list-style:none;padding:0;">
          ${evaluation.suggestions.map(s => `<li style="padding:0.3rem 0;color:var(--text-secondary);font-size:0.9rem;">💡 ${s}</li>`).join('')}
        </ul>
      </div>
    `;

    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-cpu"></i> Evaluate Abstract';
  }, 2000);
};

function analyzeAbstract(text) {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const avgSentLen = words / Math.max(sentences, 1);
  const hasMethodology = /method|approach|technique|framework|model|algorithm/i.test(text);
  const hasResults = /result|finding|outcome|show|demonstrate|reveal|indicate/i.test(text);
  const hasConclusion = /conclud|implicat|contribut|signific/i.test(text);
  const hasObjective = /aim|objective|purpose|goal|investigate|examine|study|analyze|explore/i.test(text);
  const hasKeywords = /data|analysis|research|study|experiment/i.test(text);

  let clarityScore = 5;
  let structureScore = 5;

  // Clarity
  if (avgSentLen < 25) clarityScore += 1;
  if (avgSentLen < 20) clarityScore += 1;
  if (avgSentLen > 35) clarityScore -= 2;
  if (words > 100 && words < 350) clarityScore += 1;
  if (hasKeywords) clarityScore += 1;
  clarityScore = Math.min(10, Math.max(1, clarityScore));

  // Structure
  if (hasObjective) structureScore += 1.5;
  if (hasMethodology) structureScore += 1.5;
  if (hasResults) structureScore += 1.5;
  if (hasConclusion) structureScore += 1;
  if (words < 50) structureScore -= 2;
  structureScore = Math.min(10, Math.max(1, Math.round(structureScore)));

  const overallScore = Math.round((clarityScore + structureScore) / 2);

  const strengths = [];
  const improvements = [];
  const suggestions = [];

  if (hasObjective) strengths.push('Clear research objective/aim identified');
  if (hasMethodology) strengths.push('Methodology or approach mentioned');
  if (hasResults) strengths.push('Results or findings discussed');
  if (hasConclusion) strengths.push('Conclusions or implications addressed');
  if (words >= 150 && words <= 300) strengths.push('Good abstract length (' + words + ' words)');
  if (avgSentLen < 25) strengths.push('Readable sentence structure');

  if (!hasObjective) improvements.push('Add a clear research objective or aim');
  if (!hasMethodology) improvements.push('Include the methodology or approach used');
  if (!hasResults) improvements.push('Mention key results or findings');
  if (!hasConclusion) improvements.push('Add implications or conclusions');
  if (words < 100) improvements.push('Abstract is too short (' + words + ' words). Aim for 150-300 words');
  if (words > 350) improvements.push('Abstract is too long (' + words + ' words). Aim for 150-300 words');
  if (avgSentLen > 30) improvements.push('Sentences are too long (avg ' + Math.round(avgSentLen) + ' words). Aim for under 25');

  suggestions.push('Consider structuring as: Background → Objective → Method → Results → Conclusion');
  if (!hasKeywords) suggestions.push('Include relevant keywords for discoverability');
  suggestions.push('Have a colleague review for clarity before submission');
  if (sentences < 4) suggestions.push('Expand with more detailed sentences covering each section');

  if (strengths.length === 0) strengths.push('Abstract submitted for evaluation');

  return { clarityScore, structureScore, overallScore, strengths, improvements, suggestions };
}

/* ---------- Consultation Booking ---------- */
function initBooking(data) {
  const daySelector = document.getElementById('daySelector');
  const slotGrid = document.getElementById('slotGrid');
  if (!daySelector || !slotGrid || !data.consultationSlots) return;

  const slots = data.consultationSlots;
  let selectedDay = null;
  let selectedSlot = null;

  // Render day buttons
  daySelector.innerHTML = slots.availableDays.map(day => `
    <button type="button" class="slot-btn" onclick="selectBookingDay('${day}', this)" style="text-align:left;">
      <i class="bi bi-calendar3 me-2"></i>${day}
    </button>
  `).join('');

  slotGrid.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;grid-column:1/-1;">Select a day first</p>';

  window.selectBookingDay = function (day, btn) {
    selectedDay = day;
    selectedSlot = null;
    document.querySelectorAll('#daySelector .slot-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const bookedSlots = bookings.filter(b => b.day === day).map(b => b.slot);

    slotGrid.innerHTML = slots.timeSlots.map(time => {
      const isBooked = bookedSlots.includes(time);
      return `
        <button type="button" class="slot-btn ${isBooked ? 'booked' : ''}" 
          ${isBooked ? 'disabled' : `onclick="selectBookingSlot('${time}', this)"`}>
          ${time}
          ${isBooked ? '<br><small>Booked</small>' : ''}
        </button>
      `;
    }).join('');
  };

  window.selectBookingSlot = function (time, btn) {
    selectedSlot = time;
    document.querySelectorAll('#slotGrid .slot-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('bookingForm').style.display = 'block';
  };

  // Booking form submit
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!selectedDay || !selectedSlot) return;

      const booking = {
        id: Date.now(),
        name: document.getElementById('bookName').value.trim(),
        email: document.getElementById('bookEmail').value.trim(),
        topic: document.getElementById('bookTopic').value.trim(),
        day: selectedDay,
        slot: selectedSlot,
        date: new Date().toISOString()
      };

      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      bookings.push(booking);
      localStorage.setItem('bookings', JSON.stringify(bookings));

      bookingForm.style.display = 'none';
      document.getElementById('bookingSuccess').style.display = 'block';

      // Send confirmation email
      const mailtoUrl = `mailto:${booking.email}?subject=${encodeURIComponent('Consultation Booking Confirmation')}&body=${encodeURIComponent(
        `Dear ${booking.name},\n\nYour consultation with Dr. Mohamed Hasain N has been booked.\n\nDay: ${booking.day}\nTime: ${booking.slot}\nDuration: ${slots.duration} minutes\nTopic: ${booking.topic}\n\nYou will receive further details closer to the session.\n\nBest regards,\nDr. Mohamed Hasain N`
      )}`;
      window.open(mailtoUrl, '_blank');
    });
  }
}
