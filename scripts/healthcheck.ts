/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║        YOD Elazığ API — Full System Health Check            ║
 * ║  Tests ALL endpoints: Auth, CRUD, i18n, Forms, Media, etc.  ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Usage:  npx ts-node scripts/healthcheck.ts
 *  Requires: Server running on PORT (default 5000)
 */

import dotenv from 'dotenv';
dotenv.config();

const BASE = `http://localhost:${process.env.PORT || 5000}/api/v1`;
const ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@yod-elazig.org';
const ADMIN_PASS = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';

// ── Colours ──────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

// ── Counters ─────────────────────────────────────────
let passed = 0;
let failed = 0;
let skipped = 0;
const failures: string[] = [];

// ── Stored IDs for cleanup ───────────────────────────
const created: Record<string, string> = {};
let accessToken = '';
let refreshToken = '';

// ── Helpers ──────────────────────────────────────────
async function req(
  method: string,
  path: string,
  body?: any,
  token?: string,
  expectStatus?: number,
): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts: RequestInit = { method, headers };
  if (body && !['GET', 'HEAD'].includes(method)) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, opts);
  let data: any;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { status: res.status, data, ok: res.ok };
}

function test(name: string, passed_: boolean, detail?: string) {
  if (passed_) {
    passed++;
    console.log(`  ${c.green}✔${c.reset} ${name}`);
  } else {
    failed++;
    const msg = `${name}${detail ? ` — ${detail}` : ''}`;
    failures.push(msg);
    console.log(`  ${c.red}✘${c.reset} ${name}${detail ? ` ${c.dim}(${detail})${c.reset}` : ''}`);
  }
}

function skip(name: string, reason: string) {
  skipped++;
  console.log(`  ${c.yellow}⊘${c.reset} ${name} ${c.dim}(${reason})${c.reset}`);
}

function section(title: string) {
  console.log(`\n${c.cyan}${c.bold}┌─ ${title} ${'─'.repeat(50 - title.length)}┐${c.reset}`);
}

// ═══════════════════════════════════════════════════════
//  TEST SUITES
// ═══════════════════════════════════════════════════════

async function testHealth() {
  section('Health Check');
  const r = await req('GET', '/../health');
  test('GET /api/health → 200', r.status === 200);
  test('Health response has status=ok', r.data?.status === 'ok');
}

// ─────────────────── AUTH ────────────────────────────
async function testAuth() {
  section('Authentication');

  // Register test user
  const testEmail = `test_${Date.now()}@yod-test.org`;
  const regRes = await req('POST', '/auth/register', {
    name: 'Test User',
    email: testEmail,
    password: 'Test@12345',
  });
  test('POST /auth/register → 201', regRes.status === 201, `got ${regRes.status}`);

  // Login as admin
  const loginRes = await req('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASS,
  });
  test('POST /auth/login (admin) → 200', loginRes.status === 200, `got ${loginRes.status}`);

  if (loginRes.status === 200) {
    accessToken = loginRes.data?.data?.accessToken;
    refreshToken = loginRes.data?.data?.refreshToken;
    test('Login returns accessToken', !!accessToken);
    test('Login returns refreshToken', !!refreshToken);
  } else {
    skip('Token extraction', 'login failed');
    return;
  }

  // Get profile
  const meRes = await req('GET', '/auth/me', undefined, accessToken);
  test('GET /auth/me → 200', meRes.status === 200, `got ${meRes.status}`);
  test('Profile has email', !!meRes.data?.data?.user?.email);

  // Refresh token
  const refRes = await req('POST', '/auth/refresh-token', { refreshToken });
  test('POST /auth/refresh-token → 200', refRes.status === 200, `got ${refRes.status}`);
  if (refRes.status === 200 && refRes.data?.data?.accessToken) {
    accessToken = refRes.data.data.accessToken;
    refreshToken = refRes.data.data.refreshToken;
  }

  // Forgot password
  const forgotRes = await req('POST', '/auth/forgot-password', { email: ADMIN_EMAIL });
  test('POST /auth/forgot-password → 200', forgotRes.status === 200, `got ${forgotRes.status}`);

  // Change password (wrong current) — validator may reject before reaching service
  const changeBad = await req('PUT', '/auth/change-password', {
    currentPassword: 'Wrong@999',
    newPassword: 'NewPass@123',
  }, accessToken);
  test('PUT /auth/change-password (wrong) → 401 or 422', changeBad.status === 401 || changeBad.status === 422, `got ${changeBad.status}`);

  // Clean up: delete test user
  // (optional — we leave it for now)
}

