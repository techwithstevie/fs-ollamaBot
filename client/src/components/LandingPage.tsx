import { useEffect, useRef, useState } from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onOpenChat: () => void;
}

/* SVG Icons */
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

const MonitorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
);

const WrenchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
);

const FileCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

const SmokeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-3.76 7.42a1 1 0 0 0 1.76.94l4.38-8.63a.5.5 0 0 1 .9.45l-3.93 7.76a1 1 0 0 0 1.76.94l5.08-10.01a.5.5 0 0 1 .9.45l-5.84 11.5A1 1 0 0 0 14 14Z"/></svg>
);

const PanelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
);

const WifiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>
);

export default function LandingPage({ onOpenChat }: LandingPageProps) {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav ref={navRef} className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <h1 className="nav-logo">Fire<span>Safe</span> Solutions</h1>
          <div className="nav-links">
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about'); }}>About</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); scrollTo('services'); }}>Services</a>
            <a href="#products" onClick={(e) => { e.preventDefault(); scrollTo('products'); }}>Products</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Contact</a>
            <a href="#contact" className="nav-cta" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Get Quote</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            24/7 Emergency Service Available
          </div>
          <h1 className="hero-title">Professional Fire Alarm Installation & Safety Solutions</h1>
          <p className="hero-subtitle">
            Protecting homes and businesses with certified fire detection systems, 24/7 monitoring, 
            and expert maintenance. Licensed, insured, and trusted for over 15 years.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={onOpenChat}>
              <ShieldIcon /> Free Consultation
            </button>
            <a href="#contact" className="btn-secondary" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}>
              <PhoneIcon /> Emergency Service
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">15+</span>
              <span className="hero-stat-label">Years Experience</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">5,000+</span>
              <span className="hero-stat-label">Installations</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">24/7</span>
              <span className="hero-stat-label">Monitoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section section-alt">
        <div className="section-content">
          <div className="section-header">
            <span className="section-label">About Us</span>
            <h2>Your Trusted Fire Safety Partner</h2>
            <p className="section-desc">
              Licensed and certified fire alarm specialists serving residential and commercial properties 
              with excellence and integrity.
            </p>
          </div>
          <p className="about-text">
            FireSafe Solutions is a fully licensed and certified fire alarm installation company with over 
            15 years of experience protecting properties across the region. We specialize in designing, 
            installing, and maintaining state-of-the-art fire detection and alarm systems that exceed all 
            local and national safety codes. Our team of NICET-certified technicians is committed to 
            safeguarding your property and ensuring the safety of your occupants with precision and care.
          </p>
          <div className="about-features">
            <div className="about-feature">
              <CheckCircleIcon /> Licensed & Insured
            </div>
            <div className="about-feature">
              <CheckCircleIcon /> NICET Certified
            </div>
            <div className="about-feature">
              <CheckCircleIcon /> NFPA Compliant
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section">
        <div className="section-content">
          <div className="section-header">
            <span className="section-label">Our Services</span>
            <h2>Complete Fire Safety Services</h2>
            <p className="section-desc">
              From initial design to ongoing maintenance, we provide end-to-end fire protection solutions.
            </p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon"><ShieldIcon /></div>
              <h3>Fire Alarm Installation</h3>
              <p>Complete system design and professional installation tailored to your property's specific requirements and safety codes.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><MonitorIcon /></div>
              <h3>24/7 Monitoring</h3>
              <p>Continuous monitoring with rapid emergency response coordination to ensure immediate action when it matters most.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><WrenchIcon /></div>
              <h3>System Maintenance</h3>
              <p>Regular inspections, testing, and preventive maintenance to keep your systems operating at peak performance.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><AlertIcon /></div>
              <h3>Emergency Repairs</h3>
              <p>Rapid response for system failures and malfunctions. Our technicians are on call around the clock.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><RefreshIcon /></div>
              <h3>System Upgrades</h3>
              <p>Modernize outdated fire alarm systems with the latest technology for enhanced protection and reliability.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><FileCheckIcon /></div>
              <h3>Code Compliance</h3>
              <p>Professional assessments and safety planning to ensure full compliance with NFPA and local fire codes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="section section-alt">
        <div className="section-content">
          <div className="section-header">
            <span className="section-label">Products</span>
            <h2>Industry-Leading Fire Safety Equipment</h2>
            <p className="section-desc">
              We install and service only the most trusted and reliable fire detection equipment on the market.
            </p>
          </div>
          <div className="products-grid">
            <div className="product-card">
              <div className="product-image"><SmokeIcon /></div>
              <div className="product-content">
                <span className="product-tag">Smart Technology</span>
                <h3>Smart Smoke Detectors</h3>
                <p>Advanced photoelectric and ionization sensors with smartphone alerts, battery monitoring, and self-testing capabilities.</p>
              </div>
            </div>
            <div className="product-card">
              <div className="product-image"><PanelIcon /></div>
              <div className="product-content">
                <span className="product-tag">Commercial Grade</span>
                <h3>Fire Alarm Control Panels</h3>
                <p>Enterprise-grade addressable panels for commercial and industrial properties with zoning and network integration.</p>
              </div>
            </div>
            <div className="product-card">
              <div className="product-image"><WifiIcon /></div>
              <div className="product-content">
                <span className="product-tag">Wireless</span>
                <h3>Wireless Alarm Systems</h3>
                <p>Easy-to-install wireless systems ideal for retrofits and historic properties with minimal disruption.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Protect Your Property?</h2>
          <p>Schedule a free consultation with our certified fire safety experts today.</p>
          <button className="btn-primary" onClick={onOpenChat}>
            <ShieldIcon /> Get Free Quote
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section">
        <div className="section-content">
          <div className="section-header">
            <span className="section-label">Contact</span>
            <h2>Get In Touch</h2>
            <p className="section-desc">
              Available 24/7 for emergency services. Reach out anytime for immediate assistance.
            </p>
          </div>
          <div className="contact-grid">
            <a href="tel:1-800-FIRE-SAFE" className="contact-card">
              <div className="contact-icon"><PhoneIcon /></div>
              <h3>Emergency Hotline</h3>
              <p>1-800-FIRE-SAFE</p>
            </a>
            <a href="mailto:info@firesafesolutions.com" className="contact-card">
              <div className="contact-icon"><MailIcon /></div>
              <h3>Email Us</h3>
              <p>info@firesafesolutions.com</p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">Fire<span>Safe</span> Solutions</div>
          <div className="footer-links">
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about'); }}>About</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); scrollTo('services'); }}>Services</a>
            <a href="#products" onClick={(e) => { e.preventDefault(); scrollTo('products'); }}>Products</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Contact</a>
          </div>
          <p>&copy; 2026 FireSafe Solutions. Licensed & Insured. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
