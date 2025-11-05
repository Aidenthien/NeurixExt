import { useState, useEffect } from "react"
import logoImage from "~assets/NeurixExt.png"
import { AI_MODELS } from "~backend/config/models"
import { getSingleAIResponse } from "~backend/services/ai-service"
import type { AIRequest } from "~backend/types/ai-models"

interface AIResponse {
  model: string
  text: string
  icon: string
  color: string
}

interface Message {
  id: number
  text: string
  sender: "user" | "ai"
  timestamp: Date
  aiResponses?: AIResponse[]
}

interface ModelConfig {
  name: string
  icon: string
  color: string
  available: boolean
  enabled: boolean
}

function PopupApp() {
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [expandedResponse, setExpandedResponse] = useState<{ messageId: number; modelName: string } | null>(null)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [availableModels, setAvailableModels] = useState<ModelConfig[]>([])
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set())
  const [checkingStatus, setCheckingStatus] = useState(false)

  const aiModels = AI_MODELS.map(model => ({
    name: model.name,
    icon: model.icon,
    color: model.color,
    available: false,
    enabled: model.enabled
  }))

  const renderMarkdown = (text: string) => {
    let html = text
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    html = html.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>')
    // Line breaks
    html = html.replace(/\n/g, '<br/>')
    
    return html
  }

  useEffect(() => {
    const savedSelection = localStorage.getItem('selectedModels')
    if (savedSelection) {
      setSelectedModels(new Set(JSON.parse(savedSelection)))
    } else {
      setSelectedModels(new Set(aiModels.map(m => m.name)))
    }
  }, [])

  useEffect(() => {
    if (showChat && availableModels.length === 0) {
      checkModelsStatus()
    }
  }, [showChat])

  const checkModelsStatus = async () => {
    setCheckingStatus(true)
    const modelsWithStatus = await Promise.all(
      aiModels.map(async (model) => {
        const isAvailable = await checkSingleModelStatus(model.name)
        return { ...model, available: isAvailable }
      })
    )
    setAvailableModels(modelsWithStatus)
    setCheckingStatus(false)
  }

  const checkSingleModelStatus = async (modelName: string): Promise<boolean> => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models')
      if (response.ok) {
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const handleModelToggle = (modelName: string) => {
    const newSelection = new Set(selectedModels)
    if (newSelection.has(modelName)) {
      newSelection.delete(modelName)
    } else {
      newSelection.add(modelName)
    }
    setSelectedModels(newSelection)
    localStorage.setItem('selectedModels', JSON.stringify(Array.from(newSelection)))
  }

  const handleSelectAll = () => {
    const availableModelNames = availableModels
      .filter(m => m.available)
      .map(m => m.name)
    setSelectedModels(new Set(availableModelNames))
    localStorage.setItem('selectedModels', JSON.stringify(availableModelNames))
  }

  const handleDeselectAll = () => {
    setSelectedModels(new Set())
    localStorage.setItem('selectedModels', JSON.stringify([]))
  }

  const handleServiceClick = () => {
    setShowChat(true)
  }

  const handleBackClick = () => {
    setShowChat(false)
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || selectedModels.size === 0) return

    const userMessageText = inputText
    const newMessage: Message = {
      id: messages.length + 1,
      text: userMessageText,
      sender: "user",
      timestamp: new Date()
    }

    setMessages([...messages, newMessage])
    setInputText("")
    setIsLoading(true)

    const selectedAvailableModels = availableModels.filter(
      model => selectedModels.has(model.name) && model.available
    )

    // Create AI request
    const request: AIRequest = {
      message: userMessageText,
      temperature: 0.7,
      maxTokens: 500
    }

    // Create AI message placeholder with loading states
    const aiMessageId = messages.length + 2
    const initialResponses: AIResponse[] = selectedAvailableModels.map((model) => ({
      model: model.name,
      icon: model.icon,
      color: model.color,
      text: '⏳ Loading...'
    }))

    const aiMessage: Message = {
      id: aiMessageId,
      text: "",
      sender: "ai",
      timestamp: new Date(),
      aiResponses: initialResponses
    }
    
    setMessages(prev => [...prev, aiMessage])
    setIsLoading(false)

    // Call all models in parallel and update responses as they arrive
    selectedAvailableModels.forEach(async (model, index) => {
      try {
        const result = await getSingleAIResponse(model.name, request)
        
        const updatedResponse: AIResponse = result ? {
          model: result.model,
          icon: model.icon,
          color: model.color,
          text: result.text
        } : {
          model: model.name,
          icon: model.icon,
          color: model.color,
          text: `❌ Error: Unable to get response from ${model.name}`
        }

        // Update the specific model's response
        setMessages(prev => prev.map(msg => {
          if (msg.id === aiMessageId) {
            const updatedResponses = [...(msg.aiResponses || [])]
            updatedResponses[index] = updatedResponse
            return { ...msg, aiResponses: updatedResponses }
          }
          return msg
        }))
      } catch (error) {
        console.error(`Error getting response from ${model.name}:`, error)
        
        // Update with error message
        setMessages(prev => prev.map(msg => {
          if (msg.id === aiMessageId) {
            const updatedResponses = [...(msg.aiResponses || [])]
            updatedResponses[index] = {
              model: model.name,
              icon: model.icon,
              color: model.color,
              text: `❌ Error: Failed to connect to ${model.name}`
            }
            return { ...msg, aiResponses: updatedResponses }
          }
          return msg
        }))
      }
    })
  }

  const handleExpandResponse = (messageId: number, modelName: string) => {
    setExpandedResponse({ messageId, modelName })
  }

  const handleCloseExpanded = () => {
    setExpandedResponse(null)
  }

  const handleCopyResponse = (text: string) => {
    const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/<br\/>/g, '\n')
    navigator.clipboard.writeText(cleanText)
  }

  const getExpandedResponseData = () => {
    if (!expandedResponse) return null
    const message = messages.find(m => m.id === expandedResponse.messageId)
    return message?.aiResponses?.find(r => r.model === expandedResponse.modelName)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`popup-container ${showChat ? 'chat-active' : ''}`}>
      <div className="popup-header">
        <div className="logo-section">
          <button 
            className={`back-button ${showChat ? 'visible' : ''}`} 
            onClick={handleBackClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <img src={logoImage} alt="NeurixExt Logo" className={`logo-icon ${showChat ? 'compact' : ''}`} />
          <div className="logo-text">
            <h1>NeurixExt</h1>
            <span className="tagline">{showChat ? "AI Chat" : "AI Assistant"}</span>
          </div>
        </div>
        {showChat && (
          <button
            className="model-selector-button header-button"
            onClick={() => setShowModelSelector(!showModelSelector)}
            title="Select AI models"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
            </svg>
            <span className="model-count">{selectedModels.size}</span>
          </button>
        )}
      </div>

      <div className="popup-content-wrapper">
        <div className={`popup-content ${showChat ? 'slide-left' : 'slide-right'}`}>
          <div className="service-cards">
            <div
              className="service-card"
              onClick={handleServiceClick}
            >
              <div className="service-icon" style={{ color: "rgba(240, 147, 251, 0.8)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <path d="M12 7v6"></path>
                  <path d="M9 10l3 3 3-3"></path>
                </svg>
              </div>
              <div className="service-info">
                <h3 className="service-title">AI Smart Reply</h3>
                <p className="service-description">Generate intelligent reply suggestions powered by advanced AI</p>
              </div>
              <div className="service-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className={`chat-view ${showChat ? 'slide-right' : 'slide-left'}`}>
          <div className="chat-container">
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="welcome-message">
                  <div className="welcome-icon">✨</div>
                  <h3>Welcome to AI Smart Reply</h3>
                  <p>Send a message to get intelligent responses from multiple AI models simultaneously</p>
                </div>
              )}
              {messages.map((message) => (
                <div key={message.id}>
                  {message.sender === "user" ? (
                    <div className="message message-user">
                      <div className="message-content">
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
                      </div>
                      <div className="message-time">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ) : (
                    <div className="ai-responses-container">
                      <div className="ai-responses-header">
                        <span className="ai-badge">🤖 AI Responses</span>
                        <span className="response-count">{message.aiResponses?.length || 0} models</span>
                      </div>
                      <div className="ai-responses-grid">
                        {message.aiResponses?.map((response) => (
                          <div 
                            key={response.model}
                            className="ai-response-card"
                            onClick={() => handleExpandResponse(message.id, response.model)}
                          >
                            <div className="ai-response-header">
                              <div className="ai-model-info">
                                <span className="ai-model-icon">{response.icon}</span>
                                <span className="ai-model-name">{response.model}</span>
                              </div>
                              <svg className="expand-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <polyline points="9 21 3 21 3 15"></polyline>
                                <line x1="21" y1="3" x2="14" y2="10"></line>
                                <line x1="3" y1="21" x2="10" y2="14"></line>
                              </svg>
                            </div>
                            <div className="ai-response-preview">
                              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(response.text.substring(0, 120) + '...') }} />
                            </div>
                            <div className="view-more">Click to view full response</div>
                          </div>
                        ))}
                      </div>
                      <div className="message-time">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="loading-indicator">
                  <div className="loading-spinner"></div>
                  <span>Getting responses from AI models...</span>
                </div>
              )}
            </div>
            <div className="chat-input-container">
              <textarea
                className="chat-input"
                placeholder={selectedModels.size === 0 ? "Select models first..." : "Type your message..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                disabled={selectedModels.size === 0}
              />
              <button 
                className="send-button"
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading || selectedModels.size === 0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModelSelector && (
        <div className="model-selector-overlay" onClick={() => setShowModelSelector(false)}>
          <div className="model-selector-panel" onClick={(e) => e.stopPropagation()}>
            <div className="model-selector-header">
              <h4>Select AI Models</h4>
              <div className="model-selector-actions">
                <button onClick={handleSelectAll} className="selector-action-btn">All</button>
                <button onClick={handleDeselectAll} className="selector-action-btn">None</button>
                <button onClick={checkModelsStatus} className="selector-action-btn" disabled={checkingStatus}>
                  {checkingStatus ? '...' : '🔄'}
                </button>
              </div>
            </div>
            <div className="model-selector-list">
              {availableModels.length === 0 ? (
                <div className="model-selector-loading">
                  Checking model availability...
                </div>
              ) : (
                availableModels.map((model) => (
                  <label
                    key={model.name}
                    className={`model-selector-item ${!model.available ? 'unavailable' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedModels.has(model.name)}
                      onChange={() => handleModelToggle(model.name)}
                      disabled={!model.available}
                    />
                    <span className="model-checkbox-icon">{model.icon}</span>
                    <span className="model-checkbox-name">{model.name}</span>
                    {!model.available && <span className="model-status-badge">Unavailable</span>}
                    {model.available && <span className="model-status-badge available">Available</span>}
                  </label>
                ))
              )}
            </div>
            <div className="model-selector-footer">
              <span className="selected-count">{selectedModels.size} model(s) selected</span>
            </div>
          </div>
        </div>
      )}

      <div className={`popup-footer ${showChat ? 'hidden' : ''}`}>
        <a href="mailto:aidenthienweijian@gmail.com" className="footer-link">
          <svg className="footer-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>aidenthienweijian@gmail.com</span>
        </a>
        <a href="https://discord.com/users/aidennnn827" target="_blank" rel="noopener noreferrer" className="footer-link">
          <svg className="footer-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"></path>
          </svg>
          <span>aidennnn827</span>
        </a>
      </div>

      {expandedResponse && (
        <div className="expanded-overlay" onClick={handleCloseExpanded}>
          <div className="expanded-modal" onClick={(e) => e.stopPropagation()}>
            <div className="expanded-header">
              <div className="expanded-model-info">
                <span className="expanded-icon">{getExpandedResponseData()?.icon}</span>
                <div>
                  <h3>{getExpandedResponseData()?.model}</h3>
                  <span className="expanded-subtitle">Full Response</span>
                </div>
              </div>
              <div className="expanded-actions">
                <button
                  className="modal-copy-btn"
                  onClick={() => handleCopyResponse(getExpandedResponseData()?.text || '')}
                  title="Copy response"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
                <button className="modal-close-btn" onClick={handleCloseExpanded}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div className="expanded-content">
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(getExpandedResponseData()?.text || '') }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PopupApp