// ─────────────────── NEWS ────────────────────────────
async function testNews() {
  section('News');

  // Public
  const pubRes = await req('GET', '/news');
  test('GET /news (public) → 200', pubRes.status === 200, `got ${pubRes.status}`);

  // Admin list
  const adminRes = await req('GET', '/news/admin', undefined, accessToken);
  test('GET /news/admin → 200', adminRes.status === 200, `got ${adminRes.status}`);

  // Create (publish immediately so slug is accessible)
  const createRes = await req('POST', '/news', {
    title: 'Test News Title',
    content: 'This is a test news content for health check.',
    summary: 'Test summary',
    isPublished: true,
  }, accessToken);
  test('POST /news → 201', createRes.status === 201, `got ${createRes.status}`);

  if (createRes.status === 201) {
    created.newsId = createRes.data?.data?.news?._id;
    const slug = createRes.data?.data?.news?.slug;

    // Get by ID
    const byIdRes = await req('GET', `/news/${created.newsId}`, undefined, accessToken);
    test('GET /news/:id → 200', byIdRes.status === 200, `got ${byIdRes.status}`);

    // Get by slug
    if (slug) {
      const slugRes = await req('GET', `/news/slug/${slug}`);
      test('GET /news/slug/:slug → 200', slugRes.status === 200, `got ${slugRes.status}`);
    }

    // Toggle publish
    const toggleRes = await req('PATCH', `/news/${created.newsId}/toggle-publish`, undefined, accessToken);
    test('PATCH /news/:id/toggle-publish → 200', toggleRes.status === 200, `got ${toggleRes.status}`);

    // Update
    const updateRes = await req('PUT', `/news/${created.newsId}`, {
      title: 'Updated Test News',
      content: 'Updated content.',
    }, accessToken);
    test('PUT /news/:id → 200', updateRes.status === 200, `got ${updateRes.status}`);

    // Delete
    const delRes = await req('DELETE', `/news/${created.newsId}`, undefined, accessToken);
    test('DELETE /news/:id → 200', delRes.status === 200, `got ${delRes.status}`);
  } else {
    skip('News CRUD', 'create failed');
  }
}

// ─────────────────── EVENTS ─────────────────────────
async function testEvents() {
  section('Events');

  const pubRes = await req('GET', '/events');
  test('GET /events (public) → 200', pubRes.status === 200, `got ${pubRes.status}`);

  const upRes = await req('GET', '/events/upcoming');
  test('GET /events/upcoming → 200', upRes.status === 200, `got ${upRes.status}`);

  const createRes = await req('POST', '/events', {
    title: 'Test Event',
    description: 'Health check event',
    startDate: new Date(Date.now() + 86400000).toISOString(),
    capacity: 50,
  }, accessToken);
  test('POST /events → 201', createRes.status === 201, `got ${createRes.status}`);

  if (createRes.status === 201) {
    created.eventId = createRes.data?.data?.event?._id;

    const byIdRes = await req('GET', `/events/${created.eventId}`, undefined, accessToken);
    test('GET /events/:id → 200', byIdRes.status === 200, `got ${byIdRes.status}`);

    // Event registration requires a student; admin may get 400/403
    const regRes = await req('POST', `/events/${created.eventId}/register`, undefined, accessToken);
    test('POST /events/:id/register → 200 or 400', regRes.status === 200 || regRes.status === 400, `got ${regRes.status}`);

    const unregRes = await req('DELETE', `/events/${created.eventId}/register`, undefined, accessToken);
    test('DELETE /events/:id/register → 200 or 404', unregRes.status === 200 || unregRes.status === 404, `got ${unregRes.status}`);

    const toggleRes = await req('PATCH', `/events/${created.eventId}/toggle-publish`, undefined, accessToken);
    test('PATCH /events/:id/toggle-publish → 200', toggleRes.status === 200, `got ${toggleRes.status}`);

    const delRes = await req('DELETE', `/events/${created.eventId}`, undefined, accessToken);
    test('DELETE /events/:id → 200', delRes.status === 200, `got ${delRes.status}`);
  } else {
    skip('Events CRUD', 'create failed');
  }
}

