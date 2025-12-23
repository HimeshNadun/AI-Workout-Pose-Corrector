// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Workout from "./pages/Workout";
import Results from "./pages/Results";
import Demo from "./pages/Demo";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}
