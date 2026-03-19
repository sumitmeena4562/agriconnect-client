import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const faqs = [
        {
            question: "How long does it take for farmers to get paid?",
            answer: "Payments are processed instantly as soon as the buyer confirms delivery. It usually reflects in the farmer's linked bank account within 2-4 hours."
        },
        {
            question: "Is there a registration fee?",
            answer: "No, registration for both farmers and vendors is completely free. We only charge a small platform fee once a successful transaction is completed."
        },
        {
            question: "Who handles the logistics and transportation?",
            answer: "AgriConnect provides a built-in smart logistics network. Once an order is placed, our logistics partners collect the produce from the farm-gate and deliver it to the vendor's doorstep."
        },
        {
            question: "How is the produce quality verified?",
            answer: "We have verified quality inspectors at major collection points. Additionally, the QR traceability system allows buyers to verify the farm origin and harvest date directly."
        }
    ];

    return (
        <section id="faq" className="py-14 sm:py-18 bg-transparent relative">
            <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F1F5F9] rounded-md mb-3"
                    >
                        <span className="material-symbols-outlined text-slate-600 text-[12px]">schedule</span>
                        <span className="text-slate-600 font-bold text-[8px] tracking-[0.1em] uppercase">
                            FAQ
                        </span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0A2616] mb-3 font-heading tracking-tight"
                    >
                        Frequently Asked Questions
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-500 text-[13px] sm:text-[14px] leading-relaxed"
                    >
                        Everything you need to know about trading on AgriConnect.
                    </motion.p>
                </div>

                {/* FAQ List */}
                <div className="space-y-3">
                    {faqs.map((faq, index) => {
                        const isOpen = activeIndex === index;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.08 }}
                                className={`bg-white rounded-xl border transition-all duration-300 relative overflow-hidden ${isOpen ? 'border-[#00B464]/30 shadow-md shadow-[#00B464]/5' : 'border-gray-100/60 shadow-sm'}`}
                            >
                                {/* Active Accent Bar */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-[#00B464] transition-transform duration-300 ${isOpen ? 'scale-y-100' : 'scale-y-0'}`} />

                                <button
                                    onClick={() => setActiveIndex(isOpen ? -1 : index)}
                                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 group"
                                >
                                    <span className={`text-[14px] sm:text-[15px] font-bold transition-colors duration-300 ${isOpen ? 'text-[#00B464] pl-2' : 'text-[#0A2616] group-hover:text-[#00B464]'}`}>
                                        {faq.question}
                                    </span>
                                    <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#00B464]' : 'text-slate-300 group-hover:text-[#00B464]'}`}>
                                        expand_more
                                    </span>
                                </button>
                                
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-slate-500 text-[13px] sm:text-[13.5px] leading-relaxed border-t border-gray-50/80 pt-3 ml-2">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
};

export default FAQSection;
