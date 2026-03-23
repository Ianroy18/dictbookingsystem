import { } from 'react';

interface SidebarProps {
    setView: (view: string) => void;
    currentView: string;
    onLogoutClick: () => void;
    role: string;
    notifCount: number;
    currentUser?: any;
}

export default function Sidebar({ setView, currentView, onLogoutClick, role, notifCount, currentUser }: SidebarProps) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
        { id: 'track-requests', label: 'All Bookings', icon: 'fas fa-calendar-check' },
    ];

    if (role === 'admin' || role === 'super-admin') {
        menuItems.push({ id: 'manage-bookings', label: 'Review Requests', icon: 'fas fa-clipboard-check' });
        menuItems.push({ id: 'inventory', label: 'Inventory', icon: 'fas fa-boxes' });
        menuItems.push({ id: 'offices', label: 'Office Management', icon: 'fas fa-building' });
        menuItems.push({ id: 'templates', label: 'Email Templates', icon: 'fas fa-envelope-open-text' });
        menuItems.push({ id: 'reports', label: 'Usage Reports', icon: 'fas fa-chart-line' });
    }

    if (role === 'super-admin') {
        menuItems.push({ id: 'users', label: 'User Management', icon: 'fas fa-users-cog' });
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-80 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col shadow-2xl z-40 transition-all duration-300">
            <div className="p-10 border-b border-slate-800">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-20 w-20 flex-shrink-0 bg-white rounded-3xl p-3 flex items-center justify-center shadow-2xl ring-4 ring-slate-800/50">
                        <img src="/dict.png" alt="DICT Logo" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-white leading-none uppercase">
                            DICT OFFICE <br />
                            <span className="text-blue-500 text-[9px] font-black tracking-[0.3em] leading-none mt-2 block">
                                {role === 'super-admin' ? 'DICT - SUPER ADMIN' : `DICT - ADMIN (${currentUser?.assignedRegion || 'ALL'})`}
                            </span>
                        </h1>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-6 py-10 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Operations Command</p>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative ${currentView === item.id
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        {currentView === item.id && (
                            <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full -ml-6 animate-pulse"></div>
                        )}
                        <i className={`${item.icon} text-lg transition-transform duration-300 group-hover:scale-110 ${currentView === item.id ? 'text-white' : 'group-hover:text-blue-400'}`}></i>
                        <span className="font-black text-[10px] uppercase tracking-[0.15em]">{item.label}</span>
                        {item.id === 'manage-bookings' && notifCount > 0 && (
                            <span className="ml-auto bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg animate-bounce">{notifCount}</span>
                        )}
                    </button>
                ))}
            </nav>

            <div className="p-6 border-t border-slate-800 space-y-3 bg-slate-950/20 backdrop-blur-sm">
                {role !== 'super-admin' && (
                    <button
                        onClick={() => setView('profile')}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${currentView === 'profile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <i className="fas fa-user-circle text-lg group-hover:text-blue-400 transition-colors"></i>
                        <span className="font-black text-[10px] uppercase tracking-[0.15em]">Admin Profile</span>
                    </button>
                )}
                <button
                    onClick={onLogoutClick}
                    className="w-full flex items-center gap-4 px-6 py-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all group border border-transparent hover:border-rose-500/20"
                >
                    <i className="fas fa-power-off text-lg group-hover:rotate-12 transition-transform"></i>
                    <span className="font-black text-[10px] uppercase tracking-[0.15em]">Terminate Session</span>
                </button>
            </div>
        </aside>
    );
}