// ─────────────────── PROGRAMS ───────────────────────
async function testPrograms() {
  section('Programs (i18n)');

  const pubRes = await req('GET', '/programs');
  test('GET /programs (public) → 200', pubRes.status === 200, `got ${pubRes.status}`);

  const createRes = await req('POST', '/programs', {
    title: { ar: 'برنامج اختبار', en: 'Test Program', tr: 'Test Programı' },
    description: { ar: 'وصف', en: 'Description', tr: 'Açıklama' },
    summary: { ar: 'ملخص', en: 'Summary', tr: 'Özet' },
    startDate: new Date(Date.now() + 86400000).toISOString(),
    isPublished: true,
  }, accessToken);
  test('POST /programs (i18n) → 201', createRes.status === 201, `got ${createRes.status}`);

  if (createRes.status === 201) {
    created.programId = createRes.data?.data?.program?._id;
    const slug = createRes.data?.data?.program?.slug;

    test('Program has i18n title.ar', !!createRes.data?.data?.program?.title?.ar);
    test('Program has i18n title.en', !!createRes.data?.data?.program?.title?.en);
    test('Program has i18n title.tr', !!createRes.data?.data?.program?.title?.tr);

    if (slug) {
      const slugRes = await req('GET', `/programs/slug/${slug}`);
      test('GET /programs/slug/:slug → 200', slugRes.status === 200, `got ${slugRes.status}`);
    }

    const toggleRes = await req('PATCH', `/programs/${created.programId}/toggle-publish`, undefined, accessToken);
    test('PATCH /programs/:id/toggle-publish → 200', toggleRes.status === 200, `got ${toggleRes.status}`);

    const delRes = await req('DELETE', `/programs/${created.programId}`, undefined, accessToken);
    test('DELETE /programs/:id → 200', delRes.status === 200, `got ${delRes.status}`);
  } else {
    skip('Programs CRUD', 'create failed');
  }
}

// ─────────────────── ACHIEVEMENTS ───────────────────
async function testAchievements() {
  section('Achievements (i18n)');

  const pubRes = await req('GET', '/achievements');
  test('GET /achievements (public) → 200', pubRes.status === 200, `got ${pubRes.status}`);

  const createRes = await req('POST', '/achievements', {
    title: { ar: 'إنجاز', en: 'Achievement', tr: 'Başarı' },
    description: { ar: 'وصف', en: 'Desc', tr: 'Açıklama' },
    date: new Date().toISOString(),
    order: 1,
  }, accessToken);
  test('POST /achievements → 201', createRes.status === 201, `got ${createRes.status}`);

  if (createRes.status === 201) {
    created.achievementId = createRes.data?.data?.achievement?._id;

    const delRes = await req('DELETE', `/achievements/${created.achievementId}`, undefined, accessToken);
    test('DELETE /achievements/:id → 200', delRes.status === 200, `got ${delRes.status}`);
  } else {
    skip('Achievements CRUD', 'create failed');
  }
}

// ─────────────────── FAQ ────────────────────────────
async function testFAQ() {
  section('FAQ (i18n)');

  const pubRes = await req('GET', '/faq');
  test('GET /faq (public) → 200', pubRes.status === 200, `got ${pubRes.status}`);

  const createRes = await req('POST', '/faq', {
    question: { ar: 'سؤال؟', en: 'Question?', tr: 'Soru?' },
    answer: { ar: 'جواب', en: 'Answer', tr: 'Cevap' },
    category: 'general',
    order: 1,
  }, accessToken);
  test('POST /faq → 201', createRes.status === 201, `got ${createRes.status}`);

  if (createRes.status === 201) {
    created.faqId = createRes.data?.data?.faq?._id;

    const delRes = await req('DELETE', `/faq/${created.faqId}`, undefined, accessToken);
    test('DELETE /faq/:id → 200', delRes.status === 200, `got ${delRes.status}`);
  } else {
    skip('FAQ CRUD', 'create failed');
  }
}

