import React from 'react';

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
                <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EEF2FF] rounded-md mb-4"
                    >
                        <span className="material-symbols-outlined text-[#6366F1] text-[13px]">update</span>
                        <span className="text-[#6366F1] font-bold text-[9px] tracking-[0.1em] uppercase">
                            UPDATES
                        </span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A2616] mb-4 font-heading tracking-tight"
                    >
                        Elite Market <span className="text-[#00B464]">Insights</span>
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-500 text-[13px] sm:text-[14px] italic"
                    >
                        Stay ahead of the curve with the latest trends and data in high-scale agricultural trading.
                    </motion.p>
                </div>

                {/* News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {articles.map((article, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="global-card flex flex-col group cursor-pointer glass-shine"
                        >
                            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4">
                                <img 
                                    src={article.image} 
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 ease-out icon-pop"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-wider text-[#0A2616] shadow-sm">
                                        {article.category}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider">{article.date}</span>
                            </div>
                            
                            <h3 className="text-[16px] sm:text-[17px] font-black text-[#0A2616] leading-[1.4] mb-3 group-hover:text-[#00B464] transition-colors">
                                {article.title}
                            </h3>
                            
                            <div className="mt-auto flex items-center gap-1 text-[#00B464] group/link">
                                <span className="text-[11px] font-black uppercase tracking-widest">Read Article</span>
                                <span className="material-symbols-outlined text-[16px] transform group-hover/link:translate-x-1 transition-transform">arrow_right_alt</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewsSection;
