import { parse } from 'node-html-parser';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'screens');
const OUT = path.join(ROOT, 'site');
const imageMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'build/image-map.json'), 'utf8'));
const imageDims = JSON.parse(fs.readFileSync(path.join(ROOT, 'build/image-dims.json'), 'utf8'));

// Inject intrinsic width/height on <img src="assets/images/…"> to reserve space (CLS)
function withImageDims(html) {
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    if (/\bwidth=/.test(tag)) return tag;
    const m = tag.match(/src="(assets\/images\/[^"]+)"/);
    if (!m || !imageDims[m[1]]) return tag;
    const { w, h } = imageDims[m[1]];
    return tag.replace(/<img\b/, `<img width="${w}" height="${h}"`);
  });
}

// ============================================================================
//  SEO / Local-SEO configuration  (Erode geography)
//  NOTE: values marked TODO are placeholders — replace with the hospital's real
//  registered details before launch for correct local ranking / NAP consistency.
// ============================================================================
const BASE_URL = 'https://www.thamaraihospital.com'; // TODO: live domain
const BUILD_DATE = '2026-07-27';                      // sitemap <lastmod>
const BUSINESS = {
  name: 'Thamarai Multispeciality Hospital',
  url: BASE_URL,
  logo: BASE_URL + '/favicon.svg',
  telephone: '+91-424-1234567',
  emergencyTelephone: '1066',
  email: 'care@thamaraihospital.com',      // TODO confirm
  street: '123 Healthcare Way',            // TODO real street address
  locality: 'Erode',
  region: 'Tamil Nadu',
  regionCode: 'IN-TN',
  postalCode: '638001',                    // TODO confirm
  country: 'IN',
  lat: 11.3410,
  lng: 77.7172,
  foundingYear: '2004',
  priceRange: '₹₹',
  areaServed: ['Erode', 'Perundurai', 'Bhavani', 'Gobichettipalayam', 'Kodumudi', 'Sathyamangalam', 'Chennimalai', 'Anthiyur'],
  specialties: ['Cardiology', 'Orthopaedics', 'Neurology', 'General Medicine', 'Pediatrics', 'ENT', 'Dermatology', 'Gynecology', 'Urology', 'Pulmonology', 'Emergency Medicine', 'Diagnostic Radiology'],
  sameAs: [], // TODO: Google Business Profile, Facebook, Instagram, LinkedIn URLs
};

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const absUrl = (out) => (out === 'index.html' ? `${BASE_URL}/` : `${BASE_URL}/${out}`);
const absImg = (src) => (src && src.startsWith('assets/') ? `${BASE_URL}/${src}` : src);

// The reusable postal-address + geo block shared by all schema nodes
const POSTAL_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: BUSINESS.street,
  addressLocality: BUSINESS.locality,
  addressRegion: BUSINESS.region,
  postalCode: BUSINESS.postalCode,
  addressCountry: BUSINESS.country,
};
const GEO = { '@type': 'GeoCoordinates', latitude: BUSINESS.lat, longitude: BUSINESS.lng };

// Full Hospital (LocalBusiness) node — the primary local-SEO signal
function hospitalSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Hospital',
    '@id': `${BASE_URL}/#hospital`,
    name: BUSINESS.name,
    url: BASE_URL,
    logo: BUSINESS.logo,
    image: absImg('assets/images/' + (imageMap[Object.keys(imageMap)[0]] || '')),
    telephone: BUSINESS.telephone,
    email: BUSINESS.email,
    priceRange: BUSINESS.priceRange,
    foundingDate: BUSINESS.foundingYear,
    address: POSTAL_ADDRESS,
    geo: GEO,
    hasMap: `https://www.google.com/maps/search/?api=1&query=${BUSINESS.lat},${BUSINESS.lng}`,
    areaServed: BUSINESS.areaServed.map((n) => ({ '@type': 'City', name: n })),
    availableService: BUSINESS.specialties.map((s) => ({ '@type': 'MedicalProcedure', name: s })),
    medicalSpecialty: BUSINESS.specialties,
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00', closes: '23:59',
    }],
    numberOfBeds: 150,
    sameAs: BUSINESS.sameAs.length ? BUSINESS.sameAs : undefined,
  };
}

function breadcrumbSchema(crumbs, currentName, currentOut) {
  const items = [{ name: 'Home', out: 'index.html' }, ...(crumbs || []), { name: currentName, out: currentOut }];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absUrl(c.out),
    })),
  };
}

function physicianSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: 'Dr. K. Ramasamy',
    url: absUrl('doctor-ramasamy.html'),
    medicalSpecialty: 'Cardiovascular',
    availableService: [
      { '@type': 'MedicalProcedure', name: 'Interventional Cardiology' },
      { '@type': 'MedicalProcedure', name: 'Complex Angioplasty' },
      { '@type': 'MedicalProcedure', name: 'Pacemaker Implantation' },
    ],
    memberOf: { '@type': 'Hospital', '@id': `${BASE_URL}/#hospital`, name: BUSINESS.name },
    worksFor: { '@type': 'Hospital', '@id': `${BASE_URL}/#hospital`, name: BUSINESS.name },
    address: POSTAL_ADDRESS,
    areaServed: BUSINESS.areaServed.map((n) => ({ '@type': 'City', name: n })),
  };
}

function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

// prune undefined so JSON-LD stays clean
const clean = (o) => JSON.parse(JSON.stringify(o));
const jsonld = (obj) => `<script type="application/ld+json">\n${JSON.stringify(clean(obj))}\n</script>`;

// ---- Site model -------------------------------------------------------------
const NAV = [
  { key: 'home', label: 'Home', href: 'index.html' },
  { key: 'departments', label: 'Specialities', href: 'departments.html' },
  { key: 'doctors', label: 'Doctors', href: 'doctors.html' },
  { key: 'packages', label: 'Health Packages', href: 'health-packages.html' },
  { key: 'about', label: 'About', href: 'about.html' },
  { key: 'contact', label: 'Contact', href: 'contact.html' },
];

