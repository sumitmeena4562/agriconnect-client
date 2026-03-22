import React from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';

const ThemePreview = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-20">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center">
          <Badge variant="primary" size="lg" className="mb-4">Version 2.0 Ready</Badge>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">AgriConnect <span className="text-primary-600 italic">Design System</span></h1>
          <p className="text-xl text-gray-500 mt-4 font-sans max-w-2xl mx-auto">Premium, modern UI components tailored for the agricultural ecosystem. Built for speed, consistency, and a wow-effect.</p>
        </div>

        {/* Buttons Section */}
        <section className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
            <span className="material-symbols-outlined text-primary-600 bg-primary-50 p-2 rounded-xl">smart_button</span>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Core Buttons</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Primary Variant</p>
              <Button variant="primary" fullWidth>Primary Action</Button>
              <Button variant="primary" size="sm">Small Button</Button>
            </div>

            <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Accent Variant</p>
              <Button variant="accent" fullWidth icon="bolt">Accent Action</Button>
              <Button variant="accent" size="sm">Small Accent</Button>
            </div>

            <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Dark & Outline</p>
              <Button variant="dark" fullWidth icon="shield_lock">Dark Secure</Button>
              <Button variant="outline" fullWidth>Outline View</Button>
            </div>

            <div className="space-y-4 p-6 bg-slate-900 rounded-2xl shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Glass on Dark</p>
              <Button variant="glass" fullWidth icon="help_center">Glass Support</Button>
              <Button variant="glass" size="sm">Small Glass</Button>
            </div>
          </div>
        </section>

        {/* Form Elements Section */}
        <section className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
            <span className="material-symbols-outlined text-amber-600 bg-amber-50 p-2 rounded-xl">edit_note</span>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Form Controls</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
                <Input label="Full Name" placeholder="Ex: Rajesh Kumar" icon="person" />
                <Input label="Phone Number" placeholder="00000 00000" prefix="IN +91" />
            </div>
            <div className="space-y-6">
                <Select 
                    label="Region Selection" 
                    placeholder="Choose State" 
                    options={['Maharashtra', 'Punjab', 'Gujarat']} 
                />
                <Input label="Location" placeholder="Mandi Name" icon="near_me" />
            </div>
            <div className="space-y-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Badges</p>
                <div className="flex flex-wrap gap-3">
                    <Badge variant="primary">Active Now</Badge>
                    <Badge variant="success" icon="verified">Verified</Badge>
                    <Badge variant="accent">Pending</Badge>
                    <Badge variant="slate">Inactive</Badge>
                    <Badge variant="dark" size="sm">Phase 01</Badge>
                </div>
            </div>
          </div>
        </section>

        {/* Layout Example */}
        <section className="relative p-12 rounded-[40px] overflow-hidden bg-slate-900 flex flex-col items-center justify-center min-h-[500px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-primary-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-amber-500/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10 shadow-2xl space-y-8">
                <div className="space-y-2 text-center">
                    <h3 className="text-2xl font-black text-white italic">Initialize <span className="text-primary-400">Access.</span></h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Deployment Phase Alpha</p>
                </div>
                
                <Input 
                    placeholder="Security Token" 
                    className="!bg-white/5 !border-white/10 !text-white placeholder:text-slate-600"
                    icon="key"
                />

                <Button variant="primary" fullWidth icon="bolt">Start Initialization</Button>
                
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <Badge variant="slate" size="xs" animate={false}>v2.4.0-stable</Badge>
                    <button className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Documentation</button>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
};

export default ThemePreview;
