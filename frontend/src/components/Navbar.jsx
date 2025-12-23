import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`flex justify-between items-center px-10 py-6 sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/60 backdrop-blur-xl border-b border-white/5' 
          : 'bg-transparent border-b border-transparent'
      }`}
      style={{
        boxShadow: isScrolled ? '0 4px 30px rgba(0, 0, 0, 0.3)' : 'none'
      }}
    >
      <Link to="/">
        <h1 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
          AI Fitness Trainer
        </h1>
      </Link>

      <div className="flex gap-8 text-lg">
        <Link 
          to="/" 
          className={`hover:text-blue-400 transition-all duration-300 font-medium ${
            isScrolled ? 'text-gray-300' : 'text-black'
          }`}
        >
          Home
        </Link>
        <Link 
          to="/workout" 
          className={`hover:text-blue-400 transition-all duration-300 font-medium ${
            isScrolled ? 'text-gray-300' : 'text-Black'
          }`}
        >
          Workout
        </Link>
        <Link 
          to="/results" 
          className={`hover:text-blue-400 transition-all duration-300 font-medium ${
            isScrolled ? 'text-gray-300' : 'text-black'
          }`}
        >
          Results
        </Link>
      </div>
    </motion.nav>
  );
}