const PAGES = [
  { src: '01-home', out: 'index.html', active: 'home', crumbs: [], schema: ['hospital'],
    title: 'Best Multispeciality Hospital in Erode | Thamarai — 24/7 Care',
    desc: 'Thamarai Multispeciality Hospital in Erode: 150 beds, 35+ specialist doctors and 24/7 emergency care in cardiology, orthopaedics, neurology & more. Book online.' },
  { src: '02-about-us', out: 'about.html', active: 'about', crumbs: [], name: 'About Us',
    buttonNav: [{ re: /our services/i, dest: 'departments.html' }, { re: /meet our doctors/i, dest: 'doctors.html' }],
    title: 'About Thamarai — Trusted Hospital in Erode, Tamil Nadu',
    desc: 'For over two decades, Thamarai Multispeciality Hospital has delivered compassionate, technology-driven healthcare to Erode and surrounding districts. Learn our story.' },
  { src: '04-departments', out: 'departments.html', active: 'departments', crumbs: [], name: 'Departments',
    title: 'Departments & Specialities | Hospital in Erode | Thamarai',
    desc: 'Explore Thamarai Hospital Erode’s centres of excellence — cardiology, orthopaedics, neurology, paediatrics, ENT, gynaecology and more. Find the right care.' },
  { src: '05-cardiology', out: 'cardiology.html', active: 'departments', name: 'Cardiology',
    crumbs: [{ name: 'Departments', out: 'departments.html' }],
    title: 'Best Cardiology Hospital in Erode | Thamarai Heart Care',
    desc: 'Advanced heart care in Erode at Thamarai: non-invasive diagnostics, interventional cardiology, angioplasty and expert cardiologists. Book a consultation today.' },
  { src: '06-find-a-doctor', out: 'doctors.html', active: 'doctors', crumbs: [], name: 'Find a Doctor',
    title: 'Find a Doctor in Erode | Thamarai Specialist Doctors',
    desc: 'Search and book from 35+ specialist doctors across every department at Thamarai Multispeciality Hospital, Erode. Filter by speciality and experience.' },
  { src: '07-doctor-profile-ramasamy', out: 'doctor-ramasamy.html', active: 'doctors', name: 'Dr. K. Ramasamy', schema: ['physician'],
    crumbs: [{ name: 'Doctors', out: 'doctors.html' }],
    title: 'Dr. K. Ramasamy — Cardiologist in Erode | Thamarai',
    desc: 'Dr. K. Ramasamy, Senior Interventional Cardiologist in Erode with 20+ years’ experience. MBBS, MD, DM (Cardiology). View profile and book a consultation.' },
  { src: '08-book-appointment', out: 'book-appointment.html', active: null, crumbs: [], name: 'Book Appointment',
    title: 'Book Doctor Appointment in Erode | Thamarai Hospital',
    desc: 'Book an appointment online with a specialist at Thamarai Multispeciality Hospital, Erode. Fast, simple and secure — choose your department, doctor and time.' },
  { src: '09-health-checkup-packages', out: 'health-packages.html', active: 'packages', extra: 'health-packages-extra.html', crumbs: [], name: 'Health Packages', schema: ['faq-packages'],
    title: 'Health Checkup Packages in Erode | Thamarai Hospital',
    desc: 'Affordable preventive health checkup packages in Erode — full body, cardiac, diabetic, women’s wellness and senior citizen screenings at Thamarai Hospital.' },
  { src: '10-diagnostics-lab', out: 'diagnostics.html', active: null, crumbs: [], name: 'Diagnostics & Lab',
    title: 'Diagnostics & Lab in Erode | Thamarai Hospital',
    desc: 'Accredited diagnostics and laboratory services in Erode — pathology, digital X-ray, ultrasound, CT and MRI imaging with accurate, timely reports at Thamarai.' },
  { src: '11-emergency', out: 'emergency.html', active: null, crumbs: [], name: '24/7 Emergency',
    title: '24/7 Emergency Hospital in Erode | Thamarai — Call 1066',
    desc: 'Round-the-clock emergency and Level 1 trauma care in Erode. Rapid-response ambulances and specialist teams on standby at Thamarai Hospital. Call 1066 now.' },
  { src: '12-blog', out: 'blog.html', active: null, crumbs: [], name: 'Blog',
    title: 'Health & Wellness Blog | Thamarai Hospital, Erode',
    desc: 'Expert health tips, wellness guidance and medical insights from the specialists at Thamarai Multispeciality Hospital, Erode. Heart health, diabetes, nutrition & more.' },
  { src: '13-contact-us', out: 'contact.html', active: 'contact', crumbs: [], name: 'Contact', schema: ['hospital'],
    title: 'Contact Thamarai Hospital, Erode | Phone & Directions',
    desc: 'Contact Thamarai Multispeciality Hospital, Erode — address, phone, email and directions. General enquiries and 24/7 emergency support. We are here to help.' },
];

// text-of-link -> destination, for rewriting in-content href="#" anchors
const LINKMAP = [
  [/book\s*(an\s*)?appointment|book\s*now|schedule\s*(a\s*)?visit|request\s*(an\s*)?appointment/, 'book-appointment.html'],
  [/find\s*(a\s*)?doctor|find\s*doctors|all\s*doctors|our\s*doctors|browse\s*doctors|view\s*(all\s*)?doctors|meet\s*(the\s*|our\s*)?doctors/, 'doctors.html'],
  [/all\s*specialit|view\s*(all\s*)?specialit|explore\s*(our\s*)?department|all\s*department|view\s*(all\s*)?department|our\s*department|browse\s*(our\s*)?department/, 'departments.html'],
  [/book\s*(a\s*)?(test|scan|health\s*check)/, 'book-appointment.html'],
  [/cardiology/, 'cardiology.html'],
  [/^\s*emergency|emergency\s*care|24\/?7/, 'emergency.html'],
  [/health\s*(checkup\s*)?package|checkup\s*package|view\s*(all\s*)?package|explore\s*package/, 'health-packages.html'],
  [/diagnostic|laborator|book\s*a?\s*test|lab\s*test/, 'diagnostics.html'],
  [/contact\s*us|contact/, 'contact.html'],
  [/about\s*us|about\s*thamarai|read\s*more\s*about/, 'about.html'],
  [/blog|wellness|health\s*tips|read\s*(more\s*)?articles?/, 'blog.html'],
  [/^\s*home\s*$/, 'index.html'],
  // bare single-word CTA labels (home quick-access cards, etc.)
  [/^appointments?$/, 'book-appointment.html'],
  [/^doctors?$/, 'doctors.html'],
  [/^packages?$/, 'health-packages.html'],
  [/^insurance$/, 'contact.html'],
];

function destForText(t) {
  const s = (t || '').trim().toLowerCase();
  if (!s) return null;
  for (const [re, dest] of LINKMAP) if (re.test(s)) return dest;
  return null;
}

