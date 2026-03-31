import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function RequestorNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { label: 'Dashboard', path: '/', icon: 'fas fa-th-large' },
        { label: 'Track Requests', path: '/track-requests', icon: 'fas fa-clipboard-list' },
        { label: 'New Booking', path: '/new-booking', icon: 'fas fa-plus-circle' },
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-2xl">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo / Brand */}
                        <div
                            className="flex items-center gap-4 cursor-pointer group"
                            onClick={() => navigate('/')}
                        >
                            <div className="h-12 w-12 bg-white rounded-2xl p-2 flex items-center justify-center shadow-xl ring-4 ring-slate-800/50 group-hover:ring-blue-500/30 transition-all">
                                <img src="/dic.png" alt="DICT Logo" className="max-h-full max-w-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-white tracking-tighter leading-none uppercase">
                                    DICT OFFICE
                                </h1>
                                <span className="text-[9px] font-black text-blue-500 tracking-[0.3em] uppercase leading-none mt-1 block">
                                    Requestor Portal
                                </span>
                            </div>
                        </div>

                        {/* Desktop Nav Links */}
                        <div className="hidden lg:flex items-center gap-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`w-full flex items-center gap-4 px-6 py-3 rounded-2xl transition-all duration-300 group relative ${
                                        isActive(item.path)
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                    }`}
                                >
                                    {isActive(item.path) && (
                                        <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full -ml-6 animate-pulse"></div>
                                    )}
                                    <i className={`${item.icon} text-lg transition-transform duration-300 group-hover:scale-110 ${isActive(item.path) ? 'text-white' : 'group-hover:text-blue-400'}`}></i>
                                    <span className="font-black text-[10px] uppercase tracking-[0.15em]">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/track-requests')}
                                className="flex items-center gap-3 px-5 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-2xl transition-all group"
                            >
                                <i className="fas fa-clipboard-list text-lg group-hover:text-blue-400 transition-colors"></i>
                                <span className="font-black text-[10px] uppercase tracking-[0.15em]">Track Requests</span>
                            </button>
                            <button
                                onClick={() => navigate('/bookings/login')}
                                className="hidden lg:flex items-center gap-3 px-5 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-2xl transition-all group"
                            >
                                <i className="fas fa-sign-in-alt text-lg group-hover:text-blue-400 transition-colors"></i>
                                <span className="font-black text-[10px] uppercase tracking-[0.15em]">Admin Login</span>
                            </button>

                            {/* Hamburger button for mobile */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="lg:hidden p-3 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                            >
                                <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <aside
                className={`fixed top-0 right-0 h-full w-80 bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl z-[70] transition-transform duration-300 lg:hidden ${
                    mobileOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Drawer Header */}
                <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-xl">
                            <img src="/dic.png" alt="DICT Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white tracking-tighter uppercase">DICT OFFICE</h2>
                            <span className="text-[8px] font-black text-blue-500 tracking-[0.3em] uppercase">Requestor</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Drawer Nav */}
                <nav className="flex-1 px-6 py-8 space-y-2">
                    <p className="px-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Navigation</p>
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => { navigate(item.path); setMobileOpen(false); }}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative ${
                                isActive(item.path)
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                        >
                            {isActive(item.path) && (
                                <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full -ml-6 animate-pulse"></div>
                            )}
                            <i className={`${item.icon} text-lg transition-transform duration-300 group-hover:scale-110 ${isActive(item.path) ? 'text-white' : 'group-hover:text-blue-400'}`}></i>
                            <span className="font-black text-[10px] uppercase tracking-[0.15em]">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Drawer Footer */}
                <div className="p-6 border-t border-slate-800 space-y-3 bg-slate-950/20 backdrop-blur-sm">
                    <button
                        onClick={() => { navigate('/bookings/login'); setMobileOpen(false); }}
                        className="w-full flex items-center gap-4 px-6 py-4 text-slate-400 hover:bg-slate-800 hover:text-white rounded-2xl transition-all group"
                    >
                        <i className="fas fa-sign-in-alt text-lg group-hover:text-blue-400 transition-colors"></i>
                        <span className="font-black text-[10px] uppercase tracking-[0.15em]">Admin Login</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
