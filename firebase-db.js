/* ===================================================
   SERAVELLI — Firebase Database Module
   LocalStorage fallback when Firebase is not configured
   =================================================== */

const SeravelliDB = (() => {
  // ============ FIREBASE CONFIG ============
  // TODO: Replace with your actual Firebase config
  const FIREBASE_CONFIG = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };

  let db = null;
  let firebaseReady = false;

  // ============ INIT ============
  function init() {
    // Check if Firebase config is populated
    if (FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId) {
      try {
        loadFirebaseSDK();
      } catch (e) {
        console.warn('[SeravelliDB] Firebase init failed, using LocalStorage fallback.', e);
        firebaseReady = false;
      }
    } else {
      console.info('[SeravelliDB] Firebase not configured. Using LocalStorage fallback.');
      firebaseReady = false;
    }
    // Ensure localStorage structures exist
    ensureLocalStorage();
  }

  function loadFirebaseSDK() {
    // If Firebase SDK is loaded via CDN in the future, initialize here
    if (typeof firebase !== 'undefined') {
      firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.firestore();
      firebaseReady = true;
      console.info('[SeravelliDB] Firebase connected successfully.');
    }
  }

  // ============ LOCAL STORAGE HELPERS ============
  function ensureLocalStorage() {
    if (!localStorage.getItem('seravelli_visits')) {
      localStorage.setItem('seravelli_visits', JSON.stringify([]));
    }
    if (!localStorage.getItem('seravelli_clicks')) {
      localStorage.setItem('seravelli_clicks', JSON.stringify({}));
    }
  }

  function getLocalVisits() {
    try {
      return JSON.parse(localStorage.getItem('seravelli_visits')) || [];
    } catch {
      return [];
    }
  }

  function getLocalClicks() {
    try {
      return JSON.parse(localStorage.getItem('seravelli_clicks')) || {};
    } catch {
      return {};
    }
  }

  // ============ DEVICE INFO ============
  function getDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = 'Noma\'lum';
    let device = 'Noma\'lum';
    let os = 'Noma\'lum';

    // Browser detection
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    // OS detection
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    // Device type
    if (/Mobi|Android|iPhone|iPad/i.test(ua)) device = 'Mobil';
    else if (/Tablet|iPad/i.test(ua)) device = 'Planshet';
    else device = 'Kompyuter';

    return { browser, device, os, userAgent: ua };
  }

  // ============ VISITOR ID (simple fingerprint) ============
  function getVisitorId() {
    let id = localStorage.getItem('seravelli_visitor_id');
    if (!id) {
      id = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
      localStorage.setItem('seravelli_visitor_id', id);
    }
    return id;
  }

  // ============ LOG VISIT ============
  async function logVisit() {
    const deviceInfo = getDeviceInfo();
    const visitorId = getVisitorId();
    const now = new Date();

    const visitData = {
      visitorId,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('uz-UZ'),
      time: now.toLocaleTimeString('uz-UZ'),
      referrer: document.referrer || 'To\'g\'ridan-to\'g\'ri',
      browser: deviceInfo.browser,
      device: deviceInfo.device,
      os: deviceInfo.os,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language
    };

    if (firebaseReady && db) {
      try {
        await db.collection('visits').add(visitData);
      } catch (e) {
        console.warn('[SeravelliDB] Firebase write failed:', e);
        saveVisitLocal(visitData);
      }
    } else {
      saveVisitLocal(visitData);
    }
  }

  function saveVisitLocal(data) {
    const visits = getLocalVisits();
    visits.unshift(data);
    // Keep max 500 records
    if (visits.length > 500) visits.length = 500;
    localStorage.setItem('seravelli_visits', JSON.stringify(visits));
  }

  // ============ LOG CLICK ============
  async function logClick(buttonId) {
    const now = new Date();
    const clickData = {
      buttonId,
      visitorId: getVisitorId(),
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('uz-UZ'),
      time: now.toLocaleTimeString('uz-UZ')
    };

    if (firebaseReady && db) {
      try {
        await db.collection('clicks').add(clickData);
      } catch (e) {
        console.warn('[SeravelliDB] Firebase click write failed:', e);
        saveClickLocal(buttonId);
      }
    } else {
      saveClickLocal(buttonId);
    }
  }

  function saveClickLocal(buttonId) {
    const clicks = getLocalClicks();
    if (!clicks[buttonId]) clicks[buttonId] = 0;
    clicks[buttonId]++;
    localStorage.setItem('seravelli_clicks', JSON.stringify(clicks));

    // Also save detailed click log
    let clickLog = [];
    try {
      clickLog = JSON.parse(localStorage.getItem('seravelli_click_log')) || [];
    } catch { clickLog = []; }

    clickLog.unshift({
      buttonId,
      visitorId: getVisitorId(),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ')
    });

    if (clickLog.length > 500) clickLog.length = 500;
    localStorage.setItem('seravelli_click_log', JSON.stringify(clickLog));
  }

  // ============ GET ANALYTICS DATA ============
  async function getAnalyticsData() {
    if (firebaseReady && db) {
      return await getFirebaseAnalytics();
    }
    return getLocalAnalytics();
  }

  async function getFirebaseAnalytics() {
    try {
      const visitsSnap = await db.collection('visits').orderBy('timestamp', 'desc').limit(200).get();
      const clicksSnap = await db.collection('clicks').get();

      const visits = [];
      visitsSnap.forEach(doc => visits.push(doc.data()));

      const clickCounts = {};
      clicksSnap.forEach(doc => {
        const d = doc.data();
        if (!clickCounts[d.buttonId]) clickCounts[d.buttonId] = 0;
        clickCounts[d.buttonId]++;
      });

      return buildAnalytics(visits, clickCounts);
    } catch (e) {
      console.warn('[SeravelliDB] Firebase read failed:', e);
      return getLocalAnalytics();
    }
  }

  function getLocalAnalytics() {
    const visits = getLocalVisits();
    const clickCounts = getLocalClicks();
    return buildAnalytics(visits, clickCounts);
  }

  function buildAnalytics(visits, clickCounts) {
    const today = new Date().toLocaleDateString('uz-UZ');
    const uniqueVisitors = new Set(visits.map(v => v.visitorId)).size;
    const todayVisits = visits.filter(v => v.date === today).length;
    const totalClicks = Object.values(clickCounts).reduce((a, b) => a + b, 0);

    return {
      totalVisits: visits.length,
      todayVisits,
      uniqueVisitors,
      totalClicks,
      clickCounts,
      recentVisitors: visits.slice(0, 50)
    };
  }

  // ============ PUBLIC API ============
  return {
    init,
    logVisit,
    logClick,
    getAnalyticsData,
    getVisitorId
  };
})();

// Initialize on load
SeravelliDB.init();