// Generic CTA labels whose destination must come from the nearest heading
const GENERIC_CTA = /^(know more|learn more|read more|read full article|view profile|view details|view more|explore|see details|see more)\b/i;
// Map a card's heading text to a detail page (only pages that actually exist)
const HEADING_DEST = [
  [/dr\.?\s*k\.?\s*ramasamy/i, 'doctor-ramasamy.html'],
  [/\bcardiology\b/i, 'cardiology.html'],
];
function headingDest(t) {
  for (const [re, d] of HEADING_DEST) if (re.test(t || '')) return d;
  return null;
}
// Anchor text with Material Symbols icon ligatures stripped out
function cleanAnchorText(a) {
  const parts = [];
  (function walk(node) {
    (node.childNodes || []).forEach((c) => {
      if (c.nodeType === 3) parts.push(c.rawText || c.text || '');
      else if (c.nodeType === 1) {
        const cls = (c.getAttribute && c.getAttribute('class')) || '';
        if (cls.includes('material-symbols')) return;
        walk(c);
      }
    });
  })(a);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
function nearestHeadingText(a) {
  let p = a;
  for (let i = 0; i < 5 && p; i++) {
    p = p.parentNode;
    if (p && p.querySelector) {
      const h = p.querySelector('h1,h2,h3,h4');
      if (h) return h.text.trim();
    }
  }
  return '';
}

// Normalize US-format placeholder contact details for the Erode hospital
function normalizeContent(html) {
  return html
    .replace(/\+?1 \(800\) 911-HELP/g, '1066')
    .replace(/\+?1 \(800\) 555-0199/g, '0424-1234567')
    .replace(/\+?1 \(555\) 000-0000/g, '+91 98765 43210')
    .replace(/tel:\+?1800911[0-9A-Za-z]*/g, 'tel:1066')
    .replace(/tel:\+?18005550199/g, 'tel:04241234567');
}

// ---- Partials ---------------------------------------------------------------
const BRAND = `
      <a class="flex items-center gap-2 shrink-0" href="index.html" aria-label="Thamarai Multispeciality Hospital home">
        <span class="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary shrink-0">
          <span class="material-symbols-outlined text-[20px]">health_and_safety</span>
        </span>
        <span class="font-headline-sm text-headline-sm font-bold text-primary leading-none whitespace-nowrap">Thamarai <span class="font-normal text-on-surface-variant hidden xl:inline">Multispeciality</span></span>
      </a>`;

function header(active) {
  const desktopLinks = NAV.map((n) => {
    const on = n.key === active;
    const cls = on
      ? 'text-primary font-bold border-b-2 border-primary'
      : 'text-on-surface-variant hover:text-primary border-b-2 border-transparent';
    return `<a class="font-label-md text-label-md px-1 pb-1 transition-colors whitespace-nowrap ${cls}" href="${n.href}"${on ? ' aria-current="page"' : ''}>${n.label}</a>`;
  }).join('\n          ');

  const drawerLinks = NAV.map((n) => {
    const on = n.key === active;
    return `<a class="block px-4 py-3 rounded-lg font-label-md text-label-md ${on ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-low'}" href="${n.href}"${on ? ' aria-current="page"' : ''}>${n.label}</a>`;
  }).join('\n        ');

  return `<header class="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 clinical-shadow">
    <div class="flex justify-between items-center w-full px-margin-mobile md:px-8 2xl:px-margin-desktop max-w-container-max mx-auto h-20 gap-4">
      ${BRAND}
      <nav class="hidden md:flex items-center gap-4 lg:gap-5" aria-label="Primary">
          ${desktopLinks}
      </nav>
      <div class="hidden lg:flex items-center gap-3 shrink-0">
        <a class="hidden xl:flex items-center gap-1.5 text-error font-label-md text-label-md hover:underline whitespace-nowrap" href="tel:04241234567" aria-label="Emergency, call 0424 1234567">
          <span class="material-symbols-outlined text-[18px]">phone_in_talk</span>
          0424-1234567
        </a>
        <a class="bg-primary hover:bg-primary/90 text-on-primary px-5 py-2.5 rounded-lg font-label-md text-label-md transition-colors shadow-sm whitespace-nowrap" href="book-appointment.html">Book Appointment</a>
      </div>
      <button class="md:hidden text-on-surface-variant p-2 -mr-2" data-nav-toggle aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">
        <span class="material-symbols-outlined">menu</span>
      </button>
    </div>
  </header>

  <!-- Mobile drawer (kept OUTSIDE <header> so fixed positioning resolves against the viewport,
       not the header's backdrop-filter containing block) -->
  <div class="fixed inset-0 z-[60] bg-inverse-surface/40 hidden md:hidden" data-nav-backdrop></div>
  <aside id="mobile-nav" class="fixed top-0 right-0 z-[70] h-full w-4/5 max-w-xs bg-surface shadow-xl translate-x-full transition-transform duration-300 md:hidden flex flex-col" data-nav-drawer aria-label="Mobile">
    <div class="flex items-center justify-between h-20 px-margin-mobile border-b border-outline-variant/30 shrink-0">
      <span class="font-headline-sm text-headline-sm font-bold text-primary">Menu</span>
      <button class="text-on-surface-variant p-2 -mr-2" data-nav-close aria-label="Close menu">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <nav class="flex flex-col gap-1 p-4 overflow-y-auto flex-1" aria-label="Mobile primary">
      ${drawerLinks}
    </nav>
    <div class="mt-auto p-4 border-t border-outline-variant/30 flex flex-col gap-3 shrink-0">
      <a class="flex items-center justify-center gap-2 text-error font-label-md text-label-md" href="tel:04241234567">
        <span class="material-symbols-outlined text-[18px]">phone_in_talk</span> Emergency: 0424-1234567
      </a>
      <a class="bg-primary text-on-primary text-center px-6 py-3 rounded-lg font-label-md text-label-md" href="book-appointment.html">Book Appointment</a>
    </div>
  </aside>`;
}

const FOOTER = `<footer class="bg-surface-container-highest border-t border-outline-variant mt-20">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <span class="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <span class="material-symbols-outlined text-[20px]">health_and_safety</span>
          </span>
          <span class="font-headline-sm text-headline-sm font-bold text-primary">Thamarai Multispeciality</span>
        </div>
        <p class="font-body-md text-body-md text-on-surface-variant max-w-xs">Committed to delivering compassionate, high-quality healthcare to Erode and surrounding districts.</p>
        <div class="flex flex-col gap-1 text-body-md text-on-surface-variant">
          <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-primary">location_on</span> Erode, Tamil Nadu</span>
          <a class="flex items-center gap-2 hover:text-primary" href="tel:04241234567"><span class="material-symbols-outlined text-[18px] text-primary">call</span> 0424-1234567</a>
        </div>
      </div>
      <div class="flex flex-col gap-3">
        <h4 class="font-label-md text-label-md font-bold text-on-surface mb-1">Care</h4>
        <a class="footer-link" href="departments.html">Departments</a>
        <a class="footer-link" href="cardiology.html">Cardiology</a>
        <a class="footer-link" href="diagnostics.html">Diagnostics &amp; Lab</a>
        <a class="footer-link" href="emergency.html">24/7 Emergency</a>
      </div>
      <div class="flex flex-col gap-3">
        <h4 class="font-label-md text-label-md font-bold text-on-surface mb-1">Patients</h4>
        <a class="footer-link" href="doctors.html">Find a Doctor</a>
        <a class="footer-link" href="book-appointment.html">Book Appointment</a>
        <a class="footer-link" href="health-packages.html">Health Packages</a>
        <a class="footer-link" href="blog.html">Health &amp; Wellness Blog</a>
      </div>
      <div class="flex flex-col gap-3">
        <h4 class="font-label-md text-label-md font-bold text-on-surface mb-1">Hospital</h4>
        <a class="footer-link" href="about.html">About Us</a>
        <a class="footer-link" href="contact.html">Contact Us</a>
        <a class="footer-link" href="emergency.html">Emergency Care</a>
      </div>
    </div>
    <div class="border-t border-outline-variant/50 py-6 px-margin-mobile md:px-margin-desktop text-center">
      <p class="font-caption text-caption text-on-surface-variant">© <span data-current-year>2025</span> Thamarai Multispeciality Hospital. All rights reserved. Erode, Tamil Nadu.</p>
    </div>
  </footer>`;

const FAVICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#00685f"/><path d="M16 7v18M7 16h18" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></svg>`
  );

