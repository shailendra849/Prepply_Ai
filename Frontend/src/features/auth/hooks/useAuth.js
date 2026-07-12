import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe, verifyOtp, resendOtp } from "../services/auth.api";

export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    // NOTE: `loading` here only tracks the initial "am I already logged in?"
    // bootstrap check. Individual form actions (login/register/etc) manage
    // their own submitting state in the component so the whole page doesn't
    // flash a full-screen loader on every button click.

    const handleLogin = async ({ email, password }) => {
        const data = await login({ email, password })
        setUser(data.user)
        return data
    }

    const handleRegister = async ({ username, email, password }) => {
        // Registration no longer logs the user in immediately -- the account
        // stays unverified until the OTP emailed to the user is confirmed.
        const data = await register({ username, email, password })
        return data
    }

    const handleVerifyOtp = async ({ email, otp }) => {
        const data = await verifyOtp({ email, otp })
        setUser(data.user)
        return data
    }

    const handleResendOtp = async ({ email }) => {
        return await resendOtp({ email })
    }

    const handleLogout = async () => {
        try {
            await logout()
        } finally {
            setUser(null)
        }
    }

    useEffect(() => {

        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                setUser(data.user)
            } catch (err) { } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout, handleVerifyOtp, handleResendOtp }
}
