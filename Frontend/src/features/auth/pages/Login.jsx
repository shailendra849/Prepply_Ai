import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ showPassword, setShowPassword ] = useState(false)
    const [ error, setError ] = useState("")
    const [ submitting, setSubmitting ] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!email || !password) {
            setError("Please enter your email and password.")
            return
        }

        setSubmitting(true)
        try {
            await handleLogin({ email, password })
            navigate('/')
        } catch (err) {
            if (err.needsVerification) {
                navigate(`/verify-otp?email=${encodeURIComponent(err.email || email)}`)
                return
            }
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className='auth-page'>

            {/* Branding panel */}
            <aside className='auth-brand'>
                <div className='auth-brand__logo'>
                    <span className='logo-mark'>✦</span>
                    Prepply AI
                </div>

                <div className='auth-brand__content'>
                    <h1>Welcome back. Your next big interview starts here.</h1>
                    <p>Log back in to pick up right where you left off, review past strategies, and keep sharpening your interview game.</p>

                    <div className='auth-brand__features'>
                        <div className='feature'>
                            <span className='feature__icon'>✓</span>
                            Pick up your saved interview plans instantly
                        </div>
                        <div className='feature'>
                            <span className='feature__icon'>✓</span>
                            Fresh, role-specific practice every time
                        </div>
                        <div className='feature'>
                            <span className='feature__icon'>✓</span>
                            Your data stays private and secure
                        </div>
                    </div>
                </div>

                <div className='auth-brand__footer'>&copy; {new Date().getFullYear()} Prepply AI. Shailendra Dwivedi. All rights reserved.</div>
            </aside>

            {/* Form panel */}
            <div className='auth-form-wrap'>
                <div className='auth-card'>

                    <div className='auth-card__header'>
                        <div className='auth-brand__logo'>
                            <span className='logo-mark'>✦</span>
                            Prepply AI
                        </div>
                        <h1>Log in to your account</h1>
                        <p>Enter your details to continue.</p>
                    </div>

                    {error && (
                        <div className='alert alert--error'>
                            <span>⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className='input-group'>
                            <label htmlFor="email">Email</label>
                            <div className='input-shell'>
                                <span className='input-icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>
                                </span>
                                <input
                                    onChange={(e) => { setEmail(e.target.value) }}
                                    value={email}
                                    type="email" id="email" name='email' placeholder='Enter email address' autoComplete='email' />
                            </div>
                        </div>
                        <div className='input-group'>
                            <label htmlFor="password">Password</label>
                            <div className='input-shell'>
                                <span className='input-icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                </span>
                                <input
                                    onChange={(e) => { setPassword(e.target.value) }}
                                    value={password}
                                    type={showPassword ? "text" : "password"} id="password" name='password' placeholder='Enter password' autoComplete='current-password' />
                                <button type='button' className='toggle-visibility' onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61" /><path d="M2 2l20 20" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button className='button primary-button button--block' disabled={submitting} type='submit'>
                            {submitting && <span className='spinner' />}
                            {submitting ? "Logging in..." : "Log in"}
                        </button>
                    </form>

                    <p className='auth-card__footer'>Don't have an account? <Link to={"/register"}>Register</Link></p>
                </div>
            </div>
        </main>
    )
}

export default Login
