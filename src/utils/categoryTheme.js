// src/utils/categoryTheme.js
// Morning Paper theme — one unique color story per category

export const CATEGORY_THEMES = {
  // 1. Clinic & Healthcare — Orchid Care
  healthcare: {
    name: 'Orchid Care',
    sidebar: '#F1E6FF',
    body: '#FDFAFF',
    accent: '#7B2D8B',
    pop: '#F72585',
    text: '#2D0A3D',
    sidebarText: '#2D0A3D',
    sidebarDark: false,
    cardBorder: 'rgba(123,45,139,0.12)',
    activeNavBg: 'rgba(123,45,139,0.10)',
    accentAlpha: 'rgba(123,45,139,',
  },
  clinic: { $ref: 'healthcare' },

  // 2. Restaurant & Food — Café Latte
  restaurant: {
    name: 'Café Latte',
    sidebar: '#EDE0D4',
    body: '#FAF5F0',
    accent: '#9C6644',
    pop: '#3C1518',
    text: '#1A0808',
    sidebarText: '#1A0808',
    sidebarDark: false,
    cardBorder: 'rgba(156,102,68,0.15)',
    activeNavBg: 'rgba(156,102,68,0.10)',
    accentAlpha: 'rgba(156,102,68,',
  },
  food: { $ref: 'restaurant' },

  // 3. Real Estate — Slate & Rose
  realestate: {
    name: 'Slate & Rose',
    sidebar: '#4A4E69',
    body: '#F2F2F7',
    accent: '#C9ADA7',
    pop: '#F2E9E4',
    text: '#1A1C26',
    sidebarText: '#F2E9E4',
    sidebarDark: true,
    cardBorder: 'rgba(74,78,105,0.14)',
    activeNavBg: 'rgba(242,233,228,0.14)',
    accentAlpha: 'rgba(201,173,167,',
  },

  // 4. Education — Amber Scholar
  education: {
    name: 'Amber Scholar',
    sidebar: '#7B4F12',
    body: '#FFF9EF',
    accent: '#F4A11A',
    pop: '#E63946',
    text: '#3A2006',
    sidebarText: '#FFF9EF',
    sidebarDark: true,
    cardBorder: 'rgba(123,79,18,0.14)',
    activeNavBg: 'rgba(255,249,239,0.14)',
    accentAlpha: 'rgba(244,161,26,',
  },
  coaching: { $ref: 'education' },

  // 5. Salon & Spa — Rose Blush
  salon: {
    name: 'Rose Blush',
    sidebar: '#F8D7DA',
    body: '#FFF5F7',
    accent: '#C9184A',
    pop: '#FF4D6D',
    text: '#5A0A1E',
    sidebarText: '#5A0A1E',
    sidebarDark: false,
    cardBorder: 'rgba(201,24,74,0.12)',
    activeNavBg: 'rgba(201,24,74,0.08)',
    accentAlpha: 'rgba(201,24,74,',
  },
  spa: { $ref: 'salon' },

  // 6. Gym & Fitness — Aqua Athlete
  fitness: {
    name: 'Aqua Athlete',
    sidebar: '#E0F2FE',
    body: '#F0F9FF',
    accent: '#0369A1',
    pop: '#7C3AED',
    text: '#012B4A',
    sidebarText: '#012B4A',
    sidebarDark: false,
    cardBorder: 'rgba(3,105,161,0.12)',
    activeNavBg: 'rgba(3,105,161,0.08)',
    accentAlpha: 'rgba(3,105,161,',
  },
  gym: { $ref: 'fitness' },

  // 7. Legal & Law Firm — Leather Bound
  legal: {
    name: 'Leather Bound',
    sidebar: '#FAF0E6',
    body: '#FDFAF6',
    accent: '#8B4513',
    pop: '#D2691E',
    text: '#2A1006',
    sidebarText: '#2A1006',
    sidebarDark: false,
    cardBorder: 'rgba(139,69,19,0.12)',
    activeNavBg: 'rgba(139,69,19,0.08)',
    accentAlpha: 'rgba(139,69,19,',
  },
  law: { $ref: 'legal' },
  insurance: { $ref: 'legal' },

  // 8. Travel & Tourism — Aurora
  travel: {
    name: 'Aurora',
    sidebar: '#6A0572',
    body: '#FDF4FF',
    accent: '#AB83A1',
    pop: '#F9A8D4',
    text: '#2A0030',
    sidebarText: '#FDF4FF',
    sidebarDark: true,
    cardBorder: 'rgba(106,5,114,0.12)',
    activeNavBg: 'rgba(253,244,255,0.14)',
    accentAlpha: 'rgba(171,131,161,',
  },
  tourism: { $ref: 'travel' },

  // 9. Construction & Architecture — Sandstone
  construction: {
    name: 'Sandstone',
    sidebar: '#F5F0EB',
    body: '#FDFBF9',
    accent: '#7A6652',
    pop: '#D4A853',
    text: '#2A2018',
    sidebarText: '#2A2018',
    sidebarDark: false,
    cardBorder: 'rgba(122,102,82,0.12)',
    activeNavBg: 'rgba(122,102,82,0.08)',
    accentAlpha: 'rgba(122,102,82,',
  },
  architecture: { $ref: 'construction' },
  homeservice: { $ref: 'construction' },

  // 10. Finance & Accounting — Private Wealth
  finance: {
    name: 'Private Wealth',
    sidebar: '#F8F6F2',
    body: '#FFFFFF',
    accent: '#B5985A',
    pop: '#1C1C1C',
    text: '#1C1C1C',
    sidebarText: '#1C1C1C',
    sidebarDark: false,
    cardBorder: 'rgba(181,152,90,0.15)',
    activeNavBg: 'rgba(181,152,90,0.08)',
    accentAlpha: 'rgba(181,152,90,',
  },
  accounting: { $ref: 'finance' },

  // 11. Automobile & Garage — Racing Red
  automobile: {
    name: 'Racing Red',
    sidebar: '#1A1A1A',
    body: '#F8F8F8',
    accent: '#DC2626',
    pop: '#C0C0C0',
    text: '#1A1A1A',
    sidebarText: '#F8F8F8',
    sidebarDark: true,
    cardBorder: 'rgba(26,26,26,0.10)',
    activeNavBg: 'rgba(220,38,38,0.10)',
    accentAlpha: 'rgba(220,38,38,',
  },
  auto: { $ref: 'automobile' },
  garage: { $ref: 'automobile' },
}

const DEFAULT = CATEGORY_THEMES.healthcare

export function getTheme(category) {
  if (!category) return DEFAULT
  const key = category.toLowerCase()
  const entry = CATEGORY_THEMES[key]
  if (!entry) return DEFAULT
  if (entry.$ref) return CATEGORY_THEMES[entry.$ref] || DEFAULT
  return entry
}

export function applyTheme(category) {
  const t = getTheme(category)
  const r = document.documentElement
  r.style.setProperty('--mp-sidebar',      t.sidebar)
  r.style.setProperty('--mp-body',         t.body)
  r.style.setProperty('--mp-accent',       t.accent)
  r.style.setProperty('--mp-pop',          t.pop)
  r.style.setProperty('--mp-text',         t.text)
  r.style.setProperty('--mp-sidebar-text', t.sidebarText)
  r.style.setProperty('--mp-card-border',  t.cardBorder)
  r.style.setProperty('--mp-nav-bg',       t.activeNavBg)
  r.style.setProperty('--mp-a10',          t.accentAlpha + '0.10)')
  r.style.setProperty('--mp-a20',          t.accentAlpha + '0.20)')
  r.style.setProperty('--mp-a05',          t.accentAlpha + '0.05)')
  return t
}