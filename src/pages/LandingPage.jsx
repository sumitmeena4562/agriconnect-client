import React from "react";
import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";
import TrendingCategories from "../components/home/TrendingCategories";
import HowItWorks from "../components/home/HowItWorks";
import FeaturesSection from "../components/home/FeaturesSection";
import Testimonials from "../components/home/Testimonials";
import Footer from "../components/layout/Footer";

const LandingPage = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main>
                <HeroSection />
                <TrendingCategories />
                <FeaturesSection />
                <Testimonials />
                <HowItWorks />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;

