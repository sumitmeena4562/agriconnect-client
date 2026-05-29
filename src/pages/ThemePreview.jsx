import React from 'react';

const ThemePreview = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-20">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-5xl font-black text-primary-700 tracking-tight">AgriConnect Design System</h1>
          <p className="text-xl text-gray-500 mt-4 font-sans">Premium, modern UI tokens for the agricultural ecosystem.</p>
        </div>

        {/* Colors Section */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 font-heading border-b pb-4">Brand Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Primary (Emeralds)</h3>
              <div className="flex bg-gray-50 p-4 rounded-xl items-center justify-between">
                <div className="w-12 h-12 bg-primary-100 rounded-lg shadow-sm"></div>
                <div className="w-12 h-12 bg-primary-300 rounded-lg shadow-sm"></div>
                <div className="w-16 h-16 bg-primary-500 rounded-xl shadow-md border-2 border-white"></div>
                <div className="w-12 h-12 bg-primary-700 rounded-lg shadow-sm"></div>
                <div className="w-12 h-12 bg-primary-900 rounded-lg shadow-sm"></div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Accent (Amber)</h3>
              <div className="flex bg-gray-50 p-4 rounded-xl items-center justify-between">
                <div className="w-12 h-12 bg-accent-50 rounded-lg shadow-sm"></div>
                <div className="w-12 h-12 bg-accent-100 rounded-lg shadow-sm"></div>
                <div className="w-16 h-16 bg-accent-500 rounded-xl shadow-md border-2 border-white"></div>
                <div className="w-12 h-12 bg-accent-600 rounded-lg shadow-sm"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg shadow-sm opacity-50"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 font-heading border-b pb-4">Typography & Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-gray-900">Heading 1</h1>
              <h2 className="text-3xl font-bold text-gray-800">Heading 2</h2>
              <h3 className="text-xl font-semibold text-gray-700">Heading 3</h3>
              <p className="text-base text-gray-600 font-sans leading-relaxed">
                Body text using the standard sans font. It's clean, legible, and
                gives a modern feel to the application interface.
              </p>
            </div>
            <div className="space-y-6 flex flex-col justify-center items-start">
              <button className="px-6 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-premium hover:shadow-premium-hover transition-all transform hover:-translate-y-1">
                Primary Button
              </button>
              <button className="px-6 py-3 bg-accent-500 text-white font-bold rounded-xl shadow-md hover:bg-accent-600 transition-colors">
                Accent Button
              </button>
              <button className="px-6 py-3 bg-transparent border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-primary-500 hover:text-primary-600 transition-colors">
                Outline Button
              </button>
            </div>
          </div>
        </section>

        {/* UI Elements Section */}
        <section className="relative p-12 rounded-3xl overflow-hidden min-h-[400px] flex items-center justify-center bg-gray-900">
          <div className="absolute inset-0 bg-primary-600 opacity-20"></div>
          <div className="absolute top-10 left-10 w-40 h-40 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          
          <div className="relative z-10 w-full max-w-lg glass-panel p-8 rounded-3xl">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Glassmorphism Panel</h3>
            <p className="text-gray-600 mb-6 text-sm">Reusable `.glass-panel` utility class.</p>
            <div className="space-y-4">
              <div className="h-12 bg-white/50 rounded-xl border border-white/60"></div>
              <div className="h-24 bg-white/50 rounded-xl border border-white/60"></div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ThemePreview;
