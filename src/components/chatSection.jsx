import React, {
  Fragment,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FaHome, FaLightbulb, FaClock } from "react-icons/fa";
import { BsBoxes } from "react-icons/bs";
import { MdOutlineDescription, MdCall } from "react-icons/md";
import { BiMessageDots } from "react-icons/bi";
import userAvatar from "../assets/user.png"; // Replace with the user avatar image file
import aiAvatar from "../assets/bot.jpg"; // Replace with the AI avatar image file
import { Typewriter } from "./typeWriter";
import NarrativeInput from "../assets/speak.gif";
import { Box, Modal } from "@mui/material";

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
export const ChatSection = forwardRef(
  ({ transcript, handleVoiceInput, listening, resetController }, ref) => {
    const [input, setInput] = useState("");
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const standAloneInputObj = {
      role: "user",
      content: "",
      standAloneInput: true,
    };
    const [messages, setMessages] = useState([standAloneInputObj]);
    const [narrativeMode, setNarrativeMode] = useState(false);
    const [isFocus, setIsFocus] = useState(false);
    const [inputDisabled, setInputDisabled] = useState(true);
    const inputRef = useRef();
    const msg = new SpeechSynthesisUtterance();
    const synth = window.speechSynthesis;
    msg.addEventListener("end", () => {
      setNarrativeMode(false);
    });
    useImperativeHandle(
      ref, // forwarded ref
      function () {
        return {
          focus() {
            inputRef.current.focus();
          },
          blur() {
            inputRef.current.blur();
          },
          isFocused() {
            return isFocus;
          },
          isNarrativeMode() {
            return synth.speaking;
          },
        }; // the forwarded ref value
      },
      [isFocus, synth.speaking]
    );
    useEffect(() => {
      setInput(transcript);
      return () => {
        synth?.cancel();
      };
    }, [transcript]);
    const handleSendMessage = async (e) => {
      e.preventDefault();
      let standAloneObj = messages.pop();
      if (listening) {
        // handleVoiceInput();
        // setTimeout(() => {
        //   handleVoiceInput();
        // }, 0);
        resetController();
      }
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: input },
      ]);
      try {
        const response = await fetch(
          "http://192.168.20.120:8000/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "vicuna-7b-v1.3",
              messages: [
                ...messages?.filter((e) => !e.narrativeMode),
                { role: "user", content: input },
              ],
            }),
          }
        );

        const data = await response.json();
        const generatedResponse = data.choices[0].message.content;
        // resetController();
        setInput("");
        // setInputDisabled(true);
        // setNarrativeMode(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: generatedResponse },
          standAloneObj,
        ]);
        if (!(synth?.speaking || listening)) {
          setInputDisabled(false);
        }
      } catch (error) {
        console.error(error);
      }
    };
    const handleKeyDown = (event) => {
      // event.preventDefault();
      if (event.key === "Enter" && input.trim() !== "") {
        handleSendMessage(event);
      }
    };
    const renderMessages = () => {
      return messages.map((message, index) => {
        if (message.role === "user") {
          if (message?.standAloneInput) {
            return (
              (transcript || !inputDisabled) && (
                <div key={index} class="flex w-full mt-2 space-x-3 max-w-xs">
                  <div class="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden bg-gray-300">
                    <img
                      src={userAvatar}
                      alt="User Avatar"
                      className="avatar"
                    />
                  </div>
                  <div class="bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
                    <p class="text-sm">
                      {inputDisabled ? (
                        <Typewriter
                          text={transcript || ""}
                          delay={50}
                          isUser={true}
                          onKeyDown={handleKeyDown}
                        />
                      ) : (
                        <input
                          className="flex items-center h-10 w-full bg-transparent outline-none px-3 text-sm"
                          type="text"
                          placeholder="Ask a question..."
                          value={input}
                          onFocus={() => {
                            setIsFocus(true);
                            console.log("onfoucss");
                          }}
                          autoFocus={true}
                          onBlur={() => setIsFocus(false)}
                          ref={inputRef}
                          disabled={inputDisabled}
                          onKeyDown={handleKeyDown}
                          onChange={(e) => setInput(e.target.value)}
                        />
                      )}
                    </p>
                  </div>
                </div>
              )
            );
          }
          return (
            <div key={index} class="flex w-full mt-2 space-x-3 max-w-xs">
              <div class="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden bg-gray-300">
                <img src={userAvatar} alt="User Avatar" className="avatar" />
              </div>
              <div>
                <div class="bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
                  <p class="text-sm">{formatResponse(message.content)}</p>
                </div>
              </div>
            </div>
          );
        } else if (message.role === "assistant") {
          return (
            <div
              key={index}
              class="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end"
            >
              <div>
                <div
                  class="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg"
                  style={{ minWidth: "300px" }}
                >
                  <p class="text-sm">
                    <Typewriter
                      text={message.content}
                      isUser={false}
                      delay={25}
                    />
                  </p>
                  {message?.action?.length !== 0 && (
                    <div className="flex gap-3 px-8 mt-2">
                      {message?.action?.map((action, index) => {
                        return (
                          <button
                            key={index}
                            onClick={action.onClick}
                            className="bg-slate-300 text-black font-bold p-2 px-8 rounded-md hover:bg-slate-400"
                          >
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div class="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden bg-gray-300">
                <img src={aiAvatar} alt="AI Avatar" className="avatar" />
              </div>
            </div>
          );
        } else {
          console.error(`Unknown role: ${message.role}`);
          return null;
        }
      });
    };
    function handleChatInput() {
      // setMessages((prevMessages) => [...prevMessages, standAloneObj]);
      setInputDisabled(!inputDisabled);
    }
    function renderVideoPlayer() {
      console.log("Narrative", synth.speaking);
      if (synth.speaking) {
        synth.cancel();
        setNarrativeMode(false);
        setMessages(messages.filter((message) => !message.narrativeMode));
      } else {
        setNarrativeMode(true);
        msg.text =
          "Data Science is an interdisciplinary field that involves extracting knowledge and insights from large volumes of structured and unstructured data. It encompasses various stages, from data collection and cleaning to analysis and interpretation. Through advanced statistical and computational techniques, Data Science uncovers patterns, trends, and correlations that drive informed decision-making. Machine learning and predictive modeling are integral components, enabling the development of algorithms that make predictions based on historical data. ";
        // window.speechSynthesis.speak(msg);
        synth.speak(msg);
      }
    }
    function removeNarrativeMessage() {
      synth.cancel();
      setNarrativeMode(false);
      setMessages(messages.filter((e) => !e?.narrativeMode));
    }
    function handleNarrativeInput() {
      console.log("onclidded");

      setMessages([
        ...messages.filter((e) => !e.standAloneInput),
        {
          role: "assistant",
          content:
            "Looks like you've chosen the option to narrate. Would you still want me to narrate the contents of the website?",
          narrativeMode: true,
          isActionEnabled: true,
          action: [
            {
              label: "YES",
              onClick: () => {
                handleOpen();
                renderVideoPlayer();
              },
            },
            {
              label: "NO",
              onClick: () => {
                removeNarrativeMessage();
              },
            },
          ],
        },
        standAloneInputObj,
      ]);
    }

    const style = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: 400,
      height: 400,
      bgcolor: "background.paper",
      border: "2px solid #000",
      borderRadius: "5px",
      overflow: "hidden",
      boxShadow: 24,
    };
    function handleClose() {
      removeNarrativeMessage();
      setOpen(false);
    }

    return (
      <>
        <div class="flex flex-col items-center justify-center h-3/4 min-h-screen bg-transparent text-gray-800 mb-50">
          <div class="flex flex-col flex-grow w-[82rem] max-w-xl bg-transparent shadow-xl rounded-lg overflow-hidden">
            <div class="flex flex-col flex-grow h-0 p-4 overflow-auto">
              {renderMessages()}

              <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={style}>
                  {narrativeMode && (
                    <div>
                      <video
                        className="w-full h-full absolute object-cover"
                        src={require("../assets/employee-getting-customer-requirements.mp4")}
                        type="video/mp4"
                        autoPlay
                        muted
                        controls
                        loop
                        onPause={() => {
                          synth.pause();
                        }}
                        onPlay={() => {
                          synth.resume();
                        }}
                      ></video>
                    </div>
                  )}
                </Box>
              </Modal>
            </div>

            {!(synth?.speaking || !inputDisabled) ? null : (
              <div className="bg-transparent p-4 flex justify-center gap-2 opacity-50">
                <input
                  className="flex items-center h-10 w-full rounded-full outline-none px-3 text-sm"
                  type="text"
                  placeholder="Ask a question..."
                  value={input}
                  // onFocus={() => {
                  //   setIsFocus(true);
                  // }}
                  // onBlur={() => setIsFocus(false)}
                  // ref={inputRef}
                  disabled={true}
                  onChange={(e) => setInput(e.target.value)}
                />
                {/*<button
                onClick={handleSendMessage}
                className="inline-flex items-center mt-1 justify-center w-8 h-8 mr-2 text-pink-100 transition-colors duration-150 bg-gray-400 rounded-full focus:shadow-outline hover:bg-gray-300"
              >
                <FaHandPaper color="black" />
              </button>*/}
              </div>
            )}

            <div class="p-1 flex gap-2 flex-row items-center justify-center">
              <button className="inline-flex items-center justify-center w-8 h-8 mr-2 text-pink-100 transition-colors duration-150 bg-black rounded-md focus:shadow-outline hover:bg-gray-300">
                <FaHome color="white" />
              </button>
              <button className="inline-flex items-center justify-center w-8 h-8 mr-2 text-pink-100 transition-colors duration-150 bg-black rounded-md focus:shadow-outline hover:bg-gray-300">
                <BsBoxes color="white" />
              </button>
              <button className="inline-flex items-center justify-center w-8 h-8 mr-2 text-pink-100 transition-colors duration-150 bg-black rounded-md focus:shadow-outline hover:bg-gray-300">
                <FaLightbulb color="white" />
              </button>
              <button className="inline-flex items-center justify-center w-8 h-8 mr-2 text-pink-100 transition-colors duration-150 bg-black rounded-md focus:shadow-outline hover:bg-gray-300">
                <BiMessageDots color="white" />
              </button>
              <button className="inline-flex items-center justify-center w-8 h-8 mr-2 text-pink-100 transition-colors duration-150 bg-black rounded-md focus:shadow-outline hover:bg-gray-300">
                <MdOutlineDescription color="white" />
              </button>

              <button className="inline-flex items-center justify-center w-8 h-8 mr-2 text-pink-100 transition-colors duration-150 bg-black rounded-md focus:shadow-outline hover:bg-gray-300">
                <MdCall color="white" />
              </button>
              <button className="inline-flex items-center justify-center w-8 h-8 mr-2 text-pink-100 transition-colors duration-150 bg-black rounded-md focus:shadow-outline hover:bg-gray-300">
                <FaClock color="white" />
              </button>
              <button
                onClick={() => handleVoiceInput()}
                disabled={!inputDisabled || synth?.speaking}
                className={`${
                  !inputDisabled || synth?.speaking ? "bg-gray-400" : "bg-white"
                } "inline-flex items-center justify-center w-8 h-8 mr-2 text-pink-100 transition-colors duration-150 rounded-md focus:shadow-outline hover:bg-gray-300"`}
              >
                <span className="text-black font-bold">{"V"}</span>
              </button>

              <button
                onClick={handleNarrativeInput}
                disabled={listening || !inputDisabled}
                className={`${
                  listening || !inputDisabled ? "bg-gray-400" : "bg-white"
                } "inline-flex items-center justify-center w-8 h-8 mr-2 text-pink-100 transition-colors duration-150 rounded-md focus:shadow-outline hover:bg-gray-300"`}
              >
                <span className="text-black font-bold">{"N"}</span>
              </button>

              <button
                onClick={handleChatInput}
                disabled={synth?.speaking || listening}
                className={`${
                  synth?.speaking || listening ? "bg-gray-400" : "bg-white"
                } "inline-flex items-center justify-center w-8 h-8 mr-2 text-pink-100 transition-colors duration-150 rounded-md focus:shadow-outline hover:bg-gray-300"`}
              >
                <span className="text-black font-bold">{"T"}</span>
              </button>
            </div>
          </div>
        </div>
        {/*narrativeMode && (
          <div className="flex z-50 absolute right-0 top-0 bg-transparent transition-opacity ease-out duration-1000 opacity-100 w-1/2">
            <img src={NarrativeInput} alt="my-gif" />
          </div>
        )*/}
      </>
    );
  }
);