// ─────────────────── RESOURCES ──────────────────────
async function testResources() {
  section('Resources (i18n)');

  const pubRes = await req('GET', '/resources');
  test('GET /resources (public) → 200', pubRes.status === 200, `got ${pubRes.status}`);

  const createRes = await req('POST', '/resources', {
    title: { ar: 'مصدر', en: 'Resource', tr: 'Kaynak' },
    description: { ar: 'وصف', en: 'Desc', tr: 'Açıklama' },
    url: 'https://example.com/resource.pdf',
    type: 'document',
    category: 'education',
  }, accessToken);
  test('POST /resources → 201', createRes.status === 201, `got ${createRes.status}`);

  if (createRes.status === 201) {
    created.resourceId = createRes.data?.data?.resource?._id;

    const delRes = await req('DELETE', `/resources/${created.resourceId}`, undefined, accessToken);
    test('DELETE /resources/:id → 200', delRes.status === 200, `got ${delRes.status}`);
  } else {
    skip('Resources CRUD', 'create failed');
  }
}

// ─────────────────── PAGES ──────────────────────────
async function testPages() {
  section('Pages (i18n)');

  const allRes = await req('GET', '/pages', undefined, accessToken);
  test('GET /pages → 200', allRes.status === 200, `got ${allRes.status}`);

  const upsertRes = await req('PUT', '/pages/about-union', {
    title: { ar: 'عن الاتحاد', en: 'About Union', tr: 'Birlik Hakkında' },
    content: { ar: 'محتوى', en: 'Content', tr: 'İçerik' },
  }, accessToken);
  test('PUT /pages/about-union (upsert) → 200', upsertRes.status === 200, `got ${upsertRes.status}`);

  const byKeyRes = await req('GET', '/pages/about-union', undefined, accessToken);
  test('GET /pages/:key → 200', byKeyRes.status === 200, `got ${byKeyRes.status}`);
}

// ─────────────────── SETTINGS ───────────────────────
async function testSettings() {
  section('Settings');

  const getRes = await req('GET', '/settings');
  test('GET /settings (public) → 200', getRes.status === 200, `got ${getRes.status}`);

  const updateRes = await req('PUT', '/settings', {
    socialLinks: {
      facebook: 'https://facebook.com/yodelazig',
      instagram: 'https://instagram.com/yodelazig',
    },
    contactInfo: {
      email: 'info@yod-elazig.org',
      phone: '+90 555 123 4567',
      address: { ar: 'عنوان', en: 'Address', tr: 'Adres' },
    },
  }, accessToken);
  test('PUT /settings → 200', updateRes.status === 200, `got ${updateRes.status}`);
}

// ─────────────────── CONTACTS ───────────────────────
async function testContacts() {
  section('Contact Form');

  // Public submit
  const submitRes = await req('POST', '/contacts', {
    name: 'Test Person',
    email: 'test@example.com',
    subject: 'Health Check',
    message: 'This is a test message from the health check script.',
  });
  test('POST /contacts (public submit) → 201', submitRes.status === 201, `got ${submitRes.status}`);

  if (submitRes.status === 201) {
    created.contactId = submitRes.data?.data?.contact?._id;

    // Admin list
    const listRes = await req('GET', '/contacts', undefined, accessToken);
    test('GET /contacts (admin) → 200', listRes.status === 200, `got ${listRes.status}`);

    // Stats
    const statsRes = await req('GET', '/contacts/stats', undefined, accessToken);
    test('GET /contacts/stats → 200', statsRes.status === 200, `got ${statsRes.status}`);

    // Mark as read
    const readRes = await req('PATCH', `/contacts/${created.contactId}/read`, undefined, accessToken);
    test('PATCH /contacts/:id/read → 200', readRes.status === 200, `got ${readRes.status}`);

    // Reply
    const replyRes = await req('POST', `/contacts/${created.contactId}/reply`, {
      replyMessage: 'Thank you for your message!',
    }, accessToken);
    test('POST /contacts/:id/reply → 200', replyRes.status === 200, `got ${replyRes.status}`);

    // Delete
    const delRes = await req('DELETE', `/contacts/${created.contactId}`, undefined, accessToken);
    test('DELETE /contacts/:id → 200', delRes.status === 200, `got ${delRes.status}`);
  } else {
    skip('Contacts CRUD', 'submit failed');
  }
}

