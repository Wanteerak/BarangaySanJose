import { useState } from 'react';
import sealImg from './assets/seal.png';

const PORTAL_URL = 'http://localhost:5173';
// Desktop installer (served from promo/public/download)
const DESKTOP_URL = '/download/Barangay San Jose Setup 1.0.0.exe';

function Navbar({ onNav }) {
  const [open, setOpen] = useState(false);
  const links = ['Services', 'How It Works', 'About', 'Download', 'Contact'];
  return (
    <header className="promo-nav">
      <div className="promo-nav-inner">
        <div className="promo-brand" onClick={() => onNav('hero')}>
          <img src={sealImg} alt="Barangay San Jose" className="promo-logo-img" />
          <span>Barangay San Jose</span>
        </div>
        <nav className={`promo-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} onClick={() => setOpen(false)}>{l}</a>
          ))}
          <a className="promo-cta" href={PORTAL_URL}>Login to Portal</a>
        </nav>
        <button className="promo-burger" onClick={() => setOpen(!open)}>☰</button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="hero" className="promo-hero">
      <div className="promo-hero-inner">
        <span className="promo-tagline">BARANGAY SAN JOSE • MAIN HALL</span>
        <h1>Your Barangay, <em>One Click Away.</em></h1>
        <p>
          Request your Barangay Clearance, Certificate of Indigency, Low Income
          Certificate, and Barangay ID online — anytime, anywhere. No more long
          queues. Track your request from your phone or computer.
        </p>
        <div className="promo-hero-actions">
          <a className="promo-btn promo-btn-primary" href={PORTAL_URL}>Request a Document</a>
          <a className="promo-btn promo-btn-ghost" href="#services">See Our Services</a>
        </div>
        <div className="promo-hero-badges">
          <span>✅ Track requests in real time</span>
          <span>📱 Phone, computer &amp; desktop app</span>
          <span>💬 Live chat with the office</span>
        </div>
      </div>
    </section>
  );
}

// Totoong services ng Barangay San Jose — kapareho ng portal (6 serbisyo)
const SERVICES = [
  { icon: '📋', title: 'Barangay Clearance', price: '₱50', time: '3–5 min processing', desc: 'For employment, school, loans, travel, passport, police/NBI, and other legal purposes. Certifies you as a good-standing resident of San Jose.' },
  { icon: '🧾', title: 'Certificate of Indigency', price: 'Free', time: '3–5 min processing', desc: 'For medical, financial, and educational assistance from government offices, hospitals, schools, and social welfare agencies.' },
  { icon: '📑', title: 'Low Income Certificate', price: '₱50', time: '3–5 min processing', desc: 'Official certification of your household income classification, issued for submission to the BIR and other concerned agencies.' },
  { icon: '👶', title: 'Guardianship Certificate', price: '₱50', time: '3–5 min processing', desc: 'Certifies a legal guardian of a minor — usable for school enrollment, medical consent, and government transactions.' },
  { icon: '💞', title: 'Cohabitation Certificate', price: '₱50', time: '3–5 min processing', desc: 'Certifies that a couple is living together as partners — accepted for legal and personal purposes.' },
  { icon: '🪪', title: 'Barangay ID Application', price: 'Free', time: '5–10 min processing', desc: 'An official identification card issued by the barangay for verified residents of San Jose. New ID and renewal supported.' },
];

function Services() {
  return (
    <section id="services" className="promo-section">
      <div className="promo-section-inner">
        <h2>Our Online Services</h2>
        <p className="promo-sub">
          Everything you need, submitted digitally with your proof of identity —
          reviewed by the barangay administrator, then printed on official format for claiming.
        </p>
        <div className="promo-grid">
          {SERVICES.map((s) => (
            <div className="promo-card" key={s.title}>
              <div className="promo-card-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <div className="promo-card-meta">
                <span className="promo-card-price">{s.price}</span>
                <span className="promo-card-time">🕒 {s.time}</span>
              </div>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { n: '1', title: 'Create an Account', desc: 'Register using your name, address, and purok. It takes less than 2 minutes.' },
  { n: '2', title: 'Submit Your Request', desc: 'Choose the document you need, fill in your details, and upload a valid ID or voter document as proof of identity.' },
  { n: '3', title: 'Track & Wait for Approval', desc: 'Watch your request move from Pending to Approved in My Requests. If something is missing, the administrator sends you the exact reason why.' },
  { n: '4', title: 'Pick Up Your Document', desc: 'Once approved, the office prints your certificate on official barangay format. Claim it at the Main Hall on your scheduled date.' },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="promo-section promo-section-alt">
      <div className="promo-section-inner">
        <h2>How It Works</h2>
        <p className="promo-sub">Four simple steps — all from your phone or computer.</p>
        <div className="promo-steps">
          {STEPS.map((s) => (
            <div className="promo-step" key={s.n}>
              <div className="promo-step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="promo-section">
      <div className="promo-section-inner promo-about">
        <div>
          <h2>About Barangay San Jose</h2>
          <p>
            Barangay San Jose is committed to serving its residents with
            efficient, transparent, and accessible public service. This Online
            Clearance &amp; Document Request System is part of our digital
            transformation program — bringing barangay services closer to every
            household.
          </p>
          <ul className="promo-checklist">
            <li>No more long lines at the barangay hall</li>
            <li>Transparent request status tracking</li>
            <li>Clear reasons sent when a request is rejected</li>
            <li>Official documents printed on barangay format</li>
            <li>Safe records kept in a secure database</li>
          </ul>
        </div>
        <div className="promo-about-box">
          <h3>Barangay Main Hall</h3>
          <p>📍 Barangay San Jose — Main Hall<br />Open Monday – Friday<br />8:00 AM – 5:00 PM</p>
        </div>
      </div>
    </section>
  );
}

function DownloadApp() {
  const apkUrl = 'http://192.168.100.48:5174/download/barangay-san-jose.apk';
  return (
    <section id="download" className="promo-section">
      <div className="promo-section-inner">
        <h2>Use It on Any Device</h2>
        <p className="promo-sub">
          Ang system ay gagamitin sa website, mobile app (Android at iPhone),
          at Windows desktop app — lahat nagtuturo sa iisang barangay database.
        </p>
        <div className="promo-download-grid">
          <div className="promo-download-card">
            <div className="promo-download-icon">🌐</div>
            <h3>Website / Web Portal</h3>
            <p>Bukas ang portal sa computer o cellphone browser. I-click lang ang button sa ibaba.</p>
            <a className="promo-btn promo-btn-primary" href={PORTAL_URL}>Open the Portal</a>
          </div>
          <div className="promo-download-card">
            <div className="promo-download-icon">🤖</div>
            <h3>Android App</h3>
            <p>
              I-download ang APK (sideload). I-scan ang QR o i-click ang button.
              Walang Expo Go — direktang install ang APK sa phone mo.
            </p>
            <div className="promo-qr">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(apkUrl)}`} alt="Android APK QR Code" />
            </div>
            <a className="promo-btn promo-btn-primary" href={apkUrl} download>Download APK (Android)</a>
          </div>
          <div className="promo-download-card">
            <div className="promo-download-icon">🍎</div>
            <h3>iPhone / iPad (iOS) — PWA</h3>
            <p>
              Walang App Store download. I-install bilang <b>Progressive Web App (PWA)</b>
              direkta sa Safari — parang tunay na app sa Home Screen mo.
            </p>
            <ol className="promo-pwa-steps">
              <li>Buksan ang portal sa <b>Safari</b>: <a href={PORTAL_URL}>{PORTAL_URL}</a></li>
              <li>I-tap ang <b>Share</b> button (parang kahon na may arrow pataas) sa ibaba.</li>
              <li>I-scroll pababa at piliin ang <b>“Add to Home Screen”</b>.</li>
              <li>I-tap ang <b>Add</b> sa kanang sulok sa itaas.</li>
              <li>Lalabas na ang icon sa Home Screen mo — i-tap para buksan tulad ng app!</li>
            </ol>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.6rem' }}>
              Paalala: Gumana lang nang maayos kapag naka-HTTPS ang site (pagka-deploy).
              Sa local demo, buksan lang sa Safari ang {PORTAL_URL}.
            </p>
          </div>
          <div className="promo-download-card">
            <div className="promo-download-icon">🖥️</div>
            <h3>Windows Desktop App</h3>
            <p>May sariling .exe installer para sa computer ng barangay — i-download o hilingin sa Main Hall.</p>
            <a className="promo-btn promo-btn-primary" href={DESKTOP_URL} download>Download for Windows</a>
          </div>
        </div>
        <p className="promo-sub" style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
          Paalala: dapat naka-same Wi-Fi ang phone at laptop, at tumatakbo ang backend (port 3001) para gumana ang app.
        </p>
      </div>
    </section>
  );
}

