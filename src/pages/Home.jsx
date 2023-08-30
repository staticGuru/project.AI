import './app.css';
import React, { useState } from "react";
import logo from "../assets/logo.png"; // Replace with your logo image file
import userAvatar from "../assets/user.png"; // Replace with the user avatar image file
import aiAvatar from "../assets/bot.jpg"; // Replace with the AI avatar image file

function formatResponse(content) {
  return content.split("```").map((part, index) => {
    if (index % 2 === 0) {
      return <span key={index}>{part}</span>;
    } else {
      return (
        <pre key={index}>
          <code>{part}</code>
        </pre>
      );
    }
  });
}

export function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Add user message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: input },
    ]);

    try {
      const response = await fetch("http://192.168.20.120:8000/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "vicuna-7b-v1.3",
          messages: [...messages, { role: "user", content: input }],
        }),
      });

      const data = await response.json();
      const generatedResponse = data.choices[0].message.content;

      // Add AI assistant response to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: generatedResponse },
      ]);

      setInput("");
    } catch (error) {
      console.error(error);
    }
  };

  const renderMessages = () => {
    return messages.map((message, index) => {
      if (message.role === "user") {
        return (
          <div key={index} className={`message user-message`}>
            <div className="avatar-container">
              <img src={userAvatar} alt="User Avatar" className="avatar" />
            </div>
            <div className="message-content">
              <span className={`message-prefix ${message.role === "user" ? "bold" : ""}`}>
                <strong>User:</strong>
              </span>
              {formatResponse(message.content)}
            </div>
          </div>
        );
      } else if (message.role === "assistant") {
        return (
          <div key={index} className={`message ai-message`}>
            <div className="avatar-container">
              <img src={aiAvatar} alt="AI Avatar" className="avatar" />
            </div>
            <div className="message-content">
              <span className={`message-prefix ${message.role === "assistant" ? "bold" : ""}`}>
                <strong>AI:</strong>
              </span>
              {formatResponse(message.content)}
            </div>
          </div>
        );
      } else {
        console.error(`Unknown role: ${message.role}`);
        return null;
      }
    });
  };

  return (
    <div className="chat-container">
      <h1 className="header">Chatbot</h1> {/* Add the header */}
      <div className="logo-container">
        <img src={logo} alt="Company Logo" className="logo" /> {/* Render the logo */}
      </div>
      <div className="chat-history">
        {renderMessages()}
      </div>
      <form className="message-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

// import { useNavigate } from "react-router-dom";
// import "../style/styles.css";

// export function Home() {
//   const navigate = useNavigate();
//   return (
//     <section className="relative h-screen flex flex-col items-center justify-center text-center text-white py-0 px-3">
//       <div className="video-docker absolute top-0 left-0 w-full h-full overflow-hidden">
//         <video
//           className="min-w-full min-h-full absolute object-cover"
//           src="https://cdn.pixabay.com/vimeo/775376205/cyborg-140521.mp4?width=640&hash=a7e9d97369377dca13a0ed4b78d9b4eda8a9832b"
//           type="video/mp4"
//           autoPlay
//           muted
//           loop
//         ></video>
//       </div>
//       <div className="flex z-10 absolute top-0 mt-10">
//         <img
//           src={require("../assets/logo.png")}
//           alt="logo"
//           style={{ width: "100px", height: "100px" }}
//         />
//       </div>
//       <div className="video-content space-y-2 w-1/4 items-end text-left">
//         <h1 className="font-bold text-2xl">Lorem Ipsum Dolor Sit Amet</h1>
//         <h3 className="font-normal text-sm">
//           Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
//           eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
//           minim veniam, quis nostrud exercitation ullamco laboris nisi ut
//           aliquip ex ea commodo consequat. Duis aute irure dolor in
//           reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
//           pariatur
//         </h3>
//       </div>
//       <div
//         className="flex z-10 absolute bottom-0 mb-10 right-10 cursor-pointer"
//         onClick={() => navigate("/chat")}
//       >
//         <h1 className="font-medium text-xl text-blue-600">skip -{">"}</h1>
//       </div>
//     </section>
//   );
// }
