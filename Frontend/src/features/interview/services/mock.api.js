import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})

/**
 * @description Service to start a new mock interview session based on an existing interview report.
 */
export const startMockSession = async (interviewReportId) => {
    const response = await api.post(`/api/mock/start/${interviewReportId}`)
    return response.data
}

/**
 * @description Service to submit an answer for the current question of a mock session.
 */
export const submitMockAnswer = async ({ sessionId, answer }) => {
    const response = await api.post(`/api/mock/${sessionId}/answer`, { answer })
    return response.data
}

/**
 * @description Service to fetch a mock session, to resume or review it.
 */
export const getMockSession = async (sessionId) => {
    const response = await api.get(`/api/mock/${sessionId}`)
    return response.data
}
