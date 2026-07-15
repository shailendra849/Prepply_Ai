const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const path = require("path")

const app = express()
app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const mockRouter = require("./routes/mock.routes")




/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/mock", mockRouter)

// Serve React app for all non-API routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
});

module.exports = app