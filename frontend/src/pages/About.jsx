import React, { useState } from 'react'
import AnimatedBackground from '../components/AnimatedBackground'

function About() {
  const [activeStep, setActiveStep] = useState(null)

  return (
    <AnimatedBackground theme="about">
      <div className='about-container-enhanced'>
        <div className='about-hero'>
          <h1>About TraceIt</h1>
          <p className='about-tagline'>AI-Powered Campus Lost &amp; Found Platform</p>
        </div>
        <section className='about-section'>
          <h2>What is TraceIt?</h2>
          <p>TraceIt is a full-stack web application that helps students report and recover lost items on campus using AI-powered semantic matching. Built with a Python NLP microservice using sentence-transformers, it finds matches even when descriptions use different words.</p>
        </section>
        <section className='about-section'>
          <h2>How It Works</h2>
          <p style={{marginBottom:'20px',color:'#666'}}>Click each step to learn more</p>
          <div className='steps'>
            {[
              { num:'01', title:'Report Lost Item', short:'Student reports a lost item with description, location and image.', detail:'Fill out the report form with title, description, location and category. Upload an image of the item for better identification.' },
              { num:'02', title:'Report Found Item', short:'Another student reports a found item with description and location.', detail:'If you found something on campus, report it here. Your report goes into our database and gets matched against lost items automatically.' },
              { num:'03', title:'AI Matches', short:'Our NLP engine compares descriptions using semantic similarity.', detail:'Our Python microservice uses sentence-transformers (MiniLM-L6-v2) to convert descriptions into vectors and calculate cosine similarity scores.' }
            ].map((step, i) => (
              <div className={`step ${activeStep === i ? 'step-active' : ''}`} key={i}
                onClick={() => setActiveStep(activeStep === i ? null : i)}>
                <span className='step-number'>{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.short}</p>
                {activeStep === i && <div className='step-detail'><p>{step.detail}</p></div>}
                <span className='step-toggle'>{activeStep === i ? '▲ Less' : '▼ More'}</span>
              </div>
            ))}
          </div>
        </section>
        <section className='about-section'>
          <h2>Tech Stack</h2>
          <div className='tech-grid'>
            {[{name:'React',desc:'Frontend UI'},{name:'Node.js',desc:'Backend runtime'},{name:'Express',desc:'REST APIs'},{name:'MongoDB',desc:'Database'},{name:'Python',desc:'AI service'},{name:'Flask',desc:'Python server'},{name:'sentence-transformers',desc:'NLP matching'},{name:'Cloudinary',desc:'Image storage'},{name:'JWT',desc:'Authentication'}].map((tech,i)=>(
              <div className='tech-tag' key={i}><span className='tech-name'>{tech.name}</span><span className='tech-desc'>{tech.desc}</span></div>
            ))}
          </div>
        </section>
        <section className='about-section about-developer'>
          <h2>Developer</h2>
          <div className='developer-card'>
            <div className='developer-avatar'>MJ</div>
            <div className='developer-info'>
              <h3>Mumukshu Jain</h3>
              <p>B.Tech CSE (AI &amp; ML) Student</p>
              <p>Full Stack &amp; AI Infrastructure Engineer</p>
              <a href='https://github.com/Mumuksh-Jain' target='_blank' rel='noreferrer' className='github-btn'>GitHub Profile →</a>
            </div>
          </div>
        </section>
      </div>
    </AnimatedBackground>
  )
}

export default About