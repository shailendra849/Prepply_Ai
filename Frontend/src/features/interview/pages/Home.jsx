import React, { useState, useRef } from 'react'
import '../style/home.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { useNavigate } from 'react-router'

const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const [jobDescription, setJobDescription] = useState('')
    const [selfDescription, setSelfDescription] = useState('')
    const [jobCharCount, setJobCharCount] = useState(0)
    const [resumeName, setResumeName] = useState('No file selected')
    const [isDragging, setIsDragging] = useState(false)
    const [hasResume, setHasResume] = useState(false)
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current?.files?.[0]
        const data = await generateReport({ jobDescription, selfDescription, resumeFile })
        navigate(`/interview/${data._id}`)
    }

    const handleResumeChange = (event) => {
        const file = event.target.files?.[0]
        updateResumeState(file)
    }

    const updateResumeState = (file) => {
        if (file) {
            setResumeName(file.name)
            setHasResume(true)
        } else {
            setResumeName('No file selected')
            setHasResume(false)
        }
    }

    const handleDrop = (event) => {
        event.preventDefault()
        setIsDragging(false)
        const file = event.dataTransfer.files?.[0]
        updateResumeState(file)
        if (resumeInputRef.current) {
            resumeInputRef.current.files = event.dataTransfer.files
        }
    }

    const { handleLogout } = useAuth()

    if (loading) {
        return (
            <main className='loading-screen'>
                <div className='loading-card'>
                    <div className='loading-ring' />
                    <h1>Preparing your interview plan…</h1>
                    <p>This usually takes about 30 seconds.</p>
                </div>
            </main>
        )
    }

    return (
        <div className='home-page'>
                <div className='page-topbar'>
                 <button onClick={handleLogout} className='logout-button'>
                    <svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' /><polyline points='16 17 21 12 16 7' /><line x1='21' y1='12' x2='9' y2='12' /></svg>
                      Logout
                  </button>
              </div>

            <section className='hero-section'>
                <div className='hero-copy'>
                    <span className='eyebrow'>AI-powered interview prep</span>
                    <h1>Craft a sharper interview plan for your next role.</h1>
                    <p>Describe the position, share your background, and let the assistant build a tailored coaching experience with role-specific questions and preparation guidance.</p>
                    <div className='hero-pills'>
                        <span>Tailored questions</span>
                        <span>Resume insights</span>
                        <span>Fast feedback</span>
                    </div>
                </div>

                <div className='hero-panel'>
                    <div className='hero-panel__stat'>
                        <strong>1-click</strong>
                        <span>generate strategy</span>
                    </div>
                    <div className='hero-panel__stat'>
                        <strong>30s</strong>
                        <span>average prep time</span>
                    </div>
                    <div className='hero-panel__stat'>
                        <strong>100%</strong>
                        <span>personalized</span>
                    </div>
                </div>
            </section>

            <div className='interview-card'>
                <div className='interview-card__body'>
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='2' y='7' width='20' height='14' rx='2' ry='2' /><path d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' /></svg>
                            </span>
                            <h2>Target job description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => {
                                setJobDescription(e.target.value)
                                setJobCharCount(e.target.value.length)
                            }}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobCharCount} / 5000 chars</div>
                    </div>

                    <div className='panel-divider' />

                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' /><circle cx='12' cy='7' r='4' /></svg>
                            </span>
                            <h2>Your profile</h2>
                        </div>

                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload resume
                                <span className='badge badge--best'>Best results</span>
                            </label>
                            <label
                                className={`dropzone ${isDragging ? 'dropzone--active' : ''}`}
                                htmlFor='resume'
                                onDragOver={(event) => {
                                    event.preventDefault()
                                    setIsDragging(true)
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                            >
                                <span className='dropzone__icon'>
                                    <svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='16 16 12 12 8 16' /><line x1='12' y1='12' x2='12' y2='21' /><path d='M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3' /></svg>
                                </span>
                                <p className='dropzone__title'>Drop your resume here</p>
                                <p className='dropzone__subtitle'>PDF or DOCX • Max 5MB</p>
                                <span className='dropzone__cta'>Browse files</span>
                                <input ref={resumeInputRef} onChange={handleResumeChange} hidden type='file' id='resume' name='resume' accept='.pdf,.docx' />
                            </label>
                            <div className={`upload-status ${hasResume ? 'upload-status--ready' : ''}`}>
                                <span className='upload-status__dot' />
                                <span>{hasResume ? `Ready to analyze: ${resumeName}` : 'No file selected yet'}</span>
                            </div>
                        </div>

                        <div className='or-divider'><span>OR</span></div>

                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick self-description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='currentColor'><circle cx='12' cy='12' r='10' /><line x1='12' y1='8' x2='12' y2='12' stroke='#1a1f27' strokeWidth='2' /><line x1='12' y1='16' x2='12.01' y2='16' stroke='#1a1f27' strokeWidth='2' /></svg>
                            </span>
                            <p>Either a <strong>resume</strong> or a <strong>self description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-powered strategy generation &bull; Approx 30s</span>
                    <button onClick={handleGenerateReport} className='generate-btn'>
                        <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='currentColor'><path d='M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z' /></svg>
                        Generate My Interview Strategy
                    </button>
                </div>
            </div>

            {reports.length > 0 && (
                <section className='recent-reports'>
                    <div className='recent-reports__header'>
                        <h2>Recent interview plans</h2>
                        <span>Saved automatically</span>
                    </div>
                    <ul className='reports-list'>
                        {reports.map((report) => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <div className='report-item__top'>
                                    <h3>{report.title || 'Untitled Position'}</h3>
                                    <span className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>{report.matchScore}%</span>
                                </div>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>
        </div>
    )
}

export default Home