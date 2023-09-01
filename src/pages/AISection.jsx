import React, { useEffect, useRef, useState } from "react";
import { ChatSection } from "../components/chatSection";
import "./../style/styles.css";
import VoiceInput from "../assets/voice.gif";
import NarrativeInput from "../assets/speak.gif";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export function AISection() {
  const [voiceInput, setVoiceInput] = useState(false);
  const [narrativeMode, setNarrativeMode] = useState(false);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const chatRef = useRef();
  useEffect(() => {
    document.addEventListener("keydown", (e) =>
      !chatRef.current.isFocused() ? handleKeyboardEvent(e) : null
    );
    return () => {
      document.removeEventListener("keydown", (e) =>
        !chatRef?.current?.isFocused() ? handleKeyboardEvent(e) : null
      );
    };
  }, []);
  function handleKeyboardEvent(key) {
    console.log(key);
    if (key.keyCode === 86) {
      handleVoiceInput();
    }
    //  else if (key.keyCode === 78) {
    //   setNarrativeMode(true);
    // }
    else if (key.keyCode === 83) {
      handleVoiceInput();
    } else {
      setVoiceInput(false);
      setNarrativeMode(false);
    }
  }
  function handleVoiceInput() {
    console.log("DSfsdf", voiceInput);
    if (voiceInput) {
      setVoiceInput(false);
      SpeechRecognition.stopListening();
    } else {
      setVoiceInput(true);
      SpeechRecognition.startListening({ continuous: true });
    }
  }
  console.log("listening==>", listening, transcript);
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }
  return (
    <>
      <div className="AIsection grid grid-cols-2 divide-x h-screen">
        <div
          className="h-full 
        bg-[url(https://images.unsplash.com/photo-1541178735493-479c1a27ed24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHVzZXIlMjB0eXBlcyUyMGluJTIwbGFwdG9wfGVufDB8fDB8fHww&auto=format&w=500&q=60)] 
        bg-no-repeat bg-cover bg-center"
        />
        <div
          className="h-full 
      bg-[url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4QoMAhQUbuSk1aNfPpHotjCnx4KVEuti6TQ&usqp=CAU)] 
      bg-no-repeat bg-cover bg-center "
        />
      </div>
      <div className="chatSection flex z-50 absolute items-center justify-center bg-transparent">
        <ChatSection
          transcript={transcript}
          handleVoiceInput={handleVoiceInput}
          listening={listening}
          voiceInput={voiceInput}
          setVoiceInput={setVoiceInput}
          ref={chatRef}
        />
      </div>

      {voiceInput && (
        <div className="flex z-50 absolute right-0 top-0 bg-transparent transition-opacity ease-out duration-1000 opacity-100 ">
          <img src={VoiceInput} alt="my-gif" />
        </div>
      )}
    </>
  );
}
