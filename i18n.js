/* ===================================================
   SERAVELLI — Internationalization (i18n) Module
   Languages: RU (default), UZ, EN
   =================================================== */

const I18N = (() => {
  // ============ TRANSLATIONS ============
  const translations = {
    ru: {
      // Profile
      bio: 'Итальянская Элегантность',

      // Buttons
      phone: 'Телефон',
      telegramChannel: 'Telegram Канал',
      telegramAdmin: 'Оформить заказ, Консультация',
      location: 'Локация',

      // Action buttons
      saveContact: 'Сохранить контакт',
      share: 'Поделиться',

      // Analytics
      analytics: '✦ Аналитика ✦',
      analyticsTitle: '📊 Аналитика',
      enterPassword: 'Введите пароль для продолжения',
      wrongPassword: 'Неверный пароль. Попробуйте ещё раз.',
      login: 'Войти',
      totalVisits: 'Всего посещений',
      totalClicks: 'Всего кликов',
      todayVisits: 'Посещений сегодня',
      uniqueVisitors: 'Уникальные посетители',
      buttonClicks: 'Нажатия кнопок',
      recentVisitors: 'Последние посетители',

      // Toast messages
      contactSaved: '✅ Контакт сохранён!',
      shared: '✅ Отправлено!',
      shareViaTelegram: '📤 Поделиться через Telegram...',

      // Visitor log
      noVisitors: 'Посетителей пока нет',
      unknown: 'Неизвестно',
      direct: 'Прямой',
      source: 'Источник',

      // Share text
      shareLabelPhone: 'Телефон',
      shareLabelAdmin: 'Консультация',
      shareLabelLocation: 'Локация',
      shareLabelSite: 'Сайт',

      // Button labels for analytics
      btnLabelPhone: 'Телефон',
      btnLabelTelegramChannel: 'Telegram Канал',
      btnLabelTelegramAdmin: 'Оформить заказ, Консультация',
      btnLabelInstagram: 'Instagram',
      btnLabelLocation: 'Локация'
    },

    uz: {
      // Profile
      bio: 'Italian Elegance',

      // Buttons
      phone: 'Telefon',
      telegramChannel: 'Telegram Kanal',
      telegramAdmin: 'Buyurtma berish, Konsultatsiya',
      location: 'Lokatsiya',

      // Action buttons
      saveContact: 'Kontaktni saqlash',
      share: 'Ulashish',

      // Analytics
      analytics: '✦ Analitika ✦',
      analyticsTitle: '📊 Analitika',
      enterPassword: 'Davom etish uchun parolni kiriting',
      wrongPassword: "Parol noto'g'ri. Qaytadan urinib ko'ring.",
      login: 'Kirish',
      totalVisits: 'Jami tashriflar',
      totalClicks: 'Jami bosilishlar',
      todayVisits: 'Bugungi tashriflar',
      uniqueVisitors: 'Unikal tashrifchilar',
      buttonClicks: 'Tugma bosilishlari',
      recentVisitors: "So'nggi tashrifchilar",

      // Toast messages
      contactSaved: '✅ Kontakt saqlandi!',
      shared: '✅ Ulashildi!',
      shareViaTelegram: '📤 Telegram orqali ulashish...',

      // Visitor log
      noVisitors: "Hali tashrifchilar yo'q",
      unknown: "Noma'lum",
      direct: "To'g'ridan-to'g'ri",
      source: 'Manba',

      // Share text
      shareLabelPhone: 'Telefon',
      shareLabelAdmin: 'Konsultatsiya',
      shareLabelLocation: 'Lokatsiya',
      shareLabelSite: 'Sayt',

      // Button labels for analytics
      btnLabelPhone: 'Telefon',
      btnLabelTelegramChannel: 'Telegram Kanal',
      btnLabelTelegramAdmin: 'Buyurtma berish, Konsultatsiya',
      btnLabelInstagram: 'Instagram',
      btnLabelLocation: 'Lokatsiya'
    },

    en: {
      // Profile
      bio: 'Italian Elegance',

      // Buttons
      phone: 'Phone',
      telegramChannel: 'Telegram Channel',
      telegramAdmin: 'Place an Order, Consultation',
      location: 'Location',

      // Action buttons
      saveContact: 'Save Contact',
      share: 'Share',

      // Analytics
      analytics: '✦ Analytics ✦',
      analyticsTitle: '📊 Analytics',
      enterPassword: 'Enter password to continue',
      wrongPassword: 'Wrong password. Please try again.',
      login: 'Log in',
      totalVisits: 'Total Visits',
      totalClicks: 'Total Clicks',
      todayVisits: 'Today\'s Visits',
      uniqueVisitors: 'Unique Visitors',
      buttonClicks: 'Button Clicks',
      recentVisitors: 'Recent Visitors',

      // Toast messages
      contactSaved: '✅ Contact saved!',
      shared: '✅ Shared!',
      shareViaTelegram: '📤 Sharing via Telegram...',

      // Visitor log
      noVisitors: 'No visitors yet',
      unknown: 'Unknown',
      direct: 'Direct',
      source: 'Source',

      // Share text
      shareLabelPhone: 'Phone',
      shareLabelAdmin: 'Consultation',
      shareLabelLocation: 'Location',
      shareLabelSite: 'Website',

      // Button labels for analytics
      btnLabelPhone: 'Phone',
      btnLabelTelegramChannel: 'Telegram Channel',
      btnLabelTelegramAdmin: 'Place an Order, Consultation',
      btnLabelInstagram: 'Instagram',
      btnLabelLocation: 'Location'
    }
  };

  // ============ STATE ============
  let currentLang = localStorage.getItem('seravelli_lang') || 'ru';

  // ============ METHODS ============

  /**
   * Get translation by key
   */
  function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || 
           (translations['ru'] && translations['ru'][key]) || 
           key;
  }

  /**
   * Get current language code
   */
  function getLang() {
    return currentLang;
  }

  /**
   * Set language and update all DOM elements with data-i18n
   */
  function setLang(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('seravelli_lang', lang);

    // Update HTML lang attribute
    document.documentElement.lang = lang === 'uz' ? 'uz' : lang === 'en' ? 'en' : 'ru';

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[currentLang][key] !== undefined) {
        el.textContent = translations[currentLang][key];
      }
    });

    // Update aria-labels
    const btnSave = document.getElementById('btnSaveContact');
    if (btnSave) btnSave.setAttribute('aria-label', t('saveContact'));
    
    const btnShare = document.getElementById('btnShare');
    if (btnShare) btnShare.setAttribute('aria-label', t('share'));

    // Update active lang button
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Move the indicator
    updateIndicator();

    // Dispatch custom event so app.js can react
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  /**
   * Update the sliding indicator position
   */
  function updateIndicator() {
    const activeBtn = document.querySelector('.lang-btn.active');
    const indicator = document.getElementById('langIndicator');
    if (activeBtn && indicator) {
      const switcher = document.getElementById('langSwitcher');
      const switcherRect = switcher.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      indicator.style.left = (btnRect.left - switcherRect.left) + 'px';
      indicator.style.width = btnRect.width + 'px';
    }
  }

  /**
   * Initialize language switcher
   */
  function init() {
    // Set up click handlers for language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setLang(btn.dataset.lang);
      });
    });

    // Apply saved or default language
    setLang(currentLang);

    // Recalculate indicator on resize
    window.addEventListener('resize', updateIndicator);
  }

  // ============ PUBLIC API ============
  return {
    t,
    getLang,
    setLang,
    init,
    updateIndicator
  };
})();
