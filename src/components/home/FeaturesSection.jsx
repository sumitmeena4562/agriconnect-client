import React from 'react';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';

const FeaturesSection = () => {
    const features = [
        {
            title: "Verified Ecosystem",
            description: "Trade with 100% KYC-verified bulk buyers and farmers. Zero risk, absolute trust.",
            icon: "verified_user",
            colorClass: "bg-blue-50 text-blue-600"
        },
        {
            title: "Real-time Profit Pulse",
            description: "Live Mandi rates & APMC data from across India. Time your sales to maximize margins.",
            icon: "monitoring",
            colorClass: "bg-emerald-50 text-emerald-600"
        },
        {
            title: "Zero-Hassle Logistics",
            description: "Direct farm-gate collection. We handle Mandi tax, loading, and doorstep delivery.",
            icon: "local_shipping",
            colorClass: "bg-orange-50 text-orange-600"
        },
        {
            title: "Brand Traceability",
            description: "Build your farm's brand. QR codes show harvest date, origin, and soil quality reports.",
            icon: "qr_code_scanner",
            colorClass: "bg-purple-50 text-purple-600"
        },
        {
            title: "Regional Optimization",
            description: "Localized interface in Hindi, Marathi, Telugu & more. Built for every Indian village.",
            icon: "translate",
            colorClass: "bg-pink-50 text-pink-600"
        },
        {
            title: "Harvest Intelligence",
            description: "AI-driven local weather predictions and smart harvesting advice to secure your crop.",
            icon: "cloudy_snowing",
            colorClass: "bg-cyan-50 text-cyan-600"
        }
    ];

    return (
        <section id="features" className="py-12 sm:py-16 bg-transparent relative">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                
                {/* Header */}
                <SectionHeader 
                    badge="# FEATURES"
                    badgeVariant="slate"
                    badgeClassName="!bg-[#F3E8FF] !text-[#A855F7] border-none font-black"
                    title={<>Powerful Features, <span className="text-slate-300">Simple to Use</span></>}
                    description="Everything you need to buy and sell agricultural produce efficiently."
                />

                {/* Features Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="group cursor-default glass-shine"
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {/* Icon Container - Higher Contrast */}
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${feature.colorClass.split(' ')[0]} flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                <span className={`material-symbols-outlined ${feature.colorClass.split(' ')[1]} text-[24px] sm:text-[28px] font-bold icon-pop`}>
                                    {feature.icon}
                                </span>
                            </div>

                            {/* Text Content - Consistent Titles */}
                            <h3 className="text-[17px] sm:text-[18px] font-black text-[#0A2616] mb-2.5 transition-colors duration-300 tracking-tight">
                                {feature.title}
                            </h3>
                            
                            <p className="text-[#556070] text-[13px] sm:text-[14px] leading-[1.6] font-medium">
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default FeaturesSection;