// ---------------------------------------------------------------------------
//  Interactive content: doctors directory + department categories
// ---------------------------------------------------------------------------
const DEPT_CATEGORY = {
  Cardiology: 'Medical', Orthopaedics: 'Surgical', Neurology: 'Medical',
  'General Medicine': 'Medical', Pediatrics: 'Medical', ENT: 'Surgical',
  Dermatology: 'Medical', Gynecology: 'Surgical', Urology: 'Surgical',
  Pulmonology: 'Medical', 'Emergency Medicine': 'Medical', Emergency: 'Medical',
  Diagnostics: 'Diagnostic',
};

const DOCTORS = [
  { name: 'Dr. K. Ramasamy', dept: 'Cardiology', quals: 'MBBS, MD, DM Cardiology', role: 'Senior Interventional Cardiologist', exp: 20, langs: 'English, Tamil, Hindi', photo: 'assets/images/img-1be8b8a1d1ff.jpg', profile: 'doctor-ramasamy.html' },
  { name: 'Dr. Priya Natarajan', dept: 'Orthopaedics', quals: 'MS (Ortho), DNB', role: 'Consultant Orthopaedic Surgeon', exp: 12, langs: 'English, Tamil', photo: 'assets/images/img-b39afac445af.jpg' },
  { name: 'Dr. Arvind Swamy', dept: 'Pediatrics', quals: 'MD (Pediatrics)', role: 'Chief Pediatrician & Neonatologist', exp: 15, langs: 'English, Tamil, Telugu', photo: 'assets/images/img-bec8bf30ee40.jpg' },
  { name: 'Dr. R. Meenakshi', dept: 'Neurology', quals: 'MBBS, MD, DM (Neurology)', role: 'Consultant Neurologist', exp: 14, langs: 'English, Tamil' },
  { name: 'Dr. S. Karthik', dept: 'General Medicine', quals: 'MBBS, MD (General Medicine)', role: 'Senior Consultant Physician', exp: 18, langs: 'English, Tamil, Hindi' },
  { name: 'Dr. Lakshmi Devi', dept: 'Gynecology', quals: 'MBBS, MS (OBG)', role: 'Consultant Gynaecologist & Obstetrician', exp: 16, langs: 'English, Tamil' },
  { name: 'Dr. Vijay Anand', dept: 'ENT', quals: 'MBBS, MS (ENT)', role: 'Consultant ENT Surgeon', exp: 11, langs: 'English, Tamil' },
  { name: 'Dr. Deepa Ravi', dept: 'Dermatology', quals: 'MBBS, MD (DVL)', role: 'Consultant Dermatologist', exp: 9, langs: 'English, Tamil, Malayalam' },
  { name: 'Dr. Ganesh Kumar', dept: 'Urology', quals: 'MBBS, MS, MCh (Urology)', role: 'Consultant Urologist', exp: 13, langs: 'English, Tamil' },
  { name: 'Dr. Anitha Selvam', dept: 'Pulmonology', quals: 'MBBS, MD (Pulmonology)', role: 'Consultant Pulmonologist', exp: 8, langs: 'English, Tamil' },
  { name: 'Dr. Mohan Raj', dept: 'Cardiology', quals: 'MBBS, MD, DM (Cardiology)', role: 'Consultant Cardiologist', exp: 7, langs: 'English, Tamil' },
  { name: 'Dr. Saranya Prakash', dept: 'General Medicine', quals: 'MBBS, MD', role: 'Consultant Physician', exp: 6, langs: 'English, Tamil' },
];

