const mongoose = require("mongoose")

const answerRecordSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [ "technical", "behavioral" ],
        required: true
    },
    userAnswer: {
        type: String,
        default: ""
    },
    feedback: {
        type: String
    },
    improvedAnswer: {
        type: String
    },
    score: {
        type: Number,
        min: 0,
        max: 10
    }
}, { _id: false })

const mockSessionSchema = new mongoose.Schema({
    interviewReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    questions: [ {
        question: { type: String, required: true },
        intention: { type: String },
        idealAnswerNotes: { type: String },
        type: { type: String, enum: [ "technical", "behavioral" ], required: true }
    } ],
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    answers: [ answerRecordSchema ],
    status: {
        type: String,
        enum: [ "in-progress", "completed" ],
        default: "in-progress"
    }
}, { timestamps: true })

module.exports = mongoose.model("MockSession", mockSessionSchema)
