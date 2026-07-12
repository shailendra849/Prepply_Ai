import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 30 // seconds

const VerifyOtp = () => {

    const navigate = useNavigate()
    const [ searchParams ] = useSearchParams()
    const emailFromQuery = searchParams.get('email') || ""

    const { handleVerifyOtp, handleResendOtp } = useAuth()

    const [ digits, setDigits ] = useState(Array(OTP_LENGTH).fill(""))
    const [ error, setError ] = useState("")
    const [ info, setInfo ] = useState("")
    const [ submitting, setSubmitting ] = useState(false)
    const [ resending, setResending ] = useState(false)
    const [ cooldown, setCooldown ] = useState(RESEND_COOLDOWN)

    const inputRefs = useRef([])

    useEffect(() => {
        if (cooldown <= 0) return
        const timer = setInterval(() => setCooldown(c => c - 1), 1000)
        return () => clearInterval(timer)
    }, [ cooldown ])

    useEffect(() => {
        inputRefs.current[ 0 ]?.focus()
    }, [])

    if (!emailFromQuery) {
        return (
            <main className='auth-page'>
                <div className='auth-form-wrap'>
                    <div className='auth-card'>
                        <div className='auth-card__header'>
                            <h1>Missing email</h1>
                            <p>We couldn't find an email to verify. Please register or log in again.</p>
                        </div>
                        <Link className='button primary-button button--block' to='/register' style={{ textDecoration: 'none', textAlign: 'center' }}>Back to register</Link>
                    </div>
                </div>
            </main>
        )
    }

    const handleChange = (index, value) => {
        const cleaned = value.replace(/[^0-9]/g, "")
        if (!cleaned) {
            const next = [ ...digits ]
            next[ index ] = ""
            setDigits(next)
            return
        }

        // handle paste of multiple digits into one box
        if (cleaned.length > 1) {
            const next = [ ...digits ]
            const chars = cleaned.split("")
            for (let i = 0; i < chars.length && index + i < OTP_LENGTH; i++) {
                next[ index + i ] = chars[ i ]
            }
            setDigits(next)
            const lastFilled = Math.min(index + chars.length, OTP_LENGTH - 1)
            inputRefs.current[ lastFilled ]?.focus()
            return
        }

        const next = [ ...digits ]
        next[ index ] = cleaned
        setDigits(next)

        if (index < OTP_LENGTH - 1) {
            inputRefs.current[ index + 1 ]?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !digits[ index ] && index > 0) {
            inputRefs.current[ index - 1 ]?.focus()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setInfo("")

        const otp = digits.join("")

        if (otp.length !== OTP_LENGTH) {
            setError(`Please enter the full ${OTP_LENGTH}-digit code.`)
            return
        }

        setSubmitting(true)
        try {
            await handleVerifyOtp({ email: emailFromQuery, otp })
            navigate('/')
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleResend = async () => {
        setError("")
        setInfo("")
        setResending(true)
        try {
            await handleResendOtp({ email: emailFromQuery })
            setInfo("A new code has been sent to your email.")
            setCooldown(RESEND_COOLDOWN)
            setDigits(Array(OTP_LENGTH).fill(""))
            inputRefs.current[ 0 ]?.focus()
        } catch (err) {
            setError(err.message)
        } finally {
            setResending(false)
        }
    }

    return (
        <main className='auth-page'>

            {/* Branding panel */}
            <aside className='auth-brand'>
                <div className='auth-brand__logo'>
                    <span className='logo-mark'>✦</span>
                    Interview AI
                </div>

                <div className='auth-brand__content'>
                    <h1>Almost there. Let's confirm it's you.</h1>
                    <p>We've sent a 6-digit verification code to your inbox. Enter it to activate your account and start generating interview strategies.</p>

                    <div className='auth-brand__features'>
                        <div className='feature'>
                            <span className='feature__icon'>✓</span>
                            Keeps your account secure
                        </div>
                        <div className='feature'>
                            <span className='feature__icon'>✓</span>
                            Code expires in 10 minutes
                        </div>
                        <div className='feature'>
                            <span className='feature__icon'>✓</span>
                            Didn't get it? You can resend anytime
                        </div>
                    </div>
                </div>

                <div className='auth-brand__footer'>&copy; {new Date().getFullYear()} Interview AI. All rights reserved.</div>
            </aside>

            {/* Form panel */}
            <div className='auth-form-wrap'>
                <div className='auth-card'>

                    <div className='auth-card__header'>
                        <div className='auth-brand__logo'>
                            <span className='logo-mark'>✦</span>
                            Interview AI
                        </div>
                        <h1>Verify your email</h1>
                        <p>Enter the code we sent to</p>
                        <span className='otp-email-pill'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>
                            {emailFromQuery}
                        </span>
                    </div>

                    {error && (
                        <div className='alert alert--error'>
                            <span>⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {info && !error && (
                        <div className='alert alert--success'>
                            <span>✓</span>
                            <span>{info}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className='input-group'>
                            <label>Verification code</label>
                            <div className='otp-inputs'>
                                {digits.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[ index ] = el)}
                                        type='text'
                                        inputMode='numeric'
                                        maxLength={OTP_LENGTH}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                    />
                                ))}
                            </div>
                        </div>

                        <button className='button primary-button button--block' disabled={submitting} type='submit'>
                            {submitting && <span className='spinner' />}
                            {submitting ? "Verifying..." : "Verify email"}
                        </button>
                    </form>

                    <div className='resend-row'>
                        Didn't get the code?
                        <button type='button' onClick={handleResend} disabled={resending || cooldown > 0}>
                            {resending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                        </button>
                    </div>

                    <p className='auth-card__footer'>Wrong email? <Link to={"/register"}>Start over</Link></p>
                </div>
            </div>
        </main>
    )
}

export default VerifyOtp
