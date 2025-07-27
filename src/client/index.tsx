// src/client/index.tsx
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

import {type ChatMessage, type Message} from "../shared";

function App() {
  const {room} = useParams();
  const [nickname] = useState(nanoid(8));
  // Online users state is no longer used for display
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      } else if (message.type === "clear") {
        setMessages([]);
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "auto"});
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chatInput.trim()) {
      const message: Message = {
        type: "add",
        id: nanoid(8),
        content: chatInput,
        user: nickname,
        role: "user",
        time: Date.now(),
      };
      socket.send(JSON.stringify(message));
      setChatInput("");
    }
  };

  return (
    <div>
      <div className="container">
        <div id="messages">
          <div className="message info">
            <div className="nick">*</div>
            <div className="text">Welcome to chat.abandon.ai, a minimal, distraction-free chat application.</div>
          </div>
          <div className="message info">
            <div className="nick">*</div>
            <div className="text">Copyright © {new Date().getFullYear()} Abandon Inc. All rights reserved.</div>
          </div>
          <div className="message info">
            <div className="nick">*</div>
            <div className="text">Enter `/clear` to clear the chat history.</div>
          </div>
          {messages.map((message) => (
            <div className="message" key={message.id}>
              <div className="nick">{message.user}</div>
              <div className="text">{message.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div id="footer">
        <form id="chatform" onSubmit={handleSubmit}>
          <textarea
            id="chatinput"
            placeholder="Say something..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            autoComplete="off"
          />
          <button type="submit" id={"sendbutton"}>Send</button>
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