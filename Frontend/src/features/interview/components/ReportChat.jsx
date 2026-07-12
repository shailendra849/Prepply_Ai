import React, { useState, useRef, useEffect } from 'react'
import '../style/chat.scss'
import { chatAboutReport } from '../services/interview.api'

const ReportChat = ({ interviewId }) => {

    const [ open, setOpen ] = useState(false)
    const [ messages, setMessages ] = useState([])
    const [ input, setInput ] = useState("")
    const [ sending, setSending ] = useState(false)
    const [ error, setError ] = useState("")

    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [ messages, sending, open ])

    const handleSend = async (e) => {
        e.preventDefault()
        const trimmed = input.trim()
        if (!trimmed || sending) return

        setError("")
        const nextMessages = [ ...messages, { role: 'user', text: trimmed } ]
        setMessages(nextMessages)
        setInput("")
        setSending(true)

        try {
            const data = await chatAboutReport({
                interviewId,
                message: trimmed,
                history: messages
            })
            setMessages(m => [ ...m, { role: 'ai', text: data.reply } ])
        } catch (err) {
            setError(err?.response?.data?.message || "Couldn't get a reply. Please try again.")
        } finally {
            setSending(false)
        }
    }

    return (
        <>
            <button className={`chat-fab ${open ? 'chat-fab--hidden' : ''}`} onClick={() => setOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                Ask AI
            </button>

            <div className={`chat-panel ${open ? 'chat-panel--open' : ''}`}>
                <div className='chat-panel__header'>
                    <div>
                        <p className='chat-panel__title'>Ask about this report</p>
                        <p className='chat-panel__subtitle'>Follow-up questions, clarifications, better answers</p>
                    </div>
                    <button className='chat-panel__close' onClick={() => setOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                <div className='chat-panel__messages' ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className='chat-empty'>
                            <p>Ask me anything about this report -</p>
                            <ul>
                                <li onClick={() => setInput("Why would they ask the first technical question?")}>"Why would they ask the first technical question?"</li>
                                <li onClick={() => setInput("Give me a better answer for my weakest skill gap.")}>"Give me a better answer for my weakest skill gap."</li>
                                <li onClick={() => setInput("What should I focus on in the first 2 days?")}>"What should I focus on in the first 2 days?"</li>
                            </ul>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div key={i} className={`chat-bubble chat-bubble--${m.role}`}>
                            {m.text}
                        </div>
                    ))}

                    {sending && (
                        <div className='chat-bubble chat-bubble--ai chat-bubble--typing'>
                            <span /><span /><span />
                        </div>
                    )}

                    {error && <div className='chat-error'>{error}</div>}
                </div>

                <form className='chat-panel__input' onSubmit={handleSend}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder='Ask a follow-up question...'
                    />
                    <button type='submit' disabled={sending || !input.trim()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                    </button>
                </form>
            </div>
        </>
    )
}

export default ReportChat
