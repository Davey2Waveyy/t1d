import { useEffect, useRef, useState } from 'react'
import { Activity, Bot, Loader2, Lock, Send, Sparkles, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useSettings } from '../../contexts/SettingsContext'
import { getIntegrationAccess } from '../../lib/dashboardAccess'
import { AIService } from '../../lib/AIService'
import { getGlucoseReadings, getInsulinDoses, getMeals } from '../../lib/dataService'
import './AIChatbot.css'

const starterPrompts = [
  'What stands out in my glucose data today?',
  'Did meals or insulin likely drive the latest rise?',
  'Summarize the last 24 hours in plain English.',
]

export default function AIChatbot({ onOpenSettings }) {
  const { settings } = useSettings()
  const { user, isGuest } = useAuth()
  const access = getIntegrationAccess({ user, isGuest })
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatSession, setChatSession] = useState(null)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setChatSession(null)
    setMessages([])
    setError(null)
  }, [access.canUseProtectedFeatures, settings.enableAiInsights, settings.geminiApiKey])

  useEffect(() => {
    if (
      access.canUseProtectedFeatures &&
      settings.enableAiInsights &&
      settings.geminiApiKey &&
      !chatSession &&
      !isLoading
    ) {
      initChat()
    }
  }, [access.canUseProtectedFeatures, chatSession, isLoading, settings.enableAiInsights, settings.geminiApiKey])

  const initChat = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const aiService = new AIService(settings.geminiApiKey)

      const [mealsRes, dosesRes, readingsRes] = await Promise.all([
        getMeals(20),
        getInsulinDoses(20),
        getGlucoseReadings(48),
      ])

      const context = {
        glucoseReadings: readingsRes.data,
        meals: mealsRes.data,
        insulinDoses: dosesRes.data,
        settings: {
          glucoseUnit: settings.glucoseUnit,
          timezone: settings.timezone,
          targetGlucose: settings.targetGlucose,
          lowThreshold: settings.lowThreshold,
          highThreshold: settings.highThreshold,
        },
        currentTime: new Date().toISOString(),
      }

      const session = await aiService.startChatSession(context)

      setChatSession(session)
      setMessages([
        {
          role: 'model',
          text: "Hi, I'm the Betatrace assistant. I can summarize the last 48 hours of glucose, meals, and insulin activity for this session.",
        },
      ])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const sendPrompt = async (message) => {
    if (!message.trim() || !chatSession || isLoading) {
      return
    }

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: message }])
    setIsLoading(true)

    try {
      const result = await chatSession.sendMessage(message)
      const responseText = result.response.text()
      setMessages((prev) => [...prev, { role: 'model', text: responseText }])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'I ran into an issue while analyzing that request. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async (event) => {
    event.preventDefault()
    await sendPrompt(input.trim())
  }

  const renderLockedState = () => (
    <div className="assistant-panel assistant-panel--locked">
      <div className="assistant-panel-header">
        <div>
          <span className="assistant-eyebrow">AI assistant</span>
          <h3>Preview only in guest mode</h3>
        </div>
        <span className="assistant-status assistant-status--locked">
          <Lock size={12} /> Locked
        </span>
      </div>
      <p className="assistant-copy">
        Signed-in users can add a Gemini key for the current session and ask for pattern summaries, meal timing analysis, and trend explanations.
      </p>
      <div className="assistant-preview">
        <div className="chat-message chat-message--model">
          <div className="chat-message-avatar"><Bot size={14} /></div>
          <div className="chat-message-bubble">
            Ask me why your glucose climbed overnight or whether your latest meal likely drove the rise.
          </div>
        </div>
        <div className="chat-message chat-message--user">
          <div className="chat-message-avatar"><User size={14} /></div>
          <div className="chat-message-bubble">What changed after dinner last night?</div>
        </div>
      </div>
    </div>
  )

  const renderSetupState = (title, description) => (
    <div className="assistant-panel assistant-panel--empty">
      <div className="assistant-panel-header">
        <div>
          <span className="assistant-eyebrow">AI assistant</span>
          <h3>{title}</h3>
        </div>
        <span className="assistant-status">
          <Sparkles size={12} /> Session only
        </span>
      </div>
      <p className="assistant-copy">{description}</p>
      <div className="assistant-prompt-list">
        {starterPrompts.map((prompt) => (
          <div key={prompt} className="assistant-prompt-pill">
            {prompt}
          </div>
        ))}
      </div>
      {onOpenSettings && (
        <button className="btn btn-secondary btn-sm" type="button" onClick={onOpenSettings}>
          Open Settings
        </button>
      )}
    </div>
  )

  if (access.showLockedPreview) {
    return renderLockedState()
  }

  if (!settings.enableAiInsights) {
    return renderSetupState(
      'Assistant is turned off',
      'Enable AI Assistant in Settings to bring the chat online for this session.'
    )
  }

  if (!settings.geminiApiKey) {
    return renderSetupState(
      'Gemini key needed',
      'Add your Gemini API key in Settings. Betatrace keeps it in React session state only and clears it on refresh or sign-out.'
    )
  }

  return (
    <section className="assistant-panel">
      <div className="assistant-panel-header">
        <div>
          <span className="assistant-eyebrow">AI assistant</span>
          <h3>Betatrace copilot</h3>
        </div>
        <span className="assistant-status">
          <Activity size={12} /> Session only
        </span>
      </div>

      <div className="assistant-prompt-list">
        {starterPrompts.map((prompt) => (
          <button
            key={prompt}
            className="assistant-prompt-pill"
            type="button"
            onClick={() => sendPrompt(prompt)}
            disabled={!chatSession || isLoading}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="chatbot-messages">
        {error ? (
          <div className="assistant-error">
            <p>{error}</p>
            <button className="btn btn-secondary btn-sm" type="button" onClick={initChat}>
              Retry
            </button>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={`${msg.role}-${idx}`} className={`chat-message chat-message--${msg.role}`}>
                <div className="chat-message-avatar">
                  {msg.role === 'model' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className="chat-message-bubble">{msg.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message chat-message--model">
                <div className="chat-message-avatar"><Bot size={14} /></div>
                <div className="chat-message-bubble chat-message-typing">
                  <Loader2 size={16} className="spinner" /> Analyzing...
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-input-form" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Ask about a spike, low, meal, or insulin pattern"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading || !chatSession}
          className="chatbot-input"
        />
        <button
          type="submit"
          className="chatbot-send-btn"
          disabled={!input.trim() || isLoading || !chatSession}
        >
          <Send size={18} />
        </button>
      </form>

      <p className="chatbot-disclaimer">
        Always sanity-check dose or treatment decisions with your clinician.
      </p>
    </section>
  )
}
