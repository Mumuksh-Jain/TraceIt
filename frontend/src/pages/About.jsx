import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

function About() {
  useDocumentTitle(
    'About TraceIt',
    'Discover how TraceIt combines modern React, Node.js, and Python sentence-transformers to help students find lost campus items.'
  )

  const [activeStep, setActiveStep] = useState(null)

  return (
    <div className='about-container-enhanced'>
      <div className='about-hero'>
        <span className="legal-badge" style={{ marginBottom: 16 }}>Campus Innovation</span>
        <h1>About TraceIt</h1>
        <p className='about-tagline'>AI-Powered Campus Lost &amp; Found Platform</p>
      </div>

      <section className='about-section'>
        <h2>What is TraceIt?</h2>
        <p>
          TraceIt is a production-grade full-stack web application designed specifically for university campuses. Rather than relying on static bulletin boards or lost WhatsApp groups, TraceIt indexes lost and found belongings and uses natural language processing (NLP) to detect semantic relationships between items.
        </p>
      </section>

      <section className='about-section'>
        <h2>How Semantic AI Matching Works</h2>
        <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>Click each step to explore technical details</p>
        <div className='steps'>
          {[
            { 
              num: '01', 
              title: 'Report Lost Item', 
              short: 'Student reports a lost item with description, location, and photo.', 
              detail: 'Fill out the report form with title, description, location, and category. Upload an image of the item for visual and semantic verification.' 
            },
            { 
              num: '02', 
              title: 'Report Found Item', 
              short: 'Another student or campus staff reports finding an item.', 
              detail: 'Found items are immediately indexed in our database. The system automatically queries similarity scores against active lost reports.' 
            },
            { 
              num: '03', 
              title: 'AI Semantic Vector Matching', 
              short: 'NLP model compares semantic meaning across descriptions.', 
              detail: 'Our Python microservice uses sentence-transformers (all-MiniLM-L6-v2) to convert text into high-dimensional vector embeddings, calculating cosine similarity even if users use completely different vocabulary (e.g., "navy laptop bag" vs "blue computer backpack").' 
            }
          ].map((step, i) => (
            <div 
              className={`step ${activeStep === i ? 'step-active' : ''}`} 
              key={i}
              onClick={() => setActiveStep(activeStep === i ? null : i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveStep(activeStep === i ? null : i) }}
              aria-expanded={activeStep === i}
            >
              <span className='step-number'>{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.short}</p>
              {activeStep === i && (
                <div className='step-detail'>
                  <p>{step.detail}</p>
                </div>
              )}
              <span className='step-toggle'>{activeStep === i ? '▲ Less' : '▼ More'}</span>
            </div>
          ))}
        </div>
      </section>

      <section className='about-section'>
        <h2>Architecture &amp; Tech Stack</h2>
        <div className='tech-grid'>
          {[
            { name: 'React 19', desc: 'Modern responsive client UI' },
            { name: 'Node.js & Express', desc: 'Secure REST API gateway' },
            { name: 'Python Flask', desc: 'AI Vector Inference Service' },
            { name: 'sentence-transformers', desc: 'MiniLM-L6-v2 Semantic NLP' },
            { name: 'MongoDB Atlas', desc: 'Cloud document database' },
            { name: 'Cloudinary CDN', desc: 'Optimized image storage' },
            { name: 'JWT & Cookies', desc: 'Stateless secure authentication' },
            { name: 'HSTS & Helmet', desc: 'Production HTTPS security' }
          ].map((tech, i) => (
            <div className='tech-tag' key={i}>
              <span className='tech-name'>{tech.name}</span>
              <span className='tech-desc'>{tech.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className='about-section about-developer'>
        <h2>Platform Engineering</h2>
        <div className='developer-card'>
          <div className='developer-avatar' aria-hidden="true">MJ</div>
          <div className='developer-info'>
            <h3>Mumukshu Jain</h3>
            <p>B.Tech CSE (AI &amp; ML) Engineer</p>
            <p>Full Stack &amp; AI Infrastructure Architect</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
              <a 
                href='https://github.com/Mumuksh-Jain' 
                target='_blank' 
                rel='noopener noreferrer' 
                className='github-btn'
              >
                GitHub Profile →
              </a>
              <Link to="/report-lost" className="btn-secondary btn-sm">
                Try TraceIt Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About