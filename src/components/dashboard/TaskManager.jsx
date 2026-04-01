import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const TaskManager = () => {
    const defaultTasks = [
        { id: 1, text: 'Watering Sector 4', time: '06:00 PM', completed: true, priority: 'High' },
        { id: 2, text: 'Fertilizer Application - Wheat', time: 'Tomorrow', completed: false, priority: 'Medium' },
        { id: 3, text: 'Check Mandi Prices - Soybeans', time: '11:00 AM', completed: false, priority: 'Low' },
    ];

    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('agriconnect_tasks');
        return saved ? JSON.parse(saved) : defaultTasks;
    });

    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        localStorage.setItem('agriconnect_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const toggleTask = (id) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const addTask = (e) => {
        if (e.key === 'Enter' && newTask.trim()) {
            const task = {
                id: Date.now(),
                text: newTask,
                time: 'Scheduled',
                completed: false,
                priority: 'Normal'
            };
            setTasks([task, ...tasks]);
            setNewTask('');
        }
    };

    const removeTask = (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="!rounded-[36px] bg-white border border-slate-100 p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-500 min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-amber-500 text-[18px]">event_repeat</span>
                            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Kheti Schedule</h3>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Manage your daily priorities</p>
                    </div>
                    <Badge variant="primary" size="sm" className="!rounded-full px-4 py-1.5 !text-[9px] font-black tracking-widest uppercase">
                        {tasks.filter(t => !t.completed).length} Pending
                    </Badge>
                </div>

                <div className="relative mb-6">
                    <input 
                        type="text" 
                        placeholder="Add new farming task... (Enter)"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={addTask}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-[11px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-primary-300 focus:bg-white transition-all shadow-inner"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300 text-[18px]">add_task</span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
                    <AnimatePresence>
                        {tasks.map((task) => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${task.completed ? 'bg-slate-50/50 border-slate-100 grayscale' : 'bg-white border-slate-100 hover:border-primary-100 hover:shadow-md shadow-sm'}`}
                                onClick={() => toggleTask(task.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${task.completed ? 'bg-primary-500 text-white' : 'bg-slate-50 text-slate-300'}`}>
                                        <span className="material-symbols-outlined text-[16px]">{task.completed ? 'check' : 'radio_button_unchecked'}</span>
                                    </div>
                                    <div>
                                        <p className={`text-[11px] font-black uppercase tracking-tight ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.text}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="material-symbols-outlined text-[12px] text-slate-300">schedule</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{task.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeTask(task.id); }}
                                    className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-rose-300 hover:text-rose-500 hover:bg-rose-50/50 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <button 
                        onClick={() => setTasks(tasks.filter(t => !t.completed))}
                        className="text-[9px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
                    >
                        Clear Completed
                    </button>
                    <div className="flex -space-x-2">
                        {[1, 2].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400">
                                {i}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default TaskManager;
