import React, { useState, useEffect, useRef } from 'react';
import aiService from '../services/aiService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export const GenieChatbot = ({ onOpenFoodDetail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: "🧞 Greetings foodie! I am Food Genie, your culinary AI companion.\n\nTell me what you're craving, dietary preferences (e.g. Pure Veg, Keto), spicy tolerance, or budget — and I'll summon the perfect feast for you!",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [addedItemIds, setAddedItemIds] = useState(new Set());

  // Voice Interaction States (STT & TTS)
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
    return localStorage.getItem('genie_voice_enabled') !== 'false';
  });
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const recognitionRef = useRef(null);

  const { cartItems, addToCart, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize Speech Recognition (STT) on mount
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Optimized for Indian English culinary terms & accents

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInputMessage(currentTranscript);

        // If user finished their sentence, auto-submit
        if (event.results[0].isFinal && currentTranscript.trim().length > 0) {
          setIsListening(false);
          handleSendMessage(currentTranscript.trim());
        }
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition warning/error:', err.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Listen for global open chat & voice commands (e.g. from Hero section CTA)
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
    };
    const handleOpenVoice = () => {
      setIsOpen(true);
      setTimeout(() => {
        if (recognitionRef.current && !isListening) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started or unsupported
          }
        }
      }, 350);
    };

    window.addEventListener('open-genie-chat', handleOpenChat);
    window.addEventListener('open-genie-voice', handleOpenVoice);

    return () => {
      window.removeEventListener('open-genie-chat', handleOpenChat);
      window.removeEventListener('open-genie-voice', handleOpenVoice);
    };
  }, [isListening]);

  // Text-To-Speech (TTS) Voice Engine
  const speakMessage = (text, messageId = null) => {
    if (!('speechSynthesis' in window)) return;

    // Toggle stop if already speaking this message
    if (speakingMessageId === messageId && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text: strip markdown asterisks, underlines, emojis, bullet symbols
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/_/g, '')
      .replace(/•/g, '')
      .replace(/₹/g, 'rupees ')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // strip emojis for clear speech
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.pitch = 1.05; // Slightly buoyant, friendly Genie tone
    utterance.rate = 1.02;

    // Select natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Google') ||
          v.name.includes('Natural') ||
          v.name.includes('Samantha') ||
          v.name.includes('Arthur') ||
          v.name.includes('Rishi'))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      setSpeakingMessageId(messageId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceSetting = () => {
    const nextVal = !isVoiceEnabled;
    setIsVoiceEnabled(nextVal);
    localStorage.setItem('genie_voice_enabled', nextVal.toString());
    if (!nextVal && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  };

  const handleToggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      try {
        // Cancel speech if Genie is talking while user wants to speak
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
        setInputMessage('');
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages, loading]);

  // Load quick inspiration suggestions on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await aiService.getSuggestions();
        if (res.success && res.suggestions) {
          setSuggestions(res.suggestions);
        }
      } catch (err) {
        console.warn('Failed to load Genie suggestions, using fallback', err);
      }
    };
    fetchSuggestions();
  }, []);

  // Send message to Genie AI
  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Build cart items context
      const cartContext = cartItems.map((item) => ({
        foodId: item.food?._id,
        name: item.food?.name,
        category: item.food?.category?.name,
      }));

      // Build conversation history for multi-turn AI context (last 6 messages)
      const chatHistory = messages
        .filter((m) => m.id !== 'welcome-1' && m.id !== 'welcome-reset')
        .slice(-6)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      // Call AI Service with message & history
      const res = await aiService.sendMessage({
        message: query,
        history: chatHistory,
        cartItems: cartContext,
        userPreferences: {
          userName: user?.name,
        },
      });

      if (res.success) {
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: res.reply,
          recommendations: res.recommendations || [],
          suggestedActions: res.suggestedActions || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Auto-play Genie speech response if voice is enabled
        if (isVoiceEnabled) {
          setTimeout(() => {
            speakMessage(res.reply, assistantMessage.id);
          }, 300);
        }
      } else {
        throw new Error(res.message || 'Genie failed to reply');
      }
    } catch (err) {
      console.error('Genie AI error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          role: 'assistant',
          text: "🧞 Apologies traveler! My magical lamp flickered. Please try rephrasing your request or ask for something specific like 'cheesy pizza' or 'spicy biryani'.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Cart Pairing
  const handleAskForPairing = async () => {
    if (cartItems.length === 0) {
      handleSendMessage('What are your most popular dishes?');
      return;
    }

    const itemNames = cartItems.map((i) => i.food?.name).join(', ');
    handleSendMessage(`What drinks or desserts pair best with my cart: ${itemNames}?`);
  };

  // Add Recommended Dish to Cart
  const handleAddToCart = (dish) => {
    addToCart(dish, 1);
    setAddedItemIds((prev) => new Set([...prev, dish._id]));

    // Clear badge after 2.5s
    setTimeout(() => {
      setAddedItemIds((prev) => {
        const next = new Set(prev);
        next.delete(dish._id);
        return next;
      });
    }, 2500);
  };

  // Clear chat history
  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        text: "🧞 Memory refreshed! What new dish can I summon for you today?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`genie-floating-trigger ${isOpen ? 'active' : ''}`}
        aria-label="Open Food Genie AI Chatbot"
        title="Ask Genie AI for smart food recommendations & pairings"
      >
        <span className="genie-lamp-pulse">✨</span>
        <span className="genie-lamp-icon">🧞</span>
        <span className="genie-trigger-text">Ask Genie AI</span>
        {cartItems.length > 0 && !isOpen && (
          <span className="genie-pairing-indicator" title="Pairings ready for your cart!">
            💡
          </span>
        )}
      </button>

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="genie-chat-window" role="dialog" aria-label="Genie AI Food Assistant">
          {/* Header */}
          <div className="genie-chat-header">
            <div className="genie-header-brand">
              <div className="genie-avatar-circle">
                <span>🧞</span>
                <span className="online-indicator-dot"></span>
              </div>
              <div className="genie-header-titles">
                <h3 className="genie-title">
                  Food Genie AI <span className="ai-version-pill">v2.0</span>
                </h3>
                <p className="genie-status-sub">Smart Recommender & Meal Pairing</p>
              </div>
            </div>

            <div className="genie-header-actions">
              <button
                onClick={toggleVoiceSetting}
                className={`btn-chat-action btn-voice-toggle ${isVoiceEnabled ? 'active' : 'muted'}`}
                title={isVoiceEnabled ? 'Genie Voice: ON (Click to mute)' : 'Genie Voice: MUTED (Click to enable)'}
                aria-label="Toggle voice responses"
              >
                {isVoiceEnabled ? '🔊' : '🔇'}
              </button>
              {cartItems.length > 0 && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="btn-chat-cart-peek"
                  title="View items in cart"
                >
                  🛍️ {cartItems.length}
                </button>
              )}
              <button
                onClick={handleClearHistory}
                className="btn-chat-action"
                title="Clear chat history"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-chat-close"
                aria-label="Close Genie AI chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Cart Awareness Banner */}
          {cartItems.length > 0 && (
            <div className="genie-cart-banner">
              <span className="cart-banner-icon">💡</span>
              <span className="cart-banner-text">
                Have <strong>{cartItems.length}</strong> {cartItems.length === 1 ? 'item' : 'items'} in cart.
              </span>
              <button
                onClick={handleAskForPairing}
                className="btn-ask-pairings"
                disabled={loading}
              >
                Pair with my cart ✨
              </button>
            </div>
          )}

          {/* Messages Stream */}
          <div className="genie-messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`genie-message-row ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="assistant-mini-avatar">🧞</div>
                )}

                <div className="genie-message-bubble">
                  {/* Speaker Action for Assistant Messages */}
                  {msg.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => speakMessage(msg.text, msg.id)}
                      className={`btn-bubble-speaker ${speakingMessageId === msg.id ? 'speaking' : ''}`}
                      title={speakingMessageId === msg.id ? 'Stop Voice' : 'Listen with Audio'}
                      aria-label="Listen with Audio"
                    >
                      {speakingMessageId === msg.id ? '⏹️' : '🔊'}
                    </button>
                  )}

                  {/* Message Text with simple formatting */}
                  <div className="message-content-text">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>
                        {paragraph.split('\n').map((line, lIdx) => (
                          <React.Fragment key={lIdx}>
                            {line.startsWith('**') ? (
                              <strong>{line.replace(/\*\*/g, '')}</strong>
                            ) : line.startsWith('_') ? (
                              <em>{line.replace(/_/g, '')}</em>
                            ) : (
                              line
                            )}
                            {lIdx < paragraph.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </p>
                    ))}
                  </div>

                  {/* Attached Food Recommendation Cards */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="chat-recommendations-grid">
                      {msg.recommendations.map((dish) => {
                        const isAdded = addedItemIds.has(dish._id);
                        return (
                          <div key={dish._id} className="chat-dish-card">
                            <div className="chat-dish-img-wrap">
                              <img
                                src={dish.image}
                                alt={dish.name}
                                className="chat-dish-img"
                              />
                              <span
                                className={`chat-diet-badge ${dish.isVeg ? 'badge-veg' : 'badge-nonveg'}`}
                              >
                                {dish.isVeg ? '🥬' : '🍗'}
                              </span>
                            </div>

                            <div className="chat-dish-body">
                              <h5 className="chat-dish-name">{dish.name}</h5>
                              <div className="chat-dish-meta-row">
                                <span className="chat-dish-price">₹{dish.price}</span>
                                <span className="chat-dish-rating">⭐ {dish.rating || 4.5}</span>
                                {dish.prepTimeMinutes && (
                                  <span className="chat-dish-time">⏱️ {dish.prepTimeMinutes}m</span>
                                )}
                              </div>

                              <div className="chat-dish-actions">
                                <button
                                  onClick={() => handleAddToCart(dish)}
                                  className={`btn-chat-add-cart ${isAdded ? 'btn-added' : ''}`}
                                >
                                  {isAdded ? '✓ Added!' : '➕ Add to Cart'}
                                </button>
                                {onOpenFoodDetail && (
                                  <button
                                    onClick={() => onOpenFoodDetail(dish)}
                                    className="btn-chat-view-detail"
                                    title="View full recipe and ingredients"
                                  >
                                    Inspect
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Follow-up Suggestion Chips */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="chat-followup-actions">
                      {msg.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSendMessage(action.query)}
                          className="chat-followup-pill"
                          disabled={loading}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="message-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="genie-message-row message-assistant">
                <div className="assistant-mini-avatar">🧞</div>
                <div className="genie-message-bubble genie-typing-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-hint">Genie is selecting the finest dishes...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Inspiration Carousel */}
          {messages.length <= 2 && suggestions.length > 0 && !loading && (
            <div className="genie-quick-prompts-bar">
              <span className="prompts-title">✨ Quick Inspiration:</span>
              <div className="prompts-scroll-row">
                {suggestions.map((sug) => (
                  <button
                    key={sug.id}
                    onClick={() => handleSendMessage(sug.query)}
                    className="quick-prompt-pill"
                  >
                    {sug.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Voice Listening Wave Indicator Banner */}
          {isListening && (
            <div className="genie-listening-banner">
              <span className="listening-pulse-dot"></span>
              <span className="listening-banner-text">
                🎙️ Listening to your voice... Speak your craving now!
              </span>
              <button
                type="button"
                onClick={handleToggleListening}
                className="btn-cancel-listening"
                title="Cancel voice listening"
              >
                Done
              </button>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="genie-input-form"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={
                isListening
                  ? "🎙️ Listening... say your craving..."
                  : "Ask: 'crispy ghee dosa', 'spicy biryani', 'healthy salad under 300'..."
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
              className={`genie-chat-input ${isListening ? 'input-listening' : ''}`}
            />

            {/* Voice Dictation (Microphone) Button */}
            <button
              type="button"
              onClick={handleToggleListening}
              className={`btn-genie-mic ${isListening ? 'listening' : ''}`}
              title={
                !speechSupported
                  ? 'Voice input not supported in this browser'
                  : isListening
                  ? 'Listening... Click to stop'
                  : 'Tap to speak your food order with AI Voice'
              }
              aria-label="Voice input"
            >
              {isListening ? '⏹️' : '🎙️'}
            </button>

            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="btn-genie-send"
              aria-label="Send message to Genie"
            >
              <span>✨</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default GenieChatbot;

