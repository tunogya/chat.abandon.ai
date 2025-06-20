import {createRoot} from "react-dom/client";
import {usePartySocket} from "partysocket/react";
import React, {useState, useEffect, useRef} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router";
import {nanoid} from "nanoid";

import {names, type ChatMessage, type Message} from "../shared";

function App() {
  const {room} = useParams();
  const [nickname, setNickname] = useState(
    names[Math.floor(Math.random() * names.length)],
  );
  const [onlineUsers, setOnlineUsers] = useState([nickname]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 模拟在线列表更新
    setOnlineUsers([nickname]);
  }, [nickname]);

  const socket = usePartySocket({
    party: "chat",
    room,
    onMessage: (evt) => {
      const message = JSON.parse(evt.data as string) as Message;
      if (message.type === "add") {
        setMessages((prevMessages) => [...prevMessages, message]);
      } else if (message.type === "update") {
        setMessages((prevMessages) =>
          prevMessages.map((m) => (m.id === message.id ? message : m)),
        );
      } else if (message.type === "all") {
        setMessages(message.messages);
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chatInput.trim()) {
      const chatMessage: ChatMessage = {
        id: nanoid(8),
        content: chatInput,
        user: nickname,
        role: "user",
        time: Date.now(),
      };
      socket.send(JSON.stringify({type: "add", ...chatMessage}));
      setChatInput("");
    }
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        <ul className="online-list">
          {onlineUsers.map((user, i) => (
            <li key={i}>{user}</li>
          ))}
        </ul>
      </div>
      <div className="chat-panel">
        <div className="messages">
          {messages.map((message) => (
            <div className="message" key={message.id}>
              <span className="nick">{message.user}</span>
              <span className="text">{message.content}</span>
              <span className="time">
                {new Date(message.time).toLocaleTimeString()}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="input-container" onSubmit={handleSubmit}>
          <input
            type="text"
            className="nickname-input"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            autoComplete="off"
          />
          <input
            type="text"
            className="chat-input"
            placeholder="Say something..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            autoComplete="off"
          />
          {/* 添加一个隐藏的提交按钮来确保回车键能触发表单提交 */}
          <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
        </form>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/${nanoid()}`} />} />
        <Route path="/:room" element={<App />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>,
  );
}