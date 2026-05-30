import React from 'react';

const TrendingCategories = () => {
    // 1. Ticker Data
    const tickerItems = [
        { name: 'Tomato', price: '₹20/kg', trend: 'up', emoji: '🍅' },
        { name: 'Potato', price: '₹15/kg', trend: 'up', emoji: '🥔' },
        { name: 'Onion', price: '₹30/kg', trend: 'down', emoji: '🧅' },
        { name: 'Carrot', price: '₹45/kg', trend: 'up', emoji: '🥕' },
        { name: 'Chili', price: '₹40/kg', trend: 'down', emoji: '🌶️' },
        { name: 'Capsicum', price: '₹35/kg', trend: 'up', emoji: '🫑' },
    ];

    // 2. Fake infinite ticker item list (duplicated exactly once for a seamless -50% loop)
    const infiniteTicker = [...tickerItems, ...tickerItems];

    // 3. Categories Data
    const categories = [
        {
            name: 'Fresh Tomatoes',
            supply: '50T+',
            price: '₹18/kg',
            img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400&h=300'
        },
        {
            name: 'Premium Potatoes',
            supply: '120T+',
            price: '₹12/kg',
            img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400&h=300'
        },
        {
            name: 'Red Onions',
            supply: '80T+',
            price: '₹25/kg',
            img: 'https://s.alicdn.com/@sc04/kf/A811ead8abd94495ca526992452f0f645W.jpg'
        },
        {
            name: 'Exotic Greens',
            supply: '10T+',
            price: '₹150/kg',
            img: 'https://5.imimg.com/data5/ANDROID/Default/2021/5/FN/SD/SN/22022401/product-jpeg.jpg'
        },
        {
            name: 'Organic Carrots',
            supply: '30T+',
            price: '₹40/kg',
            img: 'https://5.imimg.com/data5/UM/AY/MY-3018052/organic-carrots.jpg'
        },
        {
            name: 'Green Cabbage',
            supply: '40T+',
            price: '₹15/kg',
            img: 'https://tiimg.tistatic.com/fp/1/009/170/green-cabbage-297.jpg'
        },
        {
            name: 'Crisp Capsicum',
            supply: '25T+',
            price: '₹30/kg',
            img: 'https://5.imimg.com/data5/SELLER/Default/2024/5/415703280/EK/TS/LQ/212628420/green-capsicum-500x500.webp'
        },
        {
            name: 'Spicy Chilies',
            supply: '15T+',
            price: '₹35/kg',
            img: 'https://www.snexplores.org/wp-content/uploads/sites/3/2019/11/header-860-Red_Peppers.jpg'
        },
    ];

    return (
        <section id="trending" className="bg-transparent relative">

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                    will-change: transform;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>

            {/* 1. LIVE TICKER STRIP */}
            <div className="bg-[#111827] w-full overflow-hidden relative flex items-center shadow-inner">

                {/* Fixed "LIVE" Button on the left */}
                <div className="absolute left-0 top-0 bottom-0 bg-[#0A2616] z-20 flex items-center pl-6 sm:pl-8 lg:pl-10 pr-4 shadow-[20px_0_30px_-5px_#0A2616]">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                            <span className="text-green-500 font-black text-[10px] tracking-widest uppercase italic">Market Pulse</span>
                        </div>
                        <span className="hidden sm:block text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Real-time Trading Live</span>
                    </div>
                </div>

                {/* Marquee Content */}
                <div className="flex whitespace-nowrap animate-marquee py-2 pl-[100px] sm:pl-[140px]">
                    {infiniteTicker.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 mx-4 sm:mx-6">
                            <span className="text-[13px] sm:text-[14px]">{item.emoji}</span>
                            <span className="text-gray-300 font-bold text-[11px] sm:text-[12px] tracking-tight">{item.name}</span>
                            <span className="text-white font-black text-[12px] sm:text-[13px] ml-1">{item.price}</span>
                            <span className="material-symbols-outlined text-[12px] sm:text-[14px] font-bold"
                                style={{ color: item.trend === 'up' ? '#00B464' : '#EF4444' }}>
                                {item.trend === 'up' ? 'trending_up' : 'trending_down'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Fade on the right side */}
                <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 bg-gradient-to-l from-[#111827] to-transparent z-20 pointer-events-none" />
            </div>

            {/* 2. TRENDING CATEGORIES GRID */}
            <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EEF2FF] rounded-md mb-4"
                    >
                        <span className="material-symbols-outlined text-blue-500 text-[13px]">shopping_basket</span>
                        <span className="text-blue-600 font-bold text-[9px] tracking-[0.1em] uppercase">
                            Top Produce
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A2616] mb-4 font-heading tracking-tight"
                    >
                        Trending Categories
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-500 text-[14px] sm:text-[15px] leading-[1.6]"
                    >
                        Explore high-quality, fresh produce currently in demand across the platform.
                    </motion.p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {categories.map((cat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="global-card-flush group cursor-pointer flex flex-col h-full glass-shine"
                        >
                            {/* Image Container */}
                            <div className="w-full h-[140px] sm:h-[150px] bg-gray-50 overflow-hidden relative">
                                <img
                                    src={cat.img}
                                    alt={cat.name}
                                    className="w-full h-full object-cover transition-transform duration-1000 ease-out icon-pop"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            {/* Content */}
                            <div className="p-4 sm:p-5 flex flex-col flex-grow">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-[15px] font-black text-gray-900 group-hover:text-[#00B464] transition-colors line-clamp-1">{cat.name}</h3>
                                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0">Verified</span>
                                </div>

                                <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Supply</span>
                                        <span className="text-[12px] font-bold text-slate-700">{cat.supply}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-[#00B464] uppercase tracking-widest mb-0.5">Best Price</span>
                                        <span className="text-[14px] font-black text-[#0A2616]">{cat.price}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default TrendingCategories;
