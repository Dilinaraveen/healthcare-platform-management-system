import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";

const Messages = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [allMessages, setAllMessages] = useState({});
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState([]); 
  const { backendUrl } = useContext(AdminContext);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [backendUrl]);


  useEffect(() => {
    if (socket) {
      socket.emit("join", { userId: "admin", role: "admin" });
      fetchUsers();

      socket.on("newMessage", (msg) => {
        console.log("New message received:", msg);

        setAllMessages((prev) => {

          const updatedMessages = [
            ...(prev[msg.from] || []),
            { from: msg.from, text: msg.text },
          ];

          if (prev[msg.from]?.some((message) => message.text === msg.text)) {
            return prev; 
          }

          return {
            ...prev,
            [msg.from]: updatedMessages,
          };
        });

        if (!selectedUser || selectedUser._id !== msg.from) {
          setUnreadMessages((prev) => {
            if (!prev.includes(msg.from)) {
              return [...prev, msg.from];
            }
            return prev;
          });
        }

        fetchUsers();
      });
    }
  }, [socket, selectedUser]); 

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/admin/users-with-messages`
      );
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUserMessages = async (userId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/admin/messages/${userId}`
      );
      if (response.data) {
        setAllMessages((prev) => ({
          ...prev,
          [userId]: response.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);

    setUnreadMessages((prev) => prev.filter((userId) => userId !== user._id));

    if (!allMessages[user._id]) {
      fetchUserMessages(user._id);
    }
  };

  const sendMessage = () => {
    if (message.trim() && socket && selectedUser) {
   
      const newMsg = { from: "admin", text: message };
  
      setAllMessages((prev) => ({
        ...prev,
        [selectedUser._id]: [...(prev[selectedUser._id] || []), newMsg],
      }));

      socket.emit("sendMessage", {
        from: "admin",
        to: selectedUser._id,
        text: message,
      });

      setMessage("");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, selectedUser]);
    

  return (
    <div className="flex h-[90vh] w-full overflow-hidden">
  {/* Left panel - Users */}
  <div className="w-[250px] border-r p-4 overflow-y-auto">
    <h2 className="text-lg font-semibold mb-4">Users</h2>
    {users.length > 0 ? (
      users.map((user) => (
        <div
          key={user._id}
          onClick={() => handleUserSelect(user)}
          className={`p-2 rounded cursor-pointer mb-2 hover:bg-gray-100 ${
            selectedUser?._id === user._id ? "bg-gray-200 font-medium" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{user.name || user._id}</span>
            {unreadMessages.includes(user._id) && (
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500">No conversations yet</p>
    )}
  </div>

  {/* Right panel - Messages */}
  <div className="flex-1 flex flex-col p-4 overflow-hidden">
    {selectedUser ? (
      <>
        <h2 className="text-lg font-semibold mb-4">
          Chat with {selectedUser.name || selectedUser._id}
        </h2>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="flex flex-col gap-2">
            {allMessages[selectedUser._id]?.map((msg, index) => (
              <div
                key={index}
                className={`max-w-xs p-2 rounded-md text-sm ${
                  msg.from === "admin"
                    ? "bg-blue-100 self-end"
                    : "bg-gray-100 self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area (Pinned at the bottom) */}
        <div className="flex border-t pt-4 gap-2 mt-auto">
          <input
            type="text"
            className="flex-1 border p-2 rounded-md"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </>
    ) : (
      <p className="text-gray-500">Select a user to view messages</p>
    )}
  </div>
</div>

  );
};

export default Messages;
