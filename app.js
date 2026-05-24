/* ===================================================
   SERAVELLI — Main Application Logic
   vCard, Share, Click Tracking, Analytics UI
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ============ CONFIG ============
  const CONFIG = {
    name: 'Seravelli',
    bio: 'Italian Elegance',
    phone: '+998900979911',
    telegram: 'https://t.me/seravelli',
    telegramAdmin: 'https://t.me/uz377',
    instagram: 'https://www.instagram.com/seravelli.uzbekistan?igsh=NmlkMWE5MTMxZ2x5',
    location: 'https://yandex.ru/maps/-/CPsWnDZl',
    profileImage: 'https://i.postimg.cc/g0h6Sk9j/IMG-1142.jpg',
    password: '12345678',
    siteUrl: window.location.href
  };

  // ============ DOM ELEMENTS ============
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const btnSaveContact = $('#btnSaveContact');
  const btnShare = $('#btnShare');
  const btnAnalytics = $('#btnAnalytics');
  const analyticsModal = $('#analyticsModal');
  const passwordScreen = $('#passwordScreen');
  const passwordInput = $('#passwordInput');
  const passwordSubmit = $('#passwordSubmit');
  const passwordError = $('#passwordError');
  const analyticsDashboard = $('#analyticsDashboard');
  const analyticsClose = $('#analyticsClose');
  const toast = $('#toast');

  // ============ INIT I18N ============
  I18N.init();

  // ============ LOG VISIT ON PAGE LOAD ============
  SeravelliDB.logVisit();

  // ============ RIPPLE EFFECT ============
  function createRipple(e, element) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  // Add ripple to all link buttons
  $$('.link-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      createRipple(e, btn);
    });
  });

  // ============ CLICK TRACKING ============
  $$('.link-btn[data-track]').forEach(btn => {
    btn.addEventListener('click', () => {
      const trackId = btn.dataset.track;
      SeravelliDB.logClick(trackId);
    });
  });

  // ============ SAVE CONTACT (vCard) ============
  btnSaveContact.addEventListener('click', () => {
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${CONFIG.name}`,
      `ORG:${CONFIG.name}`,
      `TITLE:${CONFIG.bio}`,
      `TEL;TYPE=CELL:${CONFIG.phone}`,
      `URL;TYPE=Telegram:${CONFIG.telegram}`,
      `URL;TYPE=Instagram:${CONFIG.instagram}`,
      `URL;TYPE=Location:${CONFIG.location}`,
      `NOTE:${CONFIG.bio} | Telegram Admin: @uz377`,
      `PHOTO;TYPE=URI:${CONFIG.profileImage}`,
      'END:VCARD'
    ].join('\n');

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${CONFIG.name}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(I18N.t('contactSaved'));
    SeravelliDB.logClick('save_contact');
  });

  // ============ SHARE ============
  btnShare.addEventListener('click', async () => {
    const shareText = `✨ ${CONFIG.name} — ${I18N.t('bio')}\n\n📞 ${I18N.t('shareLabelPhone')}: ${CONFIG.phone}\n📱 Telegram: ${CONFIG.telegram}\n👤 ${I18N.t('shareLabelAdmin')}: ${CONFIG.telegramAdmin}\n📸 Instagram: ${CONFIG.instagram}\n📍 ${I18N.t('shareLabelLocation')}: ${CONFIG.location}\n\n🔗 ${I18N.t('shareLabelSite')}: ${CONFIG.siteUrl}`;

    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${CONFIG.name} — ${I18N.t('bio')}`,
          text: shareText,
          url: CONFIG.siteUrl
        });
        showToast(I18N.t('shared'));
        SeravelliDB.logClick('share');
        return;
      } catch (err) {
        // User cancelled or error — fall through to Telegram share
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: open Telegram share
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(CONFIG.siteUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramShareUrl, '_blank');
    showToast(I18N.t('shareViaTelegram'));
    SeravelliDB.logClick('share');
  });

  // ============ TOAST ============
  let toastTimeout;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2500);
  }

  // ============ ANALYTICS MODAL ============
  btnAnalytics.addEventListener('click', () => {
    analyticsModal.classList.add('active');
    passwordInput.value = '';
    passwordError.classList.remove('visible');
    passwordScreen.style.display = 'block';
    analyticsDashboard.classList.remove('active');
    setTimeout(() => passwordInput.focus(), 300);
  });

  // Close modal on overlay click
  analyticsModal.addEventListener('click', (e) => {
    if (e.target === analyticsModal) {
      closeAnalyticsModal();
    }
  });

  analyticsClose.addEventListener('click', closeAnalyticsModal);

  function closeAnalyticsModal() {
    analyticsModal.classList.remove('active');
  }

  // Password validation
  passwordSubmit.addEventListener('click', validatePassword);
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') validatePassword();
  });

  function validatePassword() {
    const value = passwordInput.value.trim();
    if (value === CONFIG.password) {
      passwordScreen.style.display = 'none';
      analyticsDashboard.classList.add('active');
      loadAnalytics();
    } else {
      passwordError.classList.add('visible');
      passwordInput.value = '';
      passwordInput.focus();
      // Shake animation
      passwordInput.style.animation = 'none';
      passwordInput.offsetHeight; // trigger reflow
      passwordInput.style.animation = '';
    }
  }

  // ============ BUTTON LABELS (i18n-aware) ============
  function getButtonLabels() {
    return {
      phone: I18N.t('btnLabelPhone'),
      telegram_channel: I18N.t('btnLabelTelegramChannel'),
      telegram_admin: I18N.t('btnLabelTelegramAdmin'),
      instagram: I18N.t('btnLabelInstagram'),
      location: I18N.t('btnLabelLocation')
    };
  }

  // ============ LOAD ANALYTICS ============
  async function loadAnalytics() {
    const data = await SeravelliDB.getAnalyticsData();

    // Stats
    animateCounter('statTotalVisits', data.totalVisits);
    animateCounter('statTotalClicks', data.totalClicks);
    animateCounter('statTodayVisits', data.todayVisits);
    animateCounter('statUniqueVisitors', data.uniqueVisitors);

    // Click Distribution
    renderClickDistribution(data.clickCounts, data.totalClicks);

    // Visitor Log
    renderVisitorLog(data.recentVisitors);
  }

  function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    const duration = 800;
    const start = performance.now();
    const startVal = 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(startVal + (target - startVal) * eased);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function renderClickDistribution(clickCounts, totalClicks) {
    const container = document.getElementById('clickDistribution');
    container.innerHTML = '';

    const BUTTON_LABELS = getButtonLabels();
    const buttons = ['phone', 'telegram_channel', 'telegram_admin', 'instagram', 'location'];
    const maxClicks = Math.max(...buttons.map(b => clickCounts[b] || 0), 1);

    buttons.forEach(btnId => {
      const count = clickCounts[btnId] || 0;
      const percentage = (count / maxClicks) * 100;

      const item = document.createElement('div');
      item.className = 'click-bar-item';
      item.innerHTML = `
        <span class="click-bar-label">${BUTTON_LABELS[btnId] || btnId}</span>
        <div class="click-bar-track">
          <div class="click-bar-fill" style="width: 0%"></div>
        </div>
        <span class="click-bar-count">${count}</span>
      `;
      container.appendChild(item);

      // Animate the bar
      setTimeout(() => {
        item.querySelector('.click-bar-fill').style.width = percentage + '%';
      }, 100);
    });
  }

  function renderVisitorLog(visitors) {
    const container = document.getElementById('visitorLog');
    container.innerHTML = '';

    if (visitors.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:24px; color:var(--text-tertiary); font-size:13px;">
          ${I18N.t('noVisitors')}
        </div>
      `;
      return;
    }

    visitors.slice(0, 30).forEach((v, i) => {
      const item = document.createElement('div');
      item.className = 'visitor-item';
      item.style.animationDelay = (i * 0.05) + 's';

      const dateStr = v.date || '—';
      const timeStr = v.time || '—';
      const browser = v.browser || I18N.t('unknown');
      const device = v.device || I18N.t('unknown');
      const os = v.os || '';
      const referrer = v.referrer || I18N.t('direct');

      item.innerHTML = `
        <div class="visitor-dot"></div>
        <div class="visitor-info">
          <div class="visitor-date">${dateStr} · ${timeStr}</div>
          <div class="visitor-details">${browser} · ${device} · ${os}<br>${I18N.t('source')}: ${referrer}</div>
        </div>
      `;
      container.appendChild(item);
    });
  }

  // ============ LANGUAGE CHANGE HANDLER ============
  window.addEventListener('langchange', () => {
    // Re-render analytics if dashboard is visible
    if (analyticsDashboard.classList.contains('active')) {
      loadAnalytics();
    }
  });

  // ============ KEYBOARD SHORTCUTS ============
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAnalyticsModal();
    }
  });

  // ============ ENTRANCE ANIMATIONS ============
  // Add floating class after initial animation completes
  setTimeout(() => {
    $$('.link-btn').forEach(btn => {
      btn.classList.add('floating');
    });
  }, 1500);

});
