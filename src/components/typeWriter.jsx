import { useState, useEffect } from "react";

export const Typewriter = ({
  text,
  delay,
  isUser=false,
  infinite,
  onKeyDown = () => {},
}) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let timeout;

    if (currentIndex < text.length) {
      timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);
    } else if (infinite) {
      // ADD THIS CHECK
      setCurrentIndex(0);
      setCurrentText("");
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, delay, infinite, text]);
  if (isUser) {
    return (
      <input
        className="flex items-center h-10 w-full bg-transparent outline-none px-3 text-sm"
        type="text"
        placeholder=""
        value={currentText}
        onKeyDown={onKeyDown}
      />
    );
  }
  return <span>{currentText}</span>;
};
