const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const mockController = require("../controllers/mock.controller")

const mockRouter = express.Router()


/**
 * @route POST /api/mock/start/:interviewReportId
 * @description start a new mock interview session based on an existing interview report.
 * @access private
 */
mockRouter.post("/start/:interviewReportId", authMiddleware.authUser, mockController.startMockSessionController)


/**
 * @route POST /api/mock/:sessionId/answer
 * @description submit an answer for the current question, get AI feedback, and receive the next question.
 * @access private
 */
mockRouter.post("/:sessionId/answer", authMiddleware.authUser, mockController.submitMockAnswerController)


/**
 * @route GET /api/mock/:sessionId
 * @description fetch a mock session to resume or review it.
 * @access private
 */
mockRouter.get("/:sessionId", authMiddleware.authUser, mockController.getMockSessionController)


module.exports = mockRouter
