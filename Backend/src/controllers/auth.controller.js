const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const { generateOtp, sendOtpEmail } = require("../services/email.service")

const OTP_VALIDITY_MS = 10 * 60 * 1000 // 10 minutes

/**
 * @name registerUserController
 * @description register a new user (unverified), expects username, email and password in the request body.
 * Sends a 6 digit OTP to the user's email which must be verified before the account can log in.
 * @access Public
 */
async function registerUserController(req, res) {

    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        })
    }

    const hash = await bcrypt.hash(password, 10)
    const otp = generateOtp()

    const user = await userModel.create({
        username,
        email,
        password: hash,
        isVerified: false,
        otp,
        otpExpiry: new Date(Date.now() + OTP_VALIDITY_MS)
    })

    try {
        await sendOtpEmail({ to: user.email, username: user.username, otp })
    } catch (err) {
        return res.status(500).json({
            message: "User registered but failed to send verification email. Please try resending the OTP."
        })
    }

    res.status(201).json({
        message: "Registration successful. Please check your email for the verification code.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            isVerified: user.isVerified
        }
    })

}

/**
 * @name verifyOtpController
 * @description verify the OTP sent to a user's email, expects email and otp in the request body.
 * On success, marks the account as verified and logs the user in.
 * @access Public
 */
async function verifyOtpController(req, res) {

    const { email, otp } = req.body

    if (!email || !otp) {
        return res.status(400).json({
            message: "Please provide email and OTP"
        })
    }

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "No account found with this email address"
        })
    }

    if (user.isVerified) {
        return res.status(400).json({
            message: "This account is already verified"
        })
    }

    if (!user.otp || !user.otpExpiry || user.otpExpiry.getTime() < Date.now()) {
        return res.status(400).json({
            message: "OTP has expired. Please request a new one."
        })
    }

    if (user.otp !== otp) {
        return res.status(400).json({
            message: "Invalid OTP. Please try again."
        })
    }

    user.isVerified = true
    user.otp = null
    user.otpExpiry = null
    await user.save()

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)

    res.status(200).json({
        message: "Email verified successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            isVerified: user.isVerified
        }
    })

}

/**
 * @name resendOtpController
 * @description generate a fresh OTP and resend the verification email, expects email in the request body.
 * @access Public
 */
async function resendOtpController(req, res) {

    const { email } = req.body

    if (!email) {
        return res.status(400).json({
            message: "Please provide an email address"
        })
    }

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "No account found with this email address"
        })
    }

    if (user.isVerified) {
        return res.status(400).json({
            message: "This account is already verified"
        })
    }

    const otp = generateOtp()
    user.otp = otp
    user.otpExpiry = new Date(Date.now() + OTP_VALIDITY_MS)
    await user.save()

    try {
        await sendOtpEmail({ to: user.email, username: user.username, otp })
    } catch (err) {
        return res.status(500).json({
            message: "Failed to send verification email. Please try again in a moment."
        })
    }

    res.status(200).json({
        message: "A new verification code has been sent to your email."
    })

}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {

    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    if (!user.isVerified) {
        return res.status(403).json({
            message: "Please verify your email before logging in.",
            email: user.email,
            needsVerification: true
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)
    res.status(200).json({
        message: "User loggedIn successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)



    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}



module.exports = {
    registerUserController,
    verifyOtpController,
    resendOtpController,
    loginUserController,
    logoutUserController,
    getMeController
}