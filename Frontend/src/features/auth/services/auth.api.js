import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})

function extractErrorMessage(err, fallback) {
    return err?.response?.data?.message || fallback
}

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })
        return response.data
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Something went wrong while registering. Please try again."))
    }
}

export async function verifyOtp({ email, otp }) {
    try {
        const response = await api.post('/api/auth/verify-otp', { email, otp })
        return response.data
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Could not verify OTP. Please try again."))
    }
}

export async function resendOtp({ email }) {
    try {
        const response = await api.post('/api/auth/resend-otp', { email })
        return response.data
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Could not resend OTP. Please try again."))
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })
        return response.data
    } catch (err) {
        const message = extractErrorMessage(err, "Something went wrong while logging in. Please try again.")
        const error = new Error(message)
        error.needsVerification = err?.response?.data?.needsVerification
        error.email = err?.response?.data?.email
        throw error
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Could not log out. Please try again."))
    }
}

export async function getMe() {
    const response = await api.get("/api/auth/get-me")
    return response.data
}