const FAQS = [
  { q: 'Is the online request free?', a: 'Submitting a request online is free. Some certificates (Clearance, Low Income, Guardianship, Cohabitation) have a ₱50 fee, while Indigency and Barangay ID are free. Bayad lang kapag siningil sa barangay hall.' },
  { q: 'How long does approval take?', a: 'Most requests are reviewed by the barangay administrator within 1–3 working days. You will see the status update in the portal, and if your request is rejected, the exact reason is shown so you can fix and resubmit.' },
  { q: 'What do I need to submit?', a: 'A photocopy or photo of a valid government ID (or voter stub / COMELEC certification), uploaded during the application. Barangay ID renewals also need the front and back of your old ID.' },
  { q: 'Do I still need to visit the barangay hall?', a: 'Yes — once your document is approved, visit the Main Hall on your scheduled date to claim it and settle applicable fees. The office prints your certificate on official barangay format.' },
  { q: 'Can I use my smartphone?', a: 'Yes! Android: i-download ang APK o gamitin ang Expo Go. iPhone/iPad: i-install bilang PWA (Add to Home Screen sa Safari) — parang tunay na app.' },
  { q: 'How do I install on iPhone?', a: 'Buksan ang portal sa Safari → i-tap ang Share button → “Add to Home Screen” → Add. Lalabas na ang icon sa Home Screen mo.' },
];