// ─────────────────── VOLUNTEERS ─────────────────────
async function testVolunteers() {
  section('Volunteer Applications');

  // Public submit
  const submitRes = await req('POST', '/volunteers', {
    name: 'Volunteer Test',
    email: `vol_${Date.now()}@example.com`,
    phone: '+90 555 999 0000',
    university: 'Fırat Üniversitesi',
    skills: ['coding', 'design'],
    motivation: 'I want to help the community.',
  });
  test('POST /volunteers (public) → 201', submitRes.status === 201, `got ${submitRes.status}`);

  if (submitRes.status === 201) {
    created.volunteerId = submitRes.data?.data?.volunteer?._id;

    // Admin list
    const listRes = await req('GET', '/volunteers', undefined, accessToken);
    test('GET /volunteers (admin) → 200', listRes.status === 200, `got ${listRes.status}`);

    // Stats
    const statsRes = await req('GET', '/volunteers/stats', undefined, accessToken);
    test('GET /volunteers/stats → 200', statsRes.status === 200, `got ${statsRes.status}`);

    // Export
    const exportRes = await req('GET', '/volunteers/export', undefined, accessToken);
    test('GET /volunteers/export → 200', exportRes.status === 200, `got ${exportRes.status}`);

    // Review
    const reviewRes = await req('PATCH', `/volunteers/${created.volunteerId}/review`, {
      status: 'accepted',
      reviewNote: 'Welcome aboard!',
    }, accessToken);
    test('PATCH /volunteers/:id/review → 200', reviewRes.status === 200, `got ${reviewRes.status}`);

    // Delete
    const delRes = await req('DELETE', `/volunteers/${created.volunteerId}`, undefined, accessToken);
    test('DELETE /volunteers/:id → 200', delRes.status === 200, `got ${delRes.status}`);
  } else {
    skip('Volunteers CRUD', 'submit failed');
  }
}

// ─────────────────── GALLERY ────────────────────────
async function testGallery() {
  section('Photo Gallery (i18n)');

  const pubRes = await req('GET', '/gallery');
  test('GET /gallery (public) → 200', pubRes.status === 200, `got ${pubRes.status}`);

  const createRes = await req('POST', '/gallery', {
    title: { ar: 'ألبوم اختبار', en: 'Test Album', tr: 'Test Albümü' },
    description: { ar: 'وصف', en: 'Desc', tr: 'Açıklama' },
    category: 'events',
    order: 1,
    isPublished: true,
  }, accessToken);
  test('POST /gallery (album) → 201', createRes.status === 201, `got ${createRes.status}`);

  if (createRes.status === 201) {
    created.albumId = createRes.data?.data?.album?._id;

    // Add photos
    const addRes = await req('POST', `/gallery/${created.albumId}/photos`, {
      photos: [
        { url: 'https://picsum.photos/800/600', caption: { ar: 'صورة', en: 'Photo', tr: 'Fotoğraf' }, order: 1 },
        { url: 'https://picsum.photos/800/601', caption: { ar: 'صورة 2', en: 'Photo 2', tr: 'Fotoğraf 2' }, order: 2 },
      ],
    }, accessToken);
    test('POST /gallery/:id/photos → 200', addRes.status === 200, `got ${addRes.status}`);

    // Slug
    const slug = createRes.data?.data?.album?.slug;
    if (slug) {
      const slugRes = await req('GET', `/gallery/slug/${slug}`);
      test('GET /gallery/slug/:slug → 200', slugRes.status === 200, `got ${slugRes.status}`);
    }

    // Delete album
    const delRes = await req('DELETE', `/gallery/${created.albumId}`, undefined, accessToken);
    test('DELETE /gallery/:id → 200', delRes.status === 200, `got ${delRes.status}`);
  } else {
    skip('Gallery CRUD', 'create failed');
  }
}

// ─────────────────── TICKER ─────────────────────────
async function testTicker() {
  section('News Ticker (i18n)');

  const pubRes = await req('GET', '/ticker');
  test('GET /ticker (public) → 200', pubRes.status === 200, `got ${pubRes.status}`);

  const createRes = await req('POST', '/ticker', {
    text: { ar: 'خبر عاجل', en: 'Breaking News', tr: 'Son Dakika' },
    url: 'https://example.com',
    order: 1,
    isActive: true,
  }, accessToken);
  test('POST /ticker → 201', createRes.status === 201, `got ${createRes.status}`);

  if (createRes.status === 201) {
    created.tickerId = createRes.data?.data?.ticker?._id;

    const delRes = await req('DELETE', `/ticker/${created.tickerId}`, undefined, accessToken);
    test('DELETE /ticker/:id → 200', delRes.status === 200, `got ${delRes.status}`);
  } else {
    skip('Ticker CRUD', 'create failed');
  }
}

