import { Routes, Route } from "react-router-dom";
import { AISection, Home } from "../pages";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<AISection />} />
    </Routes>
  );
};
