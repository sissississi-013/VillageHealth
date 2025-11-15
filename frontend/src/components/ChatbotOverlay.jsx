import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatbotOverlay.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function ChatbotOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your WHO IMCI assistant. I can help clarify questions about the assessment form, clinical guidelines, or treatment protocols. How can I assist you?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chatbot`, {
        message: userMessage,
        context: 'WHO IMCI assessment assistant'
      });

      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response
      }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="chatbot-float-button"
          onClick={() => setIsOpen(true)}
          title="Need help? Ask me anything!"
        >
          💬
          <span className="chatbot-badge">Help</span>
        </button>
      )}

      {/* Chat Overlay */}
      {isOpen && (
        <div className="chatbot-overlay">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span className="chatbot-icon">🏥</span>
              <div>
                <h4>WHO IMCI Assistant</h4>
                <p className="chatbot-subtitle">Ask me anything</p>
              </div>
            </div>
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-message ${msg.role}`}
              >
                <div className="message-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-message assistant">
                <div className="message-bubble loading">
                  <span className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-container">
            <textarea
              className="chatbot-input"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="2"
              disabled={isLoading}
            />
            <button
              className="chatbot-send"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              ➤
            </button>
          </div>

          <div className="chatbot-suggestions">
            <button
              className="suggestion-chip"
              onClick={() => setInput('What are the danger signs I should look for?')}
            >
              What are danger signs?
            </button>
            <button
              className="suggestion-chip"
              onClick={() => setInput('How do I assess dehydration?')}
            >
              Assess dehydration
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotOverlay;
