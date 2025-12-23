import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div id="home" className="app-shell home-shell">
      <Navbar />
      <HeroSection />

      {/* Interactive home sections removed per request */}
      <main className="home-content" />

      <Footer />
    </div>
  );
}

