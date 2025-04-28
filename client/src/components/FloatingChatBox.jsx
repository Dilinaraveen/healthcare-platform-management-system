import React, { useState, useEffect, useRef, useContext } from "react";
import { FaComments } from "react-icons/fa";
import { io } from "socket.io-client";
import { AppContext } from "../context/AppContext";

const FloatingChatBox = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [newMessageReceived, setNewMessageReceived] = useState(false); 
  const messagesEndRef = useRef(null);
  const { backendUrl } = useContext(AppContext);

 
  useEffect(() => {
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [backendUrl]);

  useEffect(() => {
    if (socket && userId) {
      socket.emit("join", { userId, role: "user" });

      fetchMessages();

      socket.on("newMessage", (msg) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { from: "admin", text: msg.text },
        ]);
        if (!open) {
          setNewMessageReceived(true);
        }
      });

      socket.on("userTyping", ({ userId }) => {
        if (userId === "admin") setIsTyping(true);
      });

      socket.on("userStopTyping", ({ userId }) => {
        if (userId === "admin") setIsTyping(false);
      });

      return () => {
        if (socket) {
          socket.off("newMessage");
          socket.off("userTyping");
          socket.off("userStopTyping");
        }
      };
    }
  }, [socket, userId, open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 
  const fetchMessages = async () => {
    try {
      if (!userId) return;

      const response = await fetch(`${backendUrl}/api/user/messages/${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();

      if (data.length > 0) {
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  
  const sendMessage = () => {
    if (message.trim() && socket) {
      const newMessage = { from: "user", text: message };

      setMessages([...messages, newMessage]);

      socket.emit("sendMessage", {
        from: userId,
        to: "admin",
        text: message,
      });

      setMessage("");

      socket.emit("stopTyping", { from: userId, to: "admin" });
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (socket) {
      socket.emit("typing", { from: userId, to: "admin" });

      clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => {
        socket.emit("stopTyping", { from: userId, to: "admin" });
      }, 1000);
    }
  };

  return (
    <div>
      {/* Floating Chat Button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) setNewMessageReceived(false); 
        }}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50 hover:bg-blue-700"
      >
        <FaComments size={20} />
        {newMessageReceived && !open && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-white shadow-xl rounded-lg flex flex-col overflow-hidden z-50">
          <div onClick={() => setOpen(!open)} className="bg-blue-600 text-white p-3 font-semibold">
            Chat with Admin
          </div>
          <div className="flex-1 p-3 overflow-y-auto max-h-80 flex flex-col gap-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-xs p-2 text-sm rounded-md ${
                  msg.from === "admin"
                    ? "bg-gray-200 self-start"
                    : "bg-blue-100 self-end"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="text-xs text-gray-500 self-start">
                Admin is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex border-t p-2 gap-2">
            <input
              type="text"
              className="flex-1 border p-1 px-2 rounded-md text-sm"
              placeholder="Type a message..."
              value={message}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatBox;
