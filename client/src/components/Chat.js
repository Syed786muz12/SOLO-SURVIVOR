"use client"

import { useEffect, useRef } from "react"

const Chat = ({ showChat, setShowChat, messages, messageInput, setMessageInput, onSendMessage }) => {
  const inputRef = useRef()
  const messagesEndRef = useRef()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (showChat && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showChat])

  // Handle key events for chat
  useEffect(() => {
    const handleChatKeyDown = (e) => {
      if (!showChat) return

      // Prevent game controls when chat is open
      e.stopPropagation()

      if (e.key === "Enter") {
        e.preventDefault()
        onSendMessage()
        setShowChat(false)
      } else if (e.key === "Escape") {
        e.preventDefault()
        setShowChat(false)
      }
    }

    // Add event listener with capture to intercept before game controls
    document.addEventListener("keydown", handleChatKeyDown, true)

    return () => {
      document.removeEventListener("keydown", handleChatKeyDown, true)
    }
  }, [showChat, onSendMessage, setShowChat])

  if (!showChat) {
    return (
      <div
        className="chat-toggle"
        style={{
          position: "absolute",
          bottom: "100px",
          left: "10px",
          background: "rgba(0,0,0,0.5)",
          color: "white",
          padding: "5px 10px",
          borderRadius: "5px",
          fontSize: "12px",
        }}
      >
        Press Enter to open chat
      </div>
    )
  }

  return (
    <div
      className="chat-container"
      style={{
        position: "absolute",
        bottom: "100px",
        left: "10px",
        width: "400px",
        height: "300px",
        background: "rgba(0,0,0,0.8)",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        padding: "10px",
      }}
    >
      {/* Messages Area */}
      <div
        className="messages-area"
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: "10px",
          padding: "5px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              color: msg.team === "blue" ? "#4A90E2" : "#E24A4A",
              marginBottom: "5px",
              fontSize: "14px",
            }}
          >
            <span style={{ fontWeight: "bold" }}>{msg.sender}: </span>
            <span style={{ color: "white" }}>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="input-area"
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "5px",
            border: "none",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            outline: "none",
          }}
          onKeyDown={(e) => {
            // Prevent event bubbling to game controls
            e.stopPropagation()
          }}
        />
        <button
          onClick={() => {
            onSendMessage()
            setShowChat(false)
          }}
          style={{
            padding: "8px 15px",
            borderRadius: "5px",
            border: "none",
            background: "#4A90E2",
            color: "white",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "#888",
          marginTop: "5px",
        }}
      >
        Press Enter to send, Escape to close
      </div>
    </div>
  )
}

export default Chat
