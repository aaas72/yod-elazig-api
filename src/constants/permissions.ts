// مصفوفة الصلاحيات لكل عملية
// ملاحظة: هذا الملف يجب أن يتوافق مع middleware authorizeRoles في routes
export const PERMISSIONS = {
  users: {
    list: ['super_admin', 'admin'],
    get: ['super_admin', 'admin'],
    create: ['super_admin', 'admin'],
    update: ['super_admin', 'admin'],
    delete: ['super_admin'], // فقط السوبر أدمن
    toggle: ['super_admin', 'admin'],
  },
  news: {
    list: ['super_admin', 'admin', 'editor', 'any'],
    get: ['super_admin', 'admin', 'editor', 'any'],
    create: ['super_admin', 'admin', 'editor'],
    update: ['super_admin', 'admin', 'editor'],
    delete: ['super_admin', 'admin', 'editor'], // المحرر يستطيع الحذف
  },

  events: {
    list: ['super_admin', 'admin', 'editor', 'any'],
    get: ['super_admin', 'admin', 'editor', 'any'],
    create: ['super_admin', 'admin', 'editor'],
    update: ['super_admin', 'admin', 'editor'],
    delete: ['super_admin', 'admin', 'editor'], // المحرر يستطيع الحذف
  },
  programs: {
    list: ['super_admin', 'admin', 'editor', 'any'],
    get: ['super_admin', 'admin', 'editor', 'any'],
    create: ['super_admin', 'admin', 'editor'],
    update: ['super_admin', 'admin', 'editor'],
    delete: ['super_admin', 'admin', 'editor'], // المحرر يستطيع الحذف
    togglePublish: ['super_admin', 'admin', 'editor'],
  },
  gallery: {
    list: ['super_admin', 'admin', 'editor', 'any'],
    get: ['super_admin', 'admin', 'editor', 'any'],
    create: ['super_admin', 'admin', 'editor'],
    update: ['super_admin', 'admin', 'editor'],
    delete: ['super_admin', 'admin', 'editor'], // المحرر يستطيع الحذف
    addPhotos: ['super_admin', 'admin', 'editor'],
    removePhoto: ['super_admin', 'admin', 'editor'],
    reorderPhotos: ['super_admin', 'admin', 'editor'],
  },
  settings: {
    get: ['super_admin', 'admin', 'editor', 'any'],
    update: ['super_admin', 'admin'],
  },
  volunteers: {
    list: ['super_admin', 'admin'],
    get: ['super_admin', 'admin'],
    review: ['super_admin', 'admin'],
    delete: ['super_admin', 'admin'],
    export: ['super_admin', 'admin'],
    stats: ['super_admin', 'admin', 'editor'],
  },
  translations: {
    list: ['super_admin', 'admin'],
    get: ['super_admin', 'admin'],
    create: ['super_admin', 'admin'],
    update: ['super_admin', 'admin'],
    delete: ['super_admin', 'admin'],
    bulk: ['super_admin', 'admin'],
  },
  ticker: {
    list: ['super_admin', 'admin', 'any'],
    get: ['super_admin', 'admin', 'any'],
    create: ['super_admin', 'admin', 'editor'],
    update: ['super_admin', 'admin', 'editor'],
    delete: ['super_admin', 'admin', 'editor'],
    bulk: ['super_admin', 'admin', 'editor'],
  },
  students: {
    list: ['super_admin', 'admin', 'editor'],
    get: ['super_admin', 'admin', 'editor'],
    create: ['super_admin', 'admin'],
    update: ['super_admin', 'admin'],
    delete: ['super_admin', 'admin'],
    export: ['super_admin', 'admin'],
  },
  media: {
    list: ['super_admin', 'admin', 'editor'],
    get: ['super_admin', 'admin', 'editor'],
    create: ['super_admin', 'admin', 'editor'],
    update: ['super_admin', 'admin', 'editor'],
    delete: ['super_admin', 'admin', 'editor'], // المحرر يستطيع الحذف
    upload: ['super_admin', 'admin', 'editor'],
    uploadMultiple: ['super_admin', 'admin', 'editor'],
  },
  forms: {
    list: ['super_admin', 'admin', 'editor'],
    get: ['super_admin', 'admin', 'editor', 'any'],
    create: ['super_admin', 'admin', 'editor'],
    update: ['super_admin', 'admin', 'editor'],
    delete: ['super_admin', 'admin', 'editor'], // المحرر يستطيع الحذف
  },
  faq: {
    list: ['super_admin', 'admin', 'editor', 'any'],
    get: ['super_admin', 'admin', 'editor', 'any'],
    create: ['super_admin', 'admin', 'editor'],
    update: ['super_admin', 'admin', 'editor'],
    delete: ['super_admin', 'admin', 'editor'],
  },
  achievements: {
    list: ['super_admin', 'admin', 'editor', 'any'],
    get: ['super_admin', 'admin', 'editor', 'any'],
    create: ['super_admin', 'admin', 'editor'],
    update: ['super_admin', 'admin', 'editor'],
    delete: ['super_admin', 'admin', 'editor'],
  },
};
