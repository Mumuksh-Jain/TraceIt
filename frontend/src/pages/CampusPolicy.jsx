import React from 'react'
import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function CampusPolicy() {
  useDocumentTitle(
    'Privacy Policy',
    'Learn how TraceIt protects student privacy, handles campus lost and found item reports, and processes AI semantic embeddings.'
  )

  const handleOpenCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('openCookieSettings'))
  }

  return (
    <div className="legal-page-container">
      <div className="legal-header">
        <span className="legal-badge">🔒 Legal &amp; Compliance</span>
        <h1>Privacy Policy</h1>
        <p className="legal-last-updated">Last Updated: October 15, 2026 • Version 2.0</p>
      </div>

      <div className="legal-content-card">
        <section className="legal-section">
          <h2>1. Introduction &amp; Commitment to Campus Privacy</h2>
          <p>
            Welcome to <strong>TraceIt</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;the Platform&rdquo;). TraceIt is a specialized, AI-driven lost and found service developed to assist college students, faculty, staff, and campus visitors in recovering lost personal belongings quickly and securely.
          </p>
          <p>
            We take your digital privacy seriously. Our core philosophy is straightforward: <strong>we collect only the minimal data necessary to match and reunite lost items with their rightful owners</strong>. We do not sell your personal data, we do not host third-party tracking advertisements, and we implement enterprise-grade encryption across all network transmissions.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Information We Collect</h2>
          <p>When you interact with TraceIt, we may collect the following categories of information:</p>
          <ul className="legal-list">
            <li>
              <strong>Account Data:</strong> When registering, we collect your chosen username, email address, and an encrypted hash of your password. We never store plain-text passwords.
            </li>
            <li>
              <strong>Item Report Information:</strong> When you submit a &ldquo;Lost&rdquo; or &ldquo;Found&rdquo; item report, we collect the item title, written description, physical campus location (e.g., &ldquo;Library Block B, 2nd Floor&rdquo;), item category, and optional photographs uploaded to assist visual identification.
            </li>
            <li>
              <strong>AI Vector Embeddings:</strong> Item descriptions are processed into mathematical vector embeddings by our natural language processing (NLP) microservice to compute semantic similarity scores. These embeddings are abstract numerical arrays and contain no personally identifiable records.
            </li>
            <li>
              <strong>Technical &amp; Security Logs:</strong> To safeguard the campus community from spam and brute-force attacks, our servers log IP addresses, browser types, and timestamp headers during form submissions for rate-limiting purposes.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. How We Use Your Information</h2>
          <p>Your information is used strictly for legitimate campus recovery operations:</p>
          <div className="legal-grid">
            <div className="legal-box">
              <h4>🤖 Semantic AI Matching</h4>
              <p>Descriptions are evaluated against our database of reported items to suggest probable matches, even when different vocabulary is used.</p>
            </div>
            <div className="legal-box">
              <h4>🤝 Owner &amp; Finder Reconnection</h4>
              <p>Facilitating communication between the finder and claimant so physical verification and handover can occur safely.</p>
            </div>
            <div className="legal-box">
              <h4>🛡️ Spam &amp; Fraud Prevention</h4>
              <p>Filtering automated bot submissions, blocking unauthorized access attempts, and protecting campus community integrity.</p>
            </div>
            <div className="legal-box">
              <h4>📈 Platform Optimization</h4>
              <p>Aggregating anonymous metrics to improve AI match accuracy, search response times, and UI accessibility.</p>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2>4. Zero Third-Party Advertising Guarantee</h2>
          <div className="legal-callout">
            <p>
              <strong>We do not sell, trade, or monetize your personal information.</strong> TraceIt is an educational campus initiative built for public utility. Your email address, uploaded photos, and location history will never be transferred to third-party ad exchanges or commercial brokers.
            </p>
          </div>
        </section>

        <section className="legal-section">
          <h2>5. Third-Party Infrastructure &amp; Data Processors</h2>
          <p>
            To deliver high availability and resilient performance, TraceIt utilizes select industry-standard cloud infrastructure providers:
          </p>
          <ul className="legal-list">
            <li><strong>MongoDB Atlas:</strong> Encrypted-at-rest database storage for user profiles and item records.</li>
            <li><strong>Cloudinary:</strong> Secure cloud storage and optimized image delivery over HTTPS for uploaded item photos.</li>
            <li><strong>Vercel &amp; Render:</strong> SOC-2 compliant serverless frontend and backend hosting with automated TLS/SSL certificate renewal.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>6. Cookies &amp; Local Storage</h2>
          <p>
            TraceIt uses essential cookies strictly necessary for authenticating your session and keeping you securely logged in. Optional performance telemetry helps us identify slow page loads and improve server response times.
          </p>
          <p>
            You can review or change your preferences at any time by clicking the button below:
          </p>
          <button 
            type="button" 
            className="btn-secondary btn-sm" 
            onClick={handleOpenCookieSettings}
            style={{ marginTop: '8px' }}
          >
            ⚙️ Manage Cookie Preferences
          </button>
        </section>

        <section className="legal-section">
          <h2>7. Data Retention &amp; Your Deletion Rights</h2>
          <p>
            You retain absolute ownership over your submitted reports:
          </p>
          <ul className="legal-list">
            <li><strong>Instant Item Deletion:</strong> You can delete any item you reported from the &ldquo;My Items&rdquo; dashboard or the item detail page at any time. Deletion immediately removes the item from the matching index.</li>
            <li><strong>Account Erasure:</strong> To request complete account erasure and removal of all associated historical logs, contact the administrator at <a href="mailto:privacy@traceit.campus">privacy@traceit.campus</a>.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>8. Security Architecture</h2>
          <p>
            All communications between your device and TraceIt are strictly encrypted via HTTPS using TLS 1.3. We employ HTTP Strict Transport Security (HSTS), Content Security Policy (CSP) headers, rate-limiting shields, and bcrypt password hashing with salt rounds.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Contact Us</h2>
          <p>
            If you have questions, feedback, or concerns regarding this Privacy Policy or your data, please reach out to:
          </p>
          <div className="legal-contact-card">
            <p><strong>TraceIt Campus Project Lead</strong></p>
            <p>Mumukshu Jain — Full Stack &amp; AI Infrastructure</p>
            <p>Email: <a href="mailto:privacy@traceit.campus">privacy@traceit.campus</a></p>
            <p>Repository: <a href="https://github.com/Mumuksh-Jain" target="_blank" rel="noopener noreferrer">github.com/Mumuksh-Jain</a></p>
          </div>
        </section>

        <div className="legal-footer-nav">
          <Link to="/" className="btn-primary btn-sm">← Back to Home</Link>
          <Link to="/terms" className="btn-secondary btn-sm">Read Terms &amp; Conditions →</Link>
        </div>
      </div>
    </div>
  )
}
