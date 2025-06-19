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
  const [name] = useState(names[Math.floor(Math.random() * names.length)]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const {room} = useParams();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const socket = usePartySocket({
    party: "chat",
    room,
    onMessage: (evt) => {
      const message = JSON.parse(evt.data as string) as Message;
      if (message.type === "add") {
        const foundIndex = messages.findIndex((m) => m.id === message.id);
        if (foundIndex === -1) {
          setMessages((messages) => [
            ...messages,
            {
              id: message.id,
              content: message.content,
              user: message.user,
              role: message.role,
            },
          ]);
        } else {
          setMessages((messages) => {
            return messages
              .slice(0, foundIndex)
              .concat({
                id: message.id,
                content: message.content,
                user: message.user,
                role: message.role,
              })
              .concat(messages.slice(foundIndex + 1));
          });
        }
      } else if (message.type === "update") {
        setMessages((messages) =>
          messages.map((m) =>
            m.id === message.id
              ? {
                id: message.id,
                content: message.content,
                user: message.user,
                role: message.role,
              }
              : m,
          ),
        );
      } else {
        setMessages(message.messages);
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const contentInput = e.currentTarget.elements.namedItem(
      "content"
    ) as HTMLInputElement;
    const content = contentInput.value.trim();

    if (content) {
      const chatMessage: ChatMessage = {
        id: nanoid(8),
        content,
        user: name,
        role: "user",
      };

      // Optimistically add message to UI
      setMessages((prevMessages) => [...prevMessages, chatMessage]);

      socket.send(
        JSON.stringify({
          type: "add",
          ...chatMessage,
        } satisfies Message)
      );

      contentInput.value = "";
    }
  };

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <div className="user">{message.user}:</div>
            <div className="content">{message.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef}/>
      </div>
      <form className="input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          name="content"
          placeholder={`Hello ${name}! Type a message...`}
          autoComplete="off"
        />
        <button type="submit" className="button-primary">
        </button>
      </form>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to={`/${nanoid()}`}/>}/>
      <Route path="/:room" element={<App/>}/>
      <Route path="*" element={<Navigate to="/"/>}/>
    </Routes>
  </BrowserRouter>,
);
