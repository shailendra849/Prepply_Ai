const interviewReportModel = require("../models/interviewReport.model")
const mockSessionModel = require("../models/mockSession.model")
const { evaluateInterviewAnswer } = require("../services/ai.service")

/**
 * @description shape a question document for sending to the client - never leak
 * `idealAnswerNotes`/`intention`, since that would let the candidate see the
 * "cheat notes" before answering.
 */
function toPublicQuestion(questionDoc, index, total) {
    if (!questionDoc) return null
    return {
        index,
        total,
        question: questionDoc.question,
        type: questionDoc.type
    }
}

/**
 * @description Controller to start a new mock interview session based on an existing interview report.
 * @route POST /api/mock/start/:interviewReportId
 * @access private
 */
async function startMockSessionController(req, res) {

    const { interviewReportId } = req.params

    const report = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

    if (!report) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const questions = [
        ...report.technicalQuestions.map(q => ({
            question: q.question,
            intention: q.intention,
            idealAnswerNotes: q.answer,
            type: "technical"
        })),
        ...report.behavioralQuestions.map(q => ({
            question: q.question,
            intention: q.intention,
            idealAnswerNotes: q.answer,
            type: "behavioral"
        }))
    ]

    if (questions.length === 0) {
        return res.status(400).json({
            message: "This interview report has no questions to practice with."
        })
    }

    const session = await mockSessionModel.create({
        interviewReport: report._id,
        user: req.user.id,
        questions,
        currentQuestionIndex: 0,
        answers: [],
        status: "in-progress"
    })

    res.status(201).json({
        message: "Mock interview session started.",
        sessionId: session._id,
        totalQuestions: session.questions.length,
        currentQuestion: toPublicQuestion(session.questions[ 0 ], 0, session.questions.length)
    })

}

/**
 * @description Controller to submit an answer for the current question of a mock session,
 * get AI feedback on it, and receive the next question.
 * @route POST /api/mock/:sessionId/answer
 * @access private
 */
async function submitMockAnswerController(req, res) {

    const { sessionId } = req.params
    const { answer } = req.body

    const session = await mockSessionModel.findOne({ _id: sessionId, user: req.user.id })

    if (!session) {
        return res.status(404).json({
            message: "Mock interview session not found."
        })
    }

    if (session.status === "completed") {
        return res.status(400).json({
            message: "This mock interview session is already completed."
        })
    }

    const currentQuestion = session.questions[ session.currentQuestionIndex ]

    const evaluation = await evaluateInterviewAnswer({
        question: currentQuestion.question,
        idealAnswerNotes: currentQuestion.idealAnswerNotes,
        userAnswer: answer
    })

    session.answers.push({
        question: currentQuestion.question,
        type: currentQuestion.type,
        userAnswer: answer || "",
        feedback: evaluation.feedback,
        improvedAnswer: evaluation.improvedAnswer,
        score: evaluation.score
    })

    session.currentQuestionIndex += 1

    const isLastQuestion = session.currentQuestionIndex >= session.questions.length
    session.status = isLastQuestion ? "completed" : "in-progress"

    await session.save()

    const responsePayload = {
        message: "Answer evaluated successfully.",
        feedback: {
            feedback: evaluation.feedback,
            improvedAnswer: evaluation.improvedAnswer,
            score: evaluation.score
        },
        status: session.status
    }

    if (!isLastQuestion) {
        responsePayload.currentQuestion = toPublicQuestion(
            session.questions[ session.currentQuestionIndex ],
            session.currentQuestionIndex,
            session.questions.length
        )
    } else {
        const scores = session.answers.map(a => a.score).filter(s => typeof s === "number")
        responsePayload.summary = {
            averageScore: scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0,
            totalQuestions: session.questions.length,
            answers: session.answers
        }
    }

    res.status(200).json(responsePayload)

}

/**
 * @description Controller to fetch a mock session (to resume it, or review a completed one).
 * @route GET /api/mock/:sessionId
 * @access private
 */
async function getMockSessionController(req, res) {

    const { sessionId } = req.params

    const session = await mockSessionModel.findOne({ _id: sessionId, user: req.user.id })

    if (!session) {
        return res.status(404).json({
            message: "Mock interview session not found."
        })
    }

    const payload = {
        message: "Mock interview session fetched successfully.",
        sessionId: session._id,
        status: session.status,
        totalQuestions: session.questions.length,
        answers: session.answers
    }

    if (session.status === "in-progress") {
        payload.currentQuestion = toPublicQuestion(
            session.questions[ session.currentQuestionIndex ],
            session.currentQuestionIndex,
            session.questions.length
        )
    } else {
        const scores = session.answers.map(a => a.score).filter(s => typeof s === "number")
        payload.summary = {
            averageScore: scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0,
            totalQuestions: session.questions.length,
            answers: session.answers
        }
    }

    res.status(200).json(payload)

}

module.exports = { startMockSessionController, submitMockAnswerController, getMockSessionController }
