import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Register = () => {

    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ showPassword, setShowPassword ] = useState(false)
    const [ error, setError ] = useState("")
    const [ submitting, setSubmitting ] = useState(false)

    const { handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!username || !email || !password) {
            setError("Please fill in all fields.")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.")
            return
        }

        setSubmitting(true)
        try {
            await handleRegister({ username, email, password })
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
        } catch (err) {
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
                    Interview AI
                </div>

                <div className='auth-brand__content'>
                    <h1>Land your next role with an AI interview coach.</h1>
                    <p>Create an account to get personalized interview strategies, tailored questions, and instant feedback based on your resume and target role.</p>

                    <div className='auth-brand__features'>
                        <div className='feature'>
                            <span className='feature__icon'>✓</span>
                            AI-generated interview strategy in seconds
                        </div>
                        <div className='feature'>
                            <span className='feature__icon'>✓</span>
                            Resume-aware, role-specific questions
                        </div>
                        <div className='feature'>
                            <span className='feature__icon'>✓</span>
                            Secure email verification for every account
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
                        <h1>Create your account</h1>
                        <p>Start building winning interview strategies today.</p>
                    </div>

                    {error && (
                        <div className='alert alert--error'>
                            <span>⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className='input-group'>
                            <label htmlFor="username">Username</label>
                            <div className='input-shell'>
                                <span className='input-icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </span>
                                <input
                                    onChange={(e) => { setUsername(e.target.value) }}
                                    value={username}
                                    type="text" id="username" name='username' placeholder='Choose a username' autoComplete='username' />
                            </div>
                        </div>

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
                                    type={showPassword ? "text" : "password"} id="password" name='password' placeholder='Create a password' autoComplete='new-password' />
                                <button type='button' className='toggle-visibility' onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61" /><path d="M2 2l20 20" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                            <span className='field-hint'>Use at least 6 characters.</span>
                        </div>

                        <button className='button primary-button button--block' disabled={submitting} type='submit'>
                            {submitting && <span className='spinner' />}
                            {submitting ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <p className='auth-card__footer'>Already have an account? <Link to={"/login"}>Log in</Link></p>
                </div>
            </div>
        </main>
    )
}

export default Register
