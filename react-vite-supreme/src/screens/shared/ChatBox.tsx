import React, { useState, useRef, useEffect } from 'react';

interface ChatBoxProps {
    currentUser: any;
}

export default function ChatBox({ currentUser: _currentUser }: ChatBoxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([
        { text: "Hello! How can I help you today?", sender: 'bot', time: new Date().toLocaleTimeString() }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isOpen]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const userMsg = { text: input, sender: 'user', time: new Date().toLocaleTimeString() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setTimeout(() => {
            setMessages(prev => [...prev, { text: "Thank you for reached out to us! A staff member will receive your message surely.", sender: 'bot', time: new Date().toLocaleTimeString() }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-24 z-50">
            {isOpen ? (
                <div className="bg-white dark:bg-slate-800 w-80 h-[450px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-blue-600 dark:bg-blue-700 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><i className="fas fa-headset"></i></div>
                            <h4 className="font-bold text-sm">Support Chat</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsOpen(false)} className="flex items-center gap-1 hover:bg-white/10 text-white text-[10px] font-black px-2 py-1 rounded-md transition-all border border-white/20 uppercase tracking-widest whitespace-nowrap">
                                <i className="fas fa-arrow-left text-[8px]"></i> Back
                            </button>
                            <button onClick={() => setIsOpen(false)} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${m.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 rounded-bl-none'}`}>
                                    <p className="font-medium leading-relaxed">{m.text}</p>
                                    <p className={`text-[8px] mt-1 font-bold ${m.sender === 'user' ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>{m.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-slate-100 dark:bg-slate-700 border-none p-2.5 rounded-xl text-xs outline-none text-slate-700 dark:text-white placeholder:text-slate-400" 
                            placeholder="Type a message..." 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                        />
                        <button type="submit" className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95">
                            <i className="fas fa-paper-plane text-xs"></i>
                        </button>
                    </form>
                </div>
            ) : (
                <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95">
                    <i className="fas fa-comment"></i>
                </button>
            )}
        </div>
    );
}
