import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import '../style/mock.scss'
import { getMockSession, submitMockAnswer } from '../services/mock.api'

const SpeechRecognitionApi = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null

const MockInterview = () => {

    const { sessionId } = useParams()
    const navigate = useNavigate()

    const [ loading, setLoading ] = useState(true)
    const [ loadError, setLoadError ] = useState("")
    const [ status, setStatus ] = useState('in-progress') // 'in-progress' | 'completed'
    const [ currentQuestion, setCurrentQuestion ] = useState(null)
    const [ answer, setAnswer ] = useState("")
    const [ submitting, setSubmitting ] = useState(false)
    const [ submitError, setSubmitError ] = useState("")
    const [ feedback, setFeedback ] = useState(null) // { feedback, score, improvedAnswer } for the question just answered
    const [ pastAnswers, setPastAnswers ] = useState([])
    const [ summary, setSummary ] = useState(null)
    const [ listening, setListening ] = useState(false)

    const recognitionRef = useRef(null)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            setLoadError("")
            try {
                const data = await getMockSession(sessionId)
                setStatus(data.status)
                setPastAnswers(data.answers || [])
                if (data.status === 'in-progress') {
                    setCurrentQuestion(data.currentQuestion)
                } else {
                    setSummary(data.summary)
                }
            } catch (err) {
                setLoadError(err?.response?.data?.message || "Couldn't load this mock interview session.")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [ sessionId ])

    useEffect(() => {
        if (!SpeechRecognitionApi) return
        const recognition = new SpeechRecognitionApi()
        recognition.continuous = true
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
            let transcript = ""
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[ i ][ 0 ].transcript
            }
            setAnswer(prev => (prev ? prev.trim() + " " : "") + transcript)
        }

        recognition.onend = () => setListening(false)
        recognition.onerror = () => setListening(false)

        recognitionRef.current = recognition

        return () => {
            recognition.stop()
        }
    }, [])

    const toggleListening = () => {
        if (!recognitionRef.current) return
        if (listening) {
            recognitionRef.current.stop()
            setListening(false)
        } else {
            recognitionRef.current.start()
            setListening(true)
        }
    }

    const handleSubmitAnswer = async (e) => {
        e.preventDefault()
        if (!answer.trim() || submitting) return

        setSubmitError("")
        setSubmitting(true)
        if (listening) {
            recognitionRef.current?.stop()
            setListening(false)
        }

        try {
            const data = await submitMockAnswer({ sessionId, answer: answer.trim() })

            setPastAnswers(prev => [ ...prev, {
                question: currentQuestion.question,
                type: currentQuestion.type,
                userAnswer: answer.trim(),
                feedback: data.feedback.feedback,
                improvedAnswer: data.feedback.improvedAnswer,
                score: data.feedback.score
            } ])

            setFeedback(data.feedback)
            setStatus(data.status)

            if (data.status === 'completed') {
                setSummary(data.summary)
            } else {
                setCurrentQuestion(data.currentQuestion)
            }
        } catch (err) {
            setSubmitError(err?.response?.data?.message || "Couldn't evaluate your answer. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleNextQuestion = () => {
        setFeedback(null)
        setAnswer("")
    }

    if (loading) {
        return (
            <main className='mock-page mock-page--center'>
                <span className='spinner spinner--lg' />
                <p>Loading your mock interview...</p>
            </main>
        )
    }

    if (loadError) {
        return (
            <main className='mock-page mock-page--center'>
                <div className='alert alert--error'>{loadError}</div>
                <Link className='button secondary-button' to='/'>Back to dashboard</Link>
            </main>
        )
    }

    // ── Completed: summary screen (shown once feedback for the final question has been dismissed) ──
    if (status === 'completed' && summary && !feedback) {
        return (
            <main className='mock-page'>
                <div className='mock-shell'>
                    <div className='mock-summary'>
                        <div className='mock-summary__header'>
                            <span className='mock-summary__badge'>Session Complete</span>
                            <h1>Here's how you did</h1>
                            <div className={`mock-summary__score ${summary.averageScore >= 8 ? 'score--high' : summary.averageScore >= 5 ? 'score--mid' : 'score--low'}`}>
                                <span>{summary.averageScore}</span>
                                <small>/ 10 avg</small>
                            </div>
                            <p>{summary.totalQuestions} questions answered</p>
                        </div>

                        <div className='mock-review-list'>
                            {summary.answers.map((a, i) => (
                                <div key={i} className='mock-review-card'>
                                    <div className='mock-review-card__head'>
                                        <span className={`mock-tag mock-tag--${a.type}`}>{a.type}</span>
                                        <span className='mock-review-card__score'>{a.score}/10</span>
                                    </div>
                                    <p className='mock-review-card__question'>{a.question}</p>
                                    <div className='mock-review-card__block'>
                                        <span className='mock-review-card__label'>Your answer</span>
                                        <p>{a.userAnswer || <em>No answer given</em>}</p>
                                    </div>
                                    <div className='mock-review-card__block'>
                                        <span className='mock-review-card__label'>AI feedback</span>
                                        <p>{a.feedback}</p>
                                    </div>
                                    <div className='mock-review-card__block mock-review-card__block--improved'>
                                        <span className='mock-review-card__label'>Stronger answer</span>
                                        <p>{a.improvedAnswer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link className='button primary-button' to='/'>Back to dashboard</Link>
                    </div>
                </div>
            </main>
        )
    }

    // ── In progress: question / feedback screen ─────────────────────────
    return (
        <main className='mock-page'>
            <div className='mock-shell'>

                <div className='mock-progress'>
                    <div className='mock-progress__bar'>
                        <div
                            className='mock-progress__fill'
                            style={{ width: currentQuestion ? `${(currentQuestion.index / currentQuestion.total) * 100}%` : '0%' }}
                        />
                    </div>
                    {currentQuestion && (
                        <span className='mock-progress__label'>Question {currentQuestion.index + 1} of {currentQuestion.total}</span>
                    )}
                </div>

                {!feedback ? (
                    <div className='mock-question-card'>
                        {currentQuestion && (
                            <>
                                <span className={`mock-tag mock-tag--${currentQuestion.type}`}>{currentQuestion.type}</span>
                                <h2>{currentQuestion.question}</h2>
                            </>
                        )}

                        {submitError && <div className='alert alert--error'>{submitError}</div>}

                        <form onSubmit={handleSubmitAnswer}>
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder='Type your answer here, or use the mic to speak it out...'
                                rows={8}
                            />
                            <div className='mock-question-card__actions'>
                                {SpeechRecognitionApi && (
                                    <button type='button' className={`mic-button ${listening ? 'mic-button--active' : ''}`} onClick={toggleListening}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="23" /><line x1="8" x2="16" y1="23" y2="23" /></svg>
                                        {listening ? "Listening..." : "Speak answer"}
                                    </button>
                                )}
                                <button className='button primary-button' disabled={submitting || !answer.trim()} type='submit'>
                                    {submitting && <span className='spinner' />}
                                    {submitting ? "Evaluating..." : "Submit Answer"}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className='mock-feedback-card'>
                        <div className='mock-feedback-card__score-row'>
                            <div className={`mock-feedback-card__score ${feedback.score >= 8 ? 'score--high' : feedback.score >= 5 ? 'score--mid' : 'score--low'}`}>
                                {feedback.score}/10
                            </div>
                            <p>Here's how your answer landed</p>
                        </div>

                        <div className='mock-feedback-card__block'>
                            <span className='mock-review-card__label'>Feedback</span>
                            <p>{feedback.feedback}</p>
                        </div>

                        <div className='mock-feedback-card__block mock-feedback-card__block--improved'>
                            <span className='mock-review-card__label'>A stronger answer would sound like</span>
                            <p>{feedback.improvedAnswer}</p>
                        </div>

                        <button className='button primary-button' onClick={handleNextQuestion}>
                            {status === 'completed' ? "See summary" : "Next Question"}
                        </button>
                    </div>
                )}
            </div>
        </main>
    )
}

export default MockInterview
