import React from 'react';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';
import Badge from '../ui/Badge';

const NewsSection = () => {
    const articles = [
        {
            title: "Scaling Direct Trade: How Elite Farmers are Beating Mandi Rates",
            date: "Mar 18, 2026",
            image: "https://www.vimint.com/wp-content/uploads/2025/04/565.jpg",
            category: "Trading"
        },
        {
            title: "Organic Scale: The $10B Opportunity in Maharashtra",
            date: "Mar 15, 2026",
            image: "https://www.mahindratractor.com/sites/default/files/2025-07/Blog%207%20Organic%20Farming%20in%20India%20Types%2C%20Benefits%2C%20and%20Its%20Importance-Detail.jpg",
            category: "Organic"
        },
        {
            title: "Harvest Intelligence: Predicting Yields with 98% Accuracy",
            date: "Mar 10, 2026",
            image: "https://mahaagrin.com/cdn/shop/articles/monsoon-season0cultivation.jpg?v=1750392477",
            category: "AI Tech"
        }
    ];

    return (
        <section id="news" className="py-12 sm:py-16 bg-white relative">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                
                {/* Header */}
                <SectionHeader 
                    badge="UPDATES"
                    badgeIcon="update"
                    badgeVariant="slate"
                    badgeClassName="!bg-indigo-50 !text-indigo-600 border-none px-3"
                    title={<>Elite Market <span className="text-primary-600">Insights</span></>}
                    description="Stay ahead of the curve with the latest trends and data in high-scale agricultural trading."
                />

                {/* News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {articles.map((article, index) => (
                        <Card
                            key={index}
                            className="flex flex-col group cursor-pointer glass-shine p-4"
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4">
                                <img 
                                    src={article.image} 
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 ease-out icon-pop"
                                />
                                <div className="absolute top-4 left-4">
                                    <Badge variant="glass" size="xs" className="!bg-white/90 !text-slate-900 shadow-sm border-none">
                                        {article.category}
                                    </Badge>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{article.date}</span>
                            </div>
                            
                            <h3 className="text-[16px] sm:text-[17px] font-black text-[#0A2616] leading-[1.4] mb-3 group-hover:text-primary-600 transition-colors tracking-tight">
                                {article.title}
                            </h3>
                            
                            <div className="mt-auto flex items-center gap-1 text-primary-600 group/link">
                                <span className="text-[11px] font-black uppercase tracking-widest">Read Article</span>
                                <span className="material-symbols-outlined text-[16px] transform group-hover/link:translate-x-1 transition-transform">arrow_right_alt</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewsSection;
