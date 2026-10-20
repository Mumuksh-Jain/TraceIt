import React from 'react'
import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function CampusTerms() {
  useDocumentTitle(
    'Terms & Conditions',
    'Review the terms of service, community standards, ownership verification guidelines, and liability disclaimer for TraceIt.'
  )

  return (
    <div className="legal-page-container">
      <div className="legal-header">
        <span className="legal-badge">📜 Terms of Service</span>
        <h1>Terms &amp; Conditions</h1>
        <p className="legal-last-updated">Last Updated: October 15, 2026 • Version 2.0</p>
      </div>

      <div className="legal-content-card">
        <section className="legal-section">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using <strong>TraceIt</strong> (&ldquo;the Platform,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound by these Terms &amp; Conditions and our Privacy Policy. If you do not agree with any part of these terms, you must discontinue using the platform immediately.
          </p>
          <p>
            TraceIt is intended for students, faculty, staff, alumni, and authorized visitors of the university and campus premises.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Account Security &amp; Eligibility</h2>
          <ul className="legal-list">
            <li><strong>Accuracy of Information:</strong> You agree to provide true, accurate, and current information when creating an account and submitting item reports.</li>
            <li><strong>Credential Confidentiality:</strong> You are responsible for safeguarding your password and account session. You agree to notify us immediately if you suspect unauthorized access to your account.</li>
            <li><strong>Account Responsibility:</strong> You are responsible for all activities and item submissions that occur under your account.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Acceptable Use &amp; Prohibited Items</h2>
          <p>
            To maintain a safe and lawful environment, you agree never to use TraceIt to list, search for, or transact any of the following prohibited items:
          </p>
          <div className="legal-callout callout-warning">
            <h4>⚠️ Strictly Prohibited Categories</h4>
            <ul className="legal-list" style={{ marginTop: '8px' }}>
              <li>Firearms, ammunition, knives, or weapons of any kind</li>
              <li>Illegal drugs, narcotics, prescription medications, or controlled substances</li>
              <li>Hazardous biological, chemical, or radioactive substances</li>
              <li>Stolen property or items obtained through illegal means</li>
              <li>Counterfeit merchandise, pirated media, or fraudulent identification</li>
              <li>Items containing explicit, abusive, obscene, or defamatory material</li>
            </ul>
          </div>
          <p>
            Submissions violating these rules will be immediately purged, and offending accounts will be reported to campus security and campus disciplinary authorities.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Proof of Ownership &amp; Verification Disclaimer</h2>
          <p>
            <strong>Important Campus Safety Requirement:</strong> TraceIt is an automated index and semantic matching tool that connects parties. We do not physically inspect, verify, store, or hold custody of reported items.
          </p>
          <div className="legal-grid">
            <div className="legal-box">
              <h4>🔑 For Claimants (Owners)</h4>
              <p>You must be prepared to verify ownership to the finder (e.g., unlocking the mobile device, identifying unique stickers or engravings, providing matching serial numbers, or showing matching student ID).</p>
            </div>
            <div className="legal-box">
              <h4>📦 For Finders</h4>
              <p>Do not hand over high-value items without asking the claimant to prove ownership. When possible, exchange items in public, well-lit campus areas or through campus security front desks.</p>
            </div>
          </div>
          <p>
            Falsely claiming an item that does not belong to you constitutes fraud and theft, and will result in permanent ban and disciplinary reporting.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. User-Generated Content &amp; Intellectual Property</h2>
          <p>
            You retain ownership of photos and written descriptions you submit to TraceIt. However, by posting an item, you grant TraceIt a non-exclusive, royalty-free license to display, index, and process that content solely for the purpose of lost and found matching on campus.
          </p>
          <p>
            You represent that you have the right to upload any photos or descriptions provided and that your submissions do not infringe on any third party&apos;s copyright or privacy rights.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Limitation of Liability</h2>
          <p>
            TraceIt is provided on an <strong>&ldquo;as-is&rdquo; and &ldquo;as-available&rdquo;</strong> basis without warranties of any kind. Specifically:
          </p>
          <ul className="legal-list">
            <li>We do not guarantee that every lost item will be found or matched.</li>
            <li>We are not responsible for the physical condition, loss, damage, theft, or non-delivery of items during handover between users.</li>
            <li>We are not liable for direct, indirect, incidental, or consequential damages resulting from user interactions or disputes.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>7. Termination of Access</h2>
          <p>
            We reserve the right to suspend or terminate your access to the platform without prior notice if you violate these Terms, engage in harassment or fraudulent claims, or disrupt platform operations.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Modifications to Terms</h2>
          <p>
            We may update these Terms &amp; Conditions periodically to reflect campus policy updates or new platform features. Revised terms take effect upon posting to this page with an updated &ldquo;Last Updated&rdquo; date.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Questions &amp; Dispute Resolution</h2>
          <p>
            For inquiries or dispute notices related to these Terms, contact our platform team:
          </p>
          <div className="legal-contact-card">
            <p><strong>TraceIt Administration &amp; Campus Relations</strong></p>
            <p>Lead Developer: Mumukshu Jain</p>
            <p>Email: <a href="mailto:terms@traceit.campus">terms@traceit.campus</a></p>
            <p>GitHub: <a href="https://github.com/Mumuksh-Jain" target="_blank" rel="noopener noreferrer">github.com/Mumuksh-Jain</a></p>
          </div>
        </section>

        <div className="legal-footer-nav">
          <Link to="/" className="btn-primary btn-sm">← Back to Home</Link>
          <Link to="/privacy" className="btn-secondary btn-sm">Read Privacy Policy →</Link>
        </div>
      </div>
    </div>
  )
}