// ─────────────────── TRANSLATIONS ───────────────────
async function testTranslations() {
  section('i18n Translations');

  // Upsert
  const upsertRes = await req('POST', '/translations', {
    lang: 'en',
    namespace: 'common',
    key: 'test_key',
    value: 'Test Value',
  }, accessToken);
  test('POST /translations (upsert) → 200', upsertRes.status === 200, `got ${upsertRes.status}`);

  // Bulk upsert
  const bulkRes = await req('POST', '/translations/bulk', {
    lang: 'ar',
    namespace: 'common',
    translations: { greeting: 'مرحبا', farewell: 'مع السلامة' },
  }, accessToken);
  test('POST /translations/bulk → 200', bulkRes.status === 200, `got ${bulkRes.status}`);

  // Get by lang
  const byLangRes = await req('GET', '/translations/en');
  test('GET /translations/:lang → 200', byLangRes.status === 200, `got ${byLangRes.status}`);

  // Get by namespace
  const byNsRes = await req('GET', '/translations/en/common');
  test('GET /translations/:lang/:namespace → 200', byNsRes.status === 200, `got ${byNsRes.status}`);

  // Delete
  const delRes = await req('DELETE', '/translations/en/common/test_key', undefined, accessToken);
  test('DELETE /translations/:lang/:ns/:key → 200', delRes.status === 200, `got ${delRes.status}`);

  // Cleanup bulk
  await req('DELETE', '/translations/ar/common/greeting', undefined, accessToken);
  await req('DELETE', '/translations/ar/common/farewell', undefined, accessToken);
}

// ─────────────────── DASHBOARD ──────────────────────
async function testDashboard() {
  section('Dashboard');

  const res = await req('GET', '/dashboard', undefined, accessToken);
  test('GET /dashboard → 200', res.status === 200, `got ${res.status}`);

  if (res.status === 200) {
    const stats = res.data?.data?.stats;
    test('Dashboard has users stats', stats?.users !== undefined);
    test('Dashboard has students stats', stats?.students !== undefined);
    test('Dashboard has news stats', stats?.news !== undefined);
    test('Dashboard has events stats', stats?.events !== undefined);
    test('Dashboard has programs stats', stats?.programs !== undefined);
    test('Dashboard has contacts stats', stats?.contacts !== undefined);
    test('Dashboard has volunteers stats', stats?.volunteers !== undefined);
    test('Dashboard has gallery stats', stats?.gallery !== undefined);
    test('Dashboard has content stats', stats?.content !== undefined);
  }
}

// ─────────────────── AUTH PROTECTION ────────────────
async function testAuthProtection() {
  section('Auth & Role Protection');

  // No token → 401
  const noAuth = await req('GET', '/news/admin');
  test('GET /news/admin (no token) → 401', noAuth.status === 401, `got ${noAuth.status}`);

  // Invalid token → 401
  const badAuth = await req('GET', '/news/admin', undefined, 'invalid.token.here');
  test('GET /news/admin (bad token) → 401', badAuth.status === 401, `got ${badAuth.status}`);

  // Dashboard without admin role
  // (we can only test this if we create a non-admin user)
  const testEmail = `student_${Date.now()}@yod-test.org`;
  const regRes = await req('POST', '/auth/register', {
    name: 'Student User',
    email: testEmail,
    password: 'Student@123',
  });

  if (regRes.status === 201) {
    const loginRes = await req('POST', '/auth/login', {
      email: testEmail,
      password: 'Student@123',
    });
    if (loginRes.status === 200) {
      const studentToken = loginRes.data?.data?.accessToken;
      const dashRes = await req('GET', '/dashboard', undefined, studentToken);
      test('GET /dashboard (student role) → 403', dashRes.status === 403, `got ${dashRes.status}`);
    }
  }
}

