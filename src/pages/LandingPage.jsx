import React from "react";
import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";
import TrendingCategories from "../components/home/TrendingCategories";
import HowItWorks from "../components/home/HowItWorks";

const LandingPage = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main>
                <HeroSection />
                <TrendingCategories />
                <HowItWorks />
            </main>
        </div>
    );
};

export default LandingPage;