const slugify = (s) => s.toLowerCase().replace(/dr\.?\s*/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const initials = (name) => name.replace(/dr\.?\s*/i, '').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

function doctorAvatar(d) {
  if (d.photo) {
    return `<div class="w-24 h-24 rounded-full overflow-hidden shrink-0 border-2 border-surface-variant">
        <img alt="${esc(d.name)}, ${esc(d.dept)} at Thamarai Hospital Erode" class="w-full h-full object-cover" src="${d.photo}" loading="lazy" decoding="async" />
      </div>`;
  }
  return `<div class="w-24 h-24 rounded-full shrink-0 border-2 border-primary/20 bg-primary/10 text-primary flex items-center justify-center font-headline-sm text-headline-sm" aria-hidden="true">${initials(d.name)}</div>`;
}

function doctorCard(d) {
  const bookHref = `book-appointment.html?doctor=${encodeURIComponent(d.name)}&department=${encodeURIComponent(d.dept)}`;
  const profileBtn = d.profile
    ? `<a class="block text-center w-full bg-surface border border-primary text-primary hover:bg-primary hover:text-on-primary py-2.5 rounded-lg font-label-md text-label-md transition-colors mt-auto" href="${d.profile}">View Profile</a>`
    : '';
  return `<article class="bg-surface-container-lowest rounded-xl p-6 clinical-shadow clinical-shadow-hover transition-all-custom flex flex-col h-full border border-surface-variant"
      data-fitem="doctors" data-name="${esc(d.name)}" data-dept="${esc(d.dept)}" data-exp="${d.exp}" data-search="${esc(d.name + ' ' + d.dept + ' ' + d.role + ' ' + d.quals)}">
      <div class="flex items-start gap-4 mb-4">
        ${doctorAvatar(d)}
        <div>
          <span class="inline-block px-2 py-1 bg-primary/10 text-primary rounded font-caption text-caption mb-2">${esc(d.dept)}</span>
          <h3 class="font-headline-sm text-headline-sm text-on-surface">${esc(d.name)}</h3>
          <p class="font-body-md text-body-md text-on-surface-variant">${esc(d.quals)}</p>
        </div>
      </div>
      <div class="mb-4"><p class="font-label-md text-label-md text-primary font-medium">${esc(d.role)}</p></div>
      <div class="space-y-3 mb-6 flex-grow">
        <div class="flex items-center gap-3 text-on-surface-variant"><span class="material-symbols-outlined text-outline text-[20px]">work</span><span class="font-body-md text-sm">${d.exp}+ Years Experience</span></div>
        <div class="flex items-center gap-3 text-on-surface-variant"><span class="material-symbols-outlined text-outline text-[20px]">language</span><span class="font-body-md text-sm">${esc(d.langs)}</span></div>
        <div class="flex items-center gap-3 text-on-surface-variant"><span class="material-symbols-outlined text-outline text-[20px]">schedule</span><span class="font-body-md text-sm">Mon – Sat, 09:00 AM – 05:00 PM</span></div>
      </div>
      ${profileBtn}
      <a class="block text-center w-full bg-primary hover:bg-primary/90 text-on-primary py-2.5 rounded-lg font-label-md text-label-md transition-colors ${d.profile ? 'mt-3' : 'mt-auto'}" href="${bookHref}">Book Appointment</a>
    </article>`;
}

const FAQS = {
  'faq-packages': [
    { q: 'What is included in a full body health checkup at Thamarai Hospital, Erode?', a: 'Our Comprehensive Full Body package includes 60+ diagnostic parameters covering blood counts, liver, kidney and thyroid profiles, chest X-ray, ultrasound abdomen and a specialist consultation.' },
    { q: 'How much does a health checkup package cost in Erode?', a: 'Packages start from ₹1,499 for a Basic Health Check. Cardiac, diabetic, women’s wellness and senior citizen packages are also available. Please confirm current rates with our reception.' },
    { q: 'Do I need to fast before a health checkup?', a: 'For most packages that include blood sugar and lipid tests, 8–10 hours of fasting is recommended. Our team shares preparation instructions when you book.' },
    { q: 'How do I book a health checkup package at Thamarai?', a: 'Book online through our appointment page or call the hospital. Choose your package and preferred date, and we will confirm your slot.' },
  ],
};

// ---------------------------------------------------------------------------
//  Per-page interactive enhancements (data hooks for main.js, CTA wiring)
// ---------------------------------------------------------------------------
function hasAncestorTag(el, tagUpper) {
  let p = el.parentNode;
  while (p) { if ((p.tagName || '').toUpperCase() === tagUpper) return true; p = p.parentNode; }
  return false;
}

function normalizeChips(buttons, scope, valueFor) {
  buttons.forEach((b, i) => {
    const val = valueFor(b.text.trim());
    b.setAttribute('data-role', 'chip');
    b.setAttribute('data-fchip', scope);
    b.setAttribute('data-fval', val);
    b.setAttribute('class', 'filter-chip' + (i === 0 ? ' is-active' : ''));
    b.setAttribute('type', 'button');
  });
}

function enhancePage(container, page) {
  const out = page.out;

  // a11y: 'text-outline' (#6d7a77) is a border/icon tone that fails 4.5:1 as body text.
  // Upgrade it to 'on-surface-variant' on text-bearing elements (leave icons alone).
  container.querySelectorAll('.text-outline').forEach((el) => {
    const cls = el.getAttribute('class') || '';
    if (cls.includes('material-symbols')) return;
    el.setAttribute('class', cls.replace(/\btext-outline\b/g, 'text-on-surface-variant'));
  });

  const emptyState = (scope) =>
    `<p data-fempty="${scope}" class="hidden text-center text-body-lg text-on-surface-variant py-12">No results found. Try adjusting your search or filters.</p>`;

  // ---- Departments: filterable cards + wired "Know More" ----
  if (out === 'departments.html') {
    container.querySelectorAll('h3').forEach((h3) => {
      const name = h3.text.trim();
      if (!(name in DEPT_CATEGORY)) return;
      let card = h3;
      for (let i = 0; i < 4 && card.parentNode; i++) { card = card.parentNode; if (/rounded-xl/.test(card.getAttribute('class') || '')) break; }
      const desc = (card.querySelector('p') || { text: '' }).text.trim();
      card.setAttribute('data-fitem', 'departments');
      card.setAttribute('data-name', name);
      card.setAttribute('data-cat', DEPT_CATEGORY[name]);
      card.setAttribute('data-search', name + ' ' + desc);
      // Make the whole card a tap target (stretched link); keep "Know More" as a visual cue
      const dest = name === 'Cardiology' ? 'cardiology.html' : `doctors.html?department=${encodeURIComponent(name)}`;
      const ccls = card.getAttribute('class') || '';
      if (!/\brelative\b/.test(ccls)) card.setAttribute('class', ccls + ' relative');
      const btn = card.querySelector('button');
      if (btn) btn.replaceWith(`<span class="${btn.getAttribute('class') || ''}">${btn.innerHTML}</span>`);
      card.insertAdjacentHTML('beforeend', `<a class="absolute inset-0 z-[1]" href="${dest}" aria-label="${esc(name)} — learn more"></a>`);
    });
    const chips = container.querySelectorAll('button').filter((b) => /^(All|Surgical|Medical|Diagnostic)$/.test(b.text.trim()));
    normalizeChips(chips, 'departments', (t) => t);
    const search = container.querySelector('input');
    if (search) search.setAttribute('data-fsearch', 'departments');
    const firstCard = container.querySelectorAll('[data-fitem="departments"]')[0];
    if (firstCard && firstCard.parentNode) firstCard.parentNode.insertAdjacentHTML('afterend', emptyState('departments'));
  }

  // ---- Doctors: data-driven directory + search/select filters ----
  if (out === 'doctors.html') {
    const grid = container.querySelectorAll('div').find((d) => /grid/.test(d.getAttribute('class') || '') && d.querySelectorAll('article').length >= 2);
    if (grid) {
      grid.set_content(DOCTORS.map(doctorCard).join('\n'));
      grid.insertAdjacentHTML('afterend', emptyState('doctors'));
    }
    const search = container.querySelector('input');
    if (search) search.setAttribute('data-fsearch', 'doctors');
    const selects = container.querySelectorAll('select');
    if (selects[0]) selects[0].setAttribute('data-fselect', 'doctors:dept');
    if (selects[1]) selects[1].setAttribute('data-fselect', 'doctors:exp');
  }

  // ---- Blog: category chips filter article cards ----
  if (out === 'blog.html') {
    const CATS = ['Heart Health', 'Diabetes', 'Nutrition', "Women's Health", 'Children', 'Lifestyle'];
    container.querySelectorAll('article').forEach((art) => {
      art.setAttribute('data-fitem', 'blog');
      const badge = art.querySelectorAll('span, a').map((s) => s.text.trim()).find((t) => CATS.includes(t));
      art.setAttribute('data-cat', badge || '');
    });
    // featured post may not be an <article>
    container.querySelectorAll('[class*="grid"] > div, section > div').forEach((d) => {
      if (d.getAttribute('data-fitem')) return;
      const badge = d.querySelectorAll('span').map((s) => s.text.trim()).find((t) => CATS.includes(t));
      if (badge && d.querySelector('h2, h3')) { d.setAttribute('data-fitem', 'blog'); d.setAttribute('data-cat', badge); }
    });
    const chips = container.querySelectorAll('button').filter((b) => /^(All Articles|Heart Health|Diabetes|Nutrition|Women's Health|Children|Lifestyle)$/.test(b.text.trim()));
    normalizeChips(chips, 'blog', (t) => (t === 'All Articles' ? 'All' : t));
    const items = container.querySelectorAll('[data-fitem="blog"]');
    if (items.length && items[items.length - 1].parentNode) items[items.length - 1].parentNode.insertAdjacentHTML('afterend', emptyState('blog'));
    // make every article card open the article (stretched link) + wire "Read Full Article"
    items.forEach((card) => {
      const cls = card.getAttribute('class') || '';
      if (!/\brelative\b/.test(cls)) card.setAttribute('class', cls + ' relative');
      const title = (card.querySelector('h2, h3') || { text: 'article' }).text.trim().slice(0, 80);
      card.insertAdjacentHTML('beforeend', `<a class="absolute inset-0 z-[1]" href="blog-article.html" aria-label="Read: ${esc(title)}"></a>`);
    });
    container.querySelectorAll('button').forEach((b) => {
      if (/Read Full Article/i.test(b.text)) b.replaceWith(`<a href="blog-article.html" class="${b.getAttribute('class') || ''} relative z-[2] inline-flex items-center justify-center gap-1">${b.innerHTML}</a>`);
    });
    // newsletter form
    const nl = container.querySelector('form');
    if (nl) nl.setAttribute('data-newsletter', '');
  }

  // ---- Book appointment: mark form for JS wizard + preselect ----
  if (out === 'book-appointment.html') {
    const form = container.querySelector('form');
    if (form) {
      form.setAttribute('data-booking-form', '');
      const selects = form.querySelectorAll('select');
      selects.forEach((s) => {
        const opts = s.querySelectorAll('option').map((o) => o.text.trim());
        if (opts.some((o) => /Department/i.test(o))) s.setAttribute('data-booking-field', 'department');
        else if (opts.some((o) => /Doctor/i.test(o))) s.setAttribute('data-booking-field', 'doctor');
      });
      const submit = form.querySelectorAll('button').find((b) => /Continue|Schedule|Book|Submit|Confirm/i.test(b.text));
      if (submit) { submit.setAttribute('type', 'submit'); submit.set_content('Request Appointment <span class="material-symbols-outlined text-[18px] align-middle">arrow_forward</span>'); }
      form.insertAdjacentHTML('afterend', `
      <div data-booking-confirm class="hidden bg-surface-container-lowest rounded-xl p-8 md:p-12 clinical-shadow text-center">
        <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5"><span class="material-symbols-outlined text-[36px]">check_circle</span></div>
        <h2 class="font-headline-md text-headline-md text-on-surface mb-3">Appointment Requested</h2>
        <p class="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto mb-6">Thank you, <span data-confirm-name>patient</span>. We have received your request for <span data-confirm-summary class="text-on-surface font-medium">a consultation</span>. Our care team will call you shortly to confirm your slot.</p>
        <button type="button" data-booking-reset class="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors">Book Another Appointment</button>
      </div>`);
    }
  }

  // ---- Health packages: Explore -> smooth scroll to grid (id lives in the extra partial) ----
  if (out === 'health-packages.html') {
    const explore = container.querySelectorAll('button').find((b) => /Explore Packages/i.test(b.text));
    if (explore) explore.replaceWith(`<a href="#packages" class="${explore.getAttribute('class') || ''}">${explore.innerHTML}</a>`);
  }

  // ---- Doctor profile: wire booking CTAs to a preselected appointment ----
  if (out === 'doctor-ramasamy.html') {
    const href = 'book-appointment.html?doctor=' + encodeURIComponent('Dr. K. Ramasamy') + '&department=Cardiology';
    container.querySelectorAll('button').forEach((b) => {
      if (/book appointment|book now|video consult/i.test(cleanAnchorText(b))) {
        b.replaceWith(`<a href="${href}" class="${b.getAttribute('class') || ''} inline-flex items-center justify-center gap-2">${b.innerHTML}</a>`);
      }
    });
  }

  // ---- Diagnostics: "View Reports" -> contact ----
  if (out === 'diagnostics.html') {
    container.querySelectorAll('button').forEach((b) => {
      if (/View Reports/i.test(b.text)) b.replaceWith(`<a href="contact.html" class="${b.getAttribute('class') || ''} inline-flex items-center justify-center gap-2">${b.innerHTML}</a>`);
    });
  }

  // ---- Contact: inject a working enquiry form ----
  if (out === 'contact.html') {
    const formHtml = fs.readFileSync(path.join(ROOT, 'build/partials/contact-form.html'), 'utf8');
    container.insertAdjacentHTML('beforeend', formHtml);
  }

  // ---- General: convert remaining stray CTA <button>s to links ----
  container.querySelectorAll('button').forEach((b) => {
    if (b.getAttribute('data-role')) return;
    var btype = (b.getAttribute('type') || '').toLowerCase();
    if (btype === 'submit') return;
    // a default-type button inside a <form> acts as submit — leave it; type="button" is safe
    if (btype !== 'button' && hasAncestorTag(b, 'FORM')) return;
    if (b.hasAttribute('data-nav-toggle') || b.hasAttribute('data-nav-close')) return;
    const text = cleanAnchorText(b);
    let dest = destForText(text);
    if (!dest && GENERIC_CTA.test(text)) dest = headingDest(nearestHeadingText(b));
    if (dest && dest !== out) {
      const cls = b.getAttribute('class') || '';
      b.replaceWith(`<a href="${dest}" class="${cls} inline-flex items-center justify-center gap-1">${b.innerHTML}</a>`);
    }
  });
}

// Visible breadcrumb trail (interior pages only) — UX + SEO
function breadcrumbNav(page) {
  if (page.out === 'index.html' || !page.name) return '';
  const trail = [{ name: 'Home', out: 'index.html' }, ...(page.crumbs || []), { name: page.name, out: page.out }];
  const lis = trail.map((c, i) => {
    const last = i === trail.length - 1;
    const sep = i > 0 ? '<li aria-hidden="true" class="text-outline-variant">/</li>' : '';
    const node = last
      ? `<li class="text-on-surface font-medium" aria-current="page">${esc(c.name)}</li>`
      : `<li><a class="hover:text-primary transition-colors" href="${c.out}">${esc(c.name)}</a></li>`;
    return sep + node;
  }).join('\n        ');
  return `<nav aria-label="Breadcrumb" class="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-4">
      <ol class="flex flex-wrap items-center gap-2 font-label-md text-label-md text-on-surface-variant">
        ${lis}
      </ol>
    </nav>`;
}

// Assemble all JSON-LD blocks for a page
function structuredData(page) {
  const blocks = [];
  const flags = page.schema || [];
  if (page.out === 'index.html') {
    blocks.push(hospitalSchema());
    blocks.push({ '@context': 'https://schema.org', '@type': 'WebSite', url: BASE_URL, name: BUSINESS.name, publisher: { '@id': `${BASE_URL}/#hospital` }, inLanguage: 'en-IN' });
  }
  if (flags.includes('hospital') && page.out !== 'index.html') blocks.push(hospitalSchema());
  if (flags.includes('physician')) blocks.push(physicianSchema());
  if (flags.includes('faq-packages')) blocks.push(faqSchema(FAQS['faq-packages']));
  if (flags.includes('article')) blocks.push({
    '@context': 'https://schema.org', '@type': 'Article',
    headline: page.name, image: absImg(page.ogImage) || BUSINESS.logo,
    datePublished: '2026-07-01', dateModified: BUILD_DATE,
    author: { '@type': 'Person', name: 'Dr. K. Ramasamy' },
    publisher: { '@type': 'Organization', name: BUSINESS.name, logo: { '@type': 'ImageObject', url: BUSINESS.logo } },
    mainEntityOfPage: absUrl(page.out),
  });
  if (page.out !== 'index.html' && page.name) blocks.push(breadcrumbSchema(page.crumbs, page.name, page.out));
  return blocks.map(jsonld).join('\n  ');
}

function documentShell(page) {
  const { title, desc, active, content, out = 'index.html', ogImage } = page;
  const canonical = absUrl(out);
  const img = absImg(ogImage) || `${BASE_URL}/favicon.svg`;
  const isIndexable = !page.noindex;
  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${canonical}" />
  <meta name="robots" content="${isIndexable ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : 'noindex, follow'}" />
  <meta name="theme-color" content="#00685f" />

  <!-- Local SEO: Erode geo signals -->
  <meta name="geo.region" content="${BUSINESS.regionCode}" />
  <meta name="geo.placename" content="${BUSINESS.locality}, ${BUSINESS.region}" />
  <meta name="geo.position" content="${BUSINESS.lat};${BUSINESS.lng}" />
  <meta name="ICBM" content="${BUSINESS.lat}, ${BUSINESS.lng}" />

  <!-- Open Graph -->
  <meta property="og:type" content="${out === 'index.html' ? 'website' : 'article'}" />
  <meta property="og:site_name" content="${esc(BUSINESS.name)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${img}" />
  <meta property="og:locale" content="en_IN" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${img}" />

  <link rel="icon" href="favicon.svg" />
  <link rel="apple-touch-icon" href="favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="assets/css/app.css" />
  ${structuredData(page)}
</head>
<body class="bg-surface text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container">
  <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] bg-primary text-on-primary px-5 py-3 rounded-lg font-label-md text-label-md shadow-lg">Skip to main content</a>
  ${header(active)}
  <main id="main-content">
    ${breadcrumbNav(page)}
${withImageDims(content)}
  </main>
  ${FOOTER}
  <script src="assets/js/main.js" defer></script>
</body>
</html>
`;
}

// ---- Transform one source page ---------------------------------------------
function extractContent(html, page) {
  const srcName = page.src;
  const root = parse(html, { comment: true, blockTextElements: { script: true, style: true } });
  const body = root.querySelector('body');
  if (!body) throw new Error(`no <body> in ${srcName}`);

  const els = body.childNodes.filter((n) => n.nodeType === 1);
  const tag = (e) => (e.tagName || '').toUpperCase();

  // Remove leading site nav (first HEADER or NAV among first two elements)
  const navEl = els.find((e) => ['HEADER', 'NAV'].includes(tag(e)));
  if (navEl && els.indexOf(navEl) <= 1) navEl.remove();
  else if (navEl) console.warn(`  ! ${srcName}: nav not leading (idx ${els.indexOf(navEl)}), removed anyway`), navEl.remove();

  // Remove trailing footer (last FOOTER)
  const footers = els.filter((e) => tag(e) === 'FOOTER');
  if (footers.length) footers[footers.length - 1].remove();

  // If a single <main> wraps everything, unwrap to its inner content
  let container = body;
  const remaining = body.childNodes.filter((n) => n.nodeType === 1);
  if (remaining.length === 1 && tag(remaining[0]) === 'MAIN') container = remaining[0];

  // SEO: ensure exactly one <h1>. If the page has none, promote the first <h2>
  // (Stitch sometimes emits the hero title as an <h2>).
  if (!container.querySelector('h1')) {
    const firstH2 = container.querySelector('h2');
    if (firstH2) {
      firstH2.replaceWith(`<h1 class="${firstH2.getAttribute('class') || ''}">${firstH2.innerHTML}</h1>`);
    }
  }

  // --- localize inline-style background images ---
  container.querySelectorAll('[style*="lh3.googleusercontent"]').forEach((el) => {
    let style = el.getAttribute('style') || '';
    style = style.replace(/https:\/\/lh3\.googleusercontent\.com\/[A-Za-z0-9_\-/]+/g, (m) =>
      imageMap[m] ? 'assets/images/' + imageMap[m] : m
    );
    el.setAttribute('style', style);
  });

  // --- localize images + promote data-alt -> alt ---
  container.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && imageMap[src]) img.setAttribute('src', 'assets/images/' + imageMap[src]);
    if (!img.getAttribute('alt')) {
      const da = img.getAttribute('data-alt');
      img.setAttribute('alt', da ? da.slice(0, 160) : '');
    }
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  });

  // --- rewrite in-content anchors ---
  let rewired = 0, kept = 0;
  container.querySelectorAll('a').forEach((a) => {
    const href = (a.getAttribute('href') || '').trim();
    if (href && href !== '#' && !href.startsWith('javascript:')) return; // already real
    const text = cleanAnchorText(a);
    let dest = destForText(text);
    if (!dest && GENERIC_CTA.test(text)) dest = headingDest(nearestHeadingText(a));
    if (dest) { a.setAttribute('href', dest); rewired++; }
    else { a.setAttribute('href', '#'); kept++; }
  });

  // --- explicit per-page button -> link conversions (safe, targeted) ---
  if (page.buttonNav && page.buttonNav.length) {
    container.querySelectorAll('button').forEach((b) => {
      const text = cleanAnchorText(b);
      const hit = page.buttonNav.find((m) => m.re.test(text));
      if (!hit) return;
      const cls = b.getAttribute('class') || '';
      b.replaceWith(`<a href="${hit.dest}" class="${cls} inline-flex items-center justify-center gap-2">${b.innerHTML}</a>`);
    });
  }

  // --- interactive enhancements (filters, forms, CTA wiring) ---
  enhancePage(container, page);

  return { html: normalizeContent(container.innerHTML), rewired, kept };
}

// ---- Run --------------------------------------------------------------------
let totalRewired = 0, totalKept = 0;
for (const p of PAGES) {
  const srcFile = path.join(SRC, p.src, 'index.html');
  const raw = fs.readFileSync(srcFile, 'utf8');
  let { html, rewired, kept } = extractContent(raw, p);
  if (p.extra) {
    const extraHtml = fs.readFileSync(path.join(ROOT, 'build/partials', p.extra), 'utf8');
    html += '\n' + extraHtml;
  }
  totalRewired += rewired; totalKept += kept;
  const firstImg = (html.match(/assets\/images\/[A-Za-z0-9._-]+/) || [null])[0];
  const doc = documentShell({ ...p, content: html, ogImage: firstImg });
  fs.writeFileSync(path.join(OUT, p.out), doc);
  console.log(`  ✓ ${p.out.padEnd(24)} (${(html.length / 1024).toFixed(0)}kb, links: ${rewired} wired / ${kept} placeholder)`);
}
console.log(`\nDone. ${PAGES.length} pages. Links wired: ${totalRewired}, placeholders left: ${totalKept}`);

// ---- 404 page ---------------------------------------------------------------
const notFound = `
    <section class="min-h-[60vh] flex flex-col items-center justify-center text-center px-margin-mobile py-24 max-w-container-max mx-auto">
      <span class="material-symbols-outlined text-primary text-[64px] mb-4">emergency_home</span>
      <h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-4">Page not found</h1>
      <p class="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-8">The page you're looking for may have moved. Let's get you back to care.</p>
      <div class="flex flex-wrap gap-4 justify-center">
        <a class="bg-primary text-on-primary px-8 py-3.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors" href="index.html">Back to Home</a>
        <a class="border border-secondary text-secondary px-8 py-3.5 rounded-lg font-label-md text-label-md hover:bg-secondary/5 transition-colors" href="contact.html">Contact Us</a>
      </div>
    </section>`;
fs.writeFileSync(path.join(OUT, '404.html'), documentShell({
  title: 'Page Not Found — Thamarai Multispeciality Hospital',
  desc: 'The page you requested could not be found. Return to the Thamarai Multispeciality Hospital home page.',
  active: null, content: notFound, out: '404.html', noindex: true,
}));

// ---- sample blog article page ----------------------------------------------
{
  const articleHtml = fs.readFileSync(path.join(ROOT, 'build/partials/blog-article.html'), 'utf8');
  const firstImg = (articleHtml.match(/assets\/images\/[A-Za-z0-9._-]+/) || [null])[0];
  fs.writeFileSync(path.join(OUT, 'blog-article.html'), documentShell({
    out: 'blog-article.html', active: null, name: 'The Future of Cardiac Care',
    crumbs: [{ name: 'Blog', out: 'blog.html' }], schema: ['article'], ogImage: firstImg,
    title: 'The Future of Cardiac Care in Erode | Thamarai Hospital Blog',
    desc: 'How modern cardiac care in Erode — early detection, minimally invasive procedures and healthy habits — is transforming heart health at Thamarai Hospital.',
    content: articleHtml,
  }));
}

// ---- favicon.svg ------------------------------------------------------------
fs.writeFileSync(path.join(OUT, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#00685f"/><path d="M16 7v18M7 16h18" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></svg>\n`);

// ---- robots.txt + sitemap.xml ----------------------------------------------
fs.writeFileSync(path.join(OUT, 'robots.txt'),
  `# Thamarai Multispeciality Hospital
User-agent: *
Allow: /

# Search & AI crawlers explicitly welcomed (removing = losing citations)
User-agent: Googlebot
Allow: /
User-agent: Bingbot
Allow: /
User-agent: GoogleOther
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: ClaudeBot
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`);
const urls = PAGES.map((p) => {
  const loc = absUrl(p.out);
  const priority = p.out === 'index.html' ? '1.0' : (['departments.html', 'doctors.html', 'contact.html', 'emergency.html', 'book-appointment.html'].includes(p.out) ? '0.9' : '0.8');
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${BUILD_DATE}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}).join('\n');
fs.writeFileSync(path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log('Also wrote: 404.html, favicon.svg, robots.txt, sitemap.xml');
