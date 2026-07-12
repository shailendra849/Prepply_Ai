import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (
            <main style={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
            }}>
                <span className='spinner' style={{ borderTopColor: 'var(--accent)', borderColor: 'rgba(255,45,120,0.25)' }} />
                Checking your session...
            </main>
        )
    }

    if (!user) {
        return <Navigate to={'/login'} />
    }

    return children
}

export default Protected
