import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";

function LandingPage(){
    // Navigation items
    const menuItems = [
        { label: "Home", link: "/" },
        { label: "How it Works", link: "/how-it-works" },
        { label: "Market Rates", link: "/market-rates" },
        { label: "Contact", link: "/contact" }
    ];

    const actions = [
        { label: 'Log in', variant: 'ghost', onClick: () => alert('Login Clicked') },
        { label: 'Get Started', variant: 'primary', onClick: () => alert('Get Started Clicked') }
    ];

return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar navItems={menuItems} authButtons={actions} />
      
      <main className="flex-grow">
        <HeroSection />
      </main>
    </div>
  );

}

export default LandingPage;