function Faq() {
  const [openIdx, setOpenIdx] = useState(-1);
  return (
    <section id="contact" className="promo-section promo-section-alt">
      <div className="promo-section-inner">
        <h2>Frequently Asked Questions</h2>
        <p className="promo-sub">Need help? Here are the answers to common questions.</p>
        <div className="promo-faq">
          {FAQS.map((f, i) => (
            <div className={`promo-faq-item ${openIdx === i ? 'open' : ''}`} key={f.q}>
              <button onClick={() => setOpenIdx(openIdx === i ? -1 : i)}>
                <span>{f.q}</span>
                <span className="promo-faq-toggle">{openIdx === i ? '−' : '+'}</span>
              </button>
              {openIdx === i && <p>{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="promo-footer">
      <div className="promo-footer-inner">
        <div>
          <div className="promo-brand promo-brand-light">
            <img src={sealImg} alt="Barangay San Jose" className="promo-logo-img" />
            <span>Barangay San Jose</span>
          </div>
          <p>Online Clearance &amp; Document Request System<br />Serving the residents of Barangay San Jose — Main Hall.</p>
        </div>
        <div className="promo-footer-links">
          <a href={PORTAL_URL}>Resident Portal</a>
          <a href={PORTAL_URL}>Admin Login</a>
          <a href="#services">Services</a>
          <a href="#contact">FAQs</a>
        </div>
      </div>
      <p className="promo-copyright">© {new Date().getFullYear()} Barangay San Jose — Capstone Project. All rights reserved.</p>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <HowItWorks />
      <About />
      <DownloadApp />
      <Faq />
      <Footer />
    </>
  );
}
