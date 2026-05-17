/* ============================================================
   CONTACT.JS — Contact Form & Feedback Submission
   ============================================================ */

(function () {
  'use strict';

  // Contact Form
  document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const query = {
          id: Date.now(),
          name: document.getElementById('contactName').value.trim(),
          email: document.getElementById('contactEmail').value.trim(),
          subject: document.getElementById('contactSubject').value.trim(),
          category: document.getElementById('contactCategory').value,
          message: document.getElementById('contactMessage').value.trim(),
          date: new Date().toISOString(),
          read: false
        };

        // Store in localStorage
        const queries = JSON.parse(localStorage.getItem('contactQueries') || '[]');
        queries.push(query);
        localStorage.setItem('contactQueries', JSON.stringify(queries));

        // Show success
        contactForm.style.display = 'none';
        document.getElementById('contactSuccess').style.display = 'block';

        // Also open mailto
        const mailtoUrl = `mailto:mohamedhasaincivil@gmail.com?subject=${encodeURIComponent(query.subject)}&body=${encodeURIComponent(
          `Name: ${query.name}\nEmail: ${query.email}\nCategory: ${query.category}\n\n${query.message}`
        )}`;
        window.open(mailtoUrl, '_blank');
      });
    }

    // Feedback Form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const feedback = {
          id: Date.now(),
          name: document.getElementById('fbName').value.trim(),
          role: document.getElementById('fbRole').value.trim(),
          message: document.getElementById('fbMessage').value.trim(),
          date: new Date().toISOString(),
          approved: false,
          scheduledDay: null
        };

        const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        feedbacks.push(feedback);
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

        // Reset form and close modal
        feedbackForm.reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('feedbackModal'));
        if (modal) modal.hide();

        // Show toast-like notification
        showNotification('Thank you! Your testimonial has been submitted for review.');
      });
    }
  });

  function showNotification(msg) {
    // Create a simple notification
    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      background: rgba(22,22,35,0.95);
      border: 1px solid rgba(0,240,255,0.2);
      border-left: 3px solid #00f0ff;
      border-radius: 12px;
      color: #f0f0f5;
      font-size: 0.9rem;
      z-index: 9999;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    notif.innerHTML = `<i class="bi bi-check-circle" style="color:#00f0ff;margin-right:0.5rem;"></i>${msg}`;
    document.body.appendChild(notif);

    requestAnimationFrame(() => {
      notif.style.transform = 'translateY(0)';
      notif.style.opacity = '1';
    });

    setTimeout(() => {
      notif.style.transform = 'translateY(100px)';
      notif.style.opacity = '0';
      setTimeout(() => notif.remove(), 400);
    }, 4000);
  }
})();
