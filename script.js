const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('data.json')
    .then(r => r.json())
    .then(data => {
      // Header
      setText('program-name', data.programName);
      setText('tagline', data.tagline);
      const missionEl = document.getElementById('mission-statement');
      if (missionEl) {
        missionEl.innerHTML = '';
        data.missionStatement.split('\n\n').forEach(para => {
          const p = document.createElement('p');
          p.textContent = para;
          missionEl.appendChild(p);
        });
      }

      // Apply button
      const btn = document.getElementById('apply-btn');
      const closedNotice = document.getElementById('closed-notice');
      if (data.applicationsOpen) {
        btn.href = data.applicationUrl;
        btn.setAttribute('aria-disabled', 'false');
      } else {
        btn.setAttribute('aria-disabled', 'true');
        btn.removeAttribute('href');
        setText('apply-label', 'Applications closed');
        if (closedNotice) closedNotice.hidden = false;
      }

      // Stats
      setText('stat-disbursed', currency.format(data.stats.totalDisbursed));
      setText('stat-recipients', data.stats.recipientsCount.toLocaleString());

      // Recipients
      const list = document.getElementById('recipients-list');
      const noRecipients = document.getElementById('no-recipients');
      if (data.recipients && data.recipients.length > 0) {
        data.recipients.forEach(r => {
          const li = document.createElement('li');
          li.className = 'recipient-item';
          const strong = document.createElement('strong');
          strong.textContent = r.name;
          li.appendChild(strong);
          li.appendChild(document.createTextNode(` — ${currency.format(r.amount)} — ${r.month} — ${r.blurb}`));
          list.appendChild(li);
        });
      } else {
        list.hidden = true;
        if (noRecipients) noRecipients.hidden = false;
      }

      // Reviewers
      if (data.reviewers && data.reviewers.length > 0) {
        setText('reviewers-list', data.reviewers.join(', '));
      }

      // FAQ
      const faqContainer = document.getElementById('faq-list');
      if (data.faq && data.faq.length > 0) {
        const wrapper = document.createElement('div');
        wrapper.className = 'faq-list';
        data.faq.forEach(item => {
          const details = document.createElement('details');
          const summary = document.createElement('summary');
          summary.textContent = item.question;
          const answer = document.createElement('p');
          answer.className = 'faq-answer';
          answer.textContent = item.answer;
          details.appendChild(summary);
          details.appendChild(answer);
          wrapper.appendChild(details);
        });
        faqContainer.appendChild(wrapper);
      }

      // Footer
      if (data.lastUpdated) {
        setText('last-updated', formatDate(data.lastUpdated));
      }
    })
    .catch(err => console.error('Failed to load data.json:', err));
});