// ─────────────────── MEDIA ENDPOINT ─────────────────
async function testMediaEndpoints() {
  section('Media Endpoints');

  const listRes = await req('GET', '/media', undefined, accessToken);
  test('GET /media → 200', listRes.status === 200, `got ${listRes.status}`);

  // Upload requires multipart — we just verify endpoint responds
  const noFileRes = await req('POST', '/media/upload', {}, accessToken);
  test('POST /media/upload (no file) → 400', noFileRes.status === 400, `got ${noFileRes.status}`);
}

// ─────────────────── STUDENTS ───────────────────────
async function testStudents() {
  section('Students');

  const listRes = await req('GET', '/students', undefined, accessToken);
  test('GET /students (admin) → 200', listRes.status === 200, `got ${listRes.status}`);

  const createRes = await req('POST', '/students', {
    name: 'Test Student',
    email: `student_crud_${Date.now()}@yod-test.org`,
    password: 'Student@12345',
    university: 'Fırat Üniversitesi',
    department: 'Computer Science',
    yearOfStudy: 2,
    nationality: 'Turkish',
  }, accessToken);
  test('POST /students → 201', createRes.status === 201, `got ${createRes.status}`);

  if (createRes.status === 201) {
    created.studentId = createRes.data?.data?.student?._id;

    const byIdRes = await req('GET', `/students/${created.studentId}`, undefined, accessToken);
    test('GET /students/:id → 200', byIdRes.status === 200, `got ${byIdRes.status}`);

    const delRes = await req('DELETE', `/students/${created.studentId}`, undefined, accessToken);
    test('DELETE /students/:id → 200', delRes.status === 200, `got ${delRes.status}`);
  } else {
    skip('Students CRUD', 'create failed');
  }
}

// ═══════════════════════════════════════════════════════
//  MAIN RUNNER
// ═══════════════════════════════════════════════════════
async function main() {
  console.log(`\n${c.bold}${c.cyan}╔══════════════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bold}${c.cyan}║    YOD Elazığ API — Full System Health Check         ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}║    Base URL: ${BASE.padEnd(40)}║${c.reset}`);
  console.log(`${c.bold}${c.cyan}╚══════════════════════════════════════════════════════╝${c.reset}\n`);

  try {
    await testHealth();
    await testAuth();

    if (!accessToken) {
      console.log(`\n${c.red}${c.bold}⚠ Cannot proceed — admin login failed.${c.reset}`);
      console.log(`  Make sure the seed script has been run: npx ts-node scripts/seed.ts\n`);
      process.exit(1);
    }

    await testNews();
    await testEvents();
    await testPrograms();
    await testAchievements();
    await testFAQ();
    await testResources();
    await testPages();
    await testSettings();
    await testContacts();
    await testVolunteers();
    await testGallery();
    await testTicker();
    await testTranslations();
    await testStudents();
    await testDashboard();
    await testMediaEndpoints();
    await testAuthProtection();
  } catch (err) {
    console.log(`\n${c.red}${c.bold}Fatal error: ${(err as Error).message}${c.reset}\n`);
    if ((err as Error).message.includes('fetch failed') || (err as Error).message.includes('ECONNREFUSED')) {
      console.log(`  ${c.yellow}⚠ Server is not running! Start it with: npm run dev${c.reset}\n`);
    }
    process.exit(1);
  }

  // ── Summary ──────────────────────────────────────
  console.log(`\n${c.bold}${c.cyan}╔══════════════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bold}${c.cyan}║                    TEST RESULTS                      ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}╟──────────────────────────────────────────────────────╢${c.reset}`);
  console.log(`${c.bold}${c.cyan}║  ${c.green}✔ Passed:  ${String(passed).padEnd(5)}${c.cyan}                                   ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}║  ${c.red}✘ Failed:  ${String(failed).padEnd(5)}${c.cyan}                                   ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}║  ${c.yellow}⊘ Skipped: ${String(skipped).padEnd(5)}${c.cyan}                                   ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}║  Total:    ${String(passed + failed + skipped).padEnd(5)}                                   ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}╚══════════════════════════════════════════════════════╝${c.reset}`);

  if (failures.length > 0) {
    console.log(`\n${c.red}${c.bold}Failed tests:${c.reset}`);
    failures.forEach((f) => console.log(`  ${c.red}✘${c.reset} ${f}`));
  }

  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

main();
