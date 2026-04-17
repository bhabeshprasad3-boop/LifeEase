import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';

const features = [
  {
    icon: '🔐',
    title: 'Zero-Knowledge Vault',
    desc: 'Bank-level AES-256 encryption. Your keys, your documents — only you have access.',
  },
  {
    icon: '📡',
    title: 'Proactive Expiry Radar',
    desc: 'Smart reminders at 30, 7, and 1 day before expiry. Never miss a renewal deadline.',
  },
  {
    icon: '🗂',
    title: 'Organised by Category',
    desc: 'Identity, Finance, Vehicle, Health and more — every document in its place.',
  },
  {
    icon: '☁',
    title: 'Cloud Storage',
    desc: 'All your documents stored securely in the cloud, accessible from anywhere.',
  },
];

const categories = [
  'Identity', 'Vehicle', 'Education', 'Health',
  'Finance', 'Property', 'Travel', 'Personal',
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* ── Navbar ─────────────────────────────── */}
      <nav className={`${styles.nav} glass`}>
        <div className={styles.navBrand}>
          <div className={styles.brandDot} />
          <span className={styles.brandText}>LifeEase</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#categories">Categories</a>
        </div>
        <div className={styles.navActions}>
          <Link to="/login" className={styles.loginLink}>Sign in</Link>
          <Link to="/register" className={styles.ctaBtn}>Get Started →</Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroPill}>
            <span className={styles.pillDot} />
            Trusted by 10,000+ professionals
          </div>
          <h1 className={styles.heroTitle}>
            Secure Your
            <span className={styles.heroAccent}> Documents.</span>
          </h1>
          <p className={styles.heroDesc}>
            Elevate your document management. Bank-level encryption meets an
            architectural approach to your digital assets — one place for
            everything that matters.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/register" className={styles.primaryCta}>
              Start for Free
            </Link>
            <Link to="/login" className={styles.secondaryCta}>
              Sign in to Vault →
            </Link>
          </div>
        </div>

        {/* Vault Preview Card */}
        <div className={styles.vaultPreview}>
          <div className={styles.vaultHeader}>
            <div className={styles.vaultLabel}>
              <span className={styles.vaultStatusDot} />
              The Vault
            </div>
            <span className={styles.vaultCount}>3 documents</span>
          </div>
          {[
            { name: 'Passport_Scan_2024.pdf', tag: 'Identity', status: 'Active', ago: '2 days ago' },
            { name: 'Tax_Returns_2023.pdf',   tag: 'Finance',  status: 'Expiring Soon', ago: '14 days' },
            { name: "Driver's License",       tag: 'Vehicle',  status: 'Active', ago: '1 month ago' },
          ].map((doc) => (
            <div key={doc.name} className={styles.vaultItem}>
              <div className={styles.vaultItemIcon}>
                {doc.tag === 'Identity' ? '🪪' : doc.tag === 'Finance' ? '💰' : '🚗'}
              </div>
              <div className={styles.vaultItemInfo}>
                <p className={styles.vaultItemName}>{doc.name}</p>
                <p className={styles.vaultItemMeta}>{doc.tag} · {doc.ago}</p>
              </div>
              <span className={`badge ${doc.status === 'Active' ? 'badge-active' : 'badge-expiring'}`}>
                {doc.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────── */}
      <section className={styles.features} id="features">
        <div className={styles.sectionHeader}>
          <p className={`label-md ${styles.sectionEyebrow}`}>Why LifeEase</p>
          <h2 className={styles.sectionTitle}>
            Architectural Integrity for Your Data.
          </h2>
          <p className={styles.sectionDesc}>
            Beyond simple storage — a suite designed for meticulous curation
            of your most important life documents.
          </p>
        </div>
        <div className={styles.featureGrid}>
          {features.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ─────────────────────────── */}
      <section className={styles.categories} id="categories">
        <div className={styles.sectionHeader}>
          <p className={`label-md ${styles.sectionEyebrow}`}>Organisation</p>
          <h2 className={styles.sectionTitle}>Every Document, in its Place.</h2>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <div key={cat} className={styles.categoryChip}>
              {cat}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────── */}
      <section className={styles.ctaBanner}>
        <h2 className={styles.ctaBannerTitle}>Ready to start?</h2>
        <p className={styles.ctaBannerDesc}>
          Join thousands of users who trust LifeEase with their most important documents.
        </p>
        <Link to="/register" className={styles.primaryCta}>
          Create Free Account →
        </Link>
      </section>

      {/* ── Footer ─────────────────────────────── */}
      <footer className={styles.footer}>
        <p>© 2024 LifeEase. All rights reserved.</p>
      </footer>
    </div>
  );
}
