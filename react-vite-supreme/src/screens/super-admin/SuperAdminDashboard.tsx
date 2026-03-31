import { useState, useEffect, useMemo } from 'react';
import { getHoliday, isSunday } from '../../utils/calendarUtils';

interface SuperAdminDashboardProps {
    role: string;
    bookings: any[];
    setView: (view: string) => void;
}

export default function SuperAdminDashboard({ bookings }: Omit<SuperAdminDashboardProps, 'role' | 'setView'>) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [realTime, setRealTime] = useState('');
    const [selectedDateBookings, setSelectedDateBookings] = useState<{date: string, bookings: any[]} | null>(null);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setRealTime(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const stats = useMemo(() => {
        const safeBookings = Array.isArray(bookings) ? bookings : [];
        return {
            total: safeBookings.length,
            pending: safeBookings.filter(b => b.status === 'PENDING').length,
            approved: safeBookings.filter(b => b.status === 'APPROVED').length
        };
    }, [bookings]);

    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const prevLastDate = new Date(year, month, 0).getDate();

        const days = [];
        for (let i = firstDay; i > 0; i--) {
            days.push({ day: prevLastDate - i + 1, type: 'prev', dateKey: '' });
        }
        const today = new Date();
        const safeBookings = Array.isArray(bookings) ? bookings : [];
        for (let i = 1; i <= lastDate; i++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
            const dayBookings = safeBookings.filter(b => b.date === dateKey);

            const dateObj = new Date(year, month, i);
            const isSun = isSunday(dateObj);
            const holidayName = getHoliday(dateObj);

            days.push({
                day: i,
                type: 'current',
                dateKey,
                isToday,
                isSunday: isSun,
                holidayName,
                bookings: dayBookings
            });
        }
        return days;
    }, [currentDate, bookings]);

    const changeMonth = (offset: number) => {
        const nextDate = new Date(currentDate);
        nextDate.setMonth(currentDate.getMonth() + offset);
        setCurrentDate(nextDate);
    };

    const handleDateClick = (d: any) => {
        if (!d.dateKey || d.type === 'prev') return;
        setSelectedDateBookings({ date: d.dateKey, bookings: d.bookings || [] });
    };

    return (
        <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-full transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Global Network</h2>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/40 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-800/50">
                                <i className="fas fa-crown mr-2"></i> Super Admin Access
                            </span>
                            <span className="text-slate-400 dark:text-slate-500 font-bold text-xs flex items-center">
                                <i className="far fa-clock mr-2 text-blue-500"></i> {realTime}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center uppercase tracking-tighter">
                                        <i className="fas fa-calendar-alt mr-3 text-blue-500"></i> System-wide Calendar
                                    </h3>
                                </div>
                                <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-md transition shadow-sm">
                                        <i className="fas fa-chevron-left text-xs text-slate-600 dark:text-slate-300"></i>
                                    </button>
                                    <span className="px-4 font-bold text-xs text-slate-700 dark:text-slate-100 uppercase tracking-widest min-w-[140px] text-center">
                                        {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}
                                    </span>
                                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white dark:hover:bg-slate-600 rounded-md transition shadow-sm">
                                        <i className="fas fa-chevron-right text-xs text-slate-600 dark:text-slate-300"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-7 gap-2 w-full text-center">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">{day}</div>
                                    ))}
                                    {calendarData.map((d: any, i) => (
                                        <div
                                            key={i}
                                            onClick={() => handleDateClick(d)}
                                            className={`h-24 border rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative text-sm hover:shadow-md ${d.type === 'prev' ? 'border-slate-50 dark:border-slate-800 text-slate-300 dark:text-slate-600 opacity-50 cursor-default' :
                                                    d.isToday ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold z-10' :
                                                        d.isSunday ? 'border-rose-200 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' :
                                                            d.holidayName ? 'border-purple-200 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                                                        d.bookings?.length > 0 ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold' :
                                                            'border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <span className={`text-lg transition-transform ${d.isSunday || d.holidayName ? 'font-black scale-110' : ''} ${d.isSunday ? 'text-rose-600 dark:text-rose-500' : ''}`}>{d.day}</span>
                                            {d.isToday && <span className="text-[8px] uppercase font-bold text-blue-500">Today</span>}
                                            {d.holidayName && <span className="text-[8px] text-center uppercase tracking-tighter leading-tight mt-1 px-1 font-bold text-purple-600">{d.holidayName}</span>}
                                            {d.bookings?.length > 0 && (
                                                <span className="text-[8px] bg-amber-200 text-amber-800 px-1 rounded mt-1 font-bold">{d.bookings.length} Booked</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-xl group">
                            <h4 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center">
                                <i className="fas fa-server mr-2 text-blue-500"></i> Platform Health
                            </h4>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <i className="fas fa-database text-lg"></i>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Connected</p>
                                    </div>
                                    <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <i className="fas fa-shield-alt text-lg"></i>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Active</p>
                                    </div>
                                    <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                            <i className="fas fa-code-branch text-6xl absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"></i>
                            <h4 className="font-black text-lg mb-2 uppercase tracking-tighter">System Summary</h4>
                            <p className="text-xs text-slate-400 leading-relaxed font-bold italic">
                                Overview of all regional clusters and network activity. 
                                <br/> <span className="text-blue-400">Root Access Active.</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Premium Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 dark:shadow-none relative overflow-hidden group">
                        <i className="fas fa-globe text-9xl absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-500"></i>
                        <div className="relative z-10">
                            <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1">Total Network Requests</p>
                            <h3 className="text-5xl font-black tracking-tight mb-4">{stats.total}</h3>
                            <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold backdrop-blur-sm">
                                <i className="fas fa-chart-line mr-1.5"></i> Global Activity
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden group">
                        <i className="fas fa-hourglass-half text-9xl absolute -right-6 -bottom-6 text-amber-500 opacity-5 group-hover:scale-110 transition-transform duration-500"></i>
                        <div className="relative z-10">
                            <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Awaiting Review</p>
                            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{stats.pending}</h3>
                            <div className="inline-flex items-center px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-bold">
                                <i className="fas fa-clock mr-1.5"></i> Needs Action
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden group">
                        <i className="fas fa-check-circle text-9xl absolute -right-6 -bottom-6 text-emerald-500 opacity-5 group-hover:scale-110 transition-transform duration-500"></i>
                        <div className="relative z-10">
                            <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Overall Confirmed</p>
                            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{stats.approved}</h3>
                            <div className="inline-flex items-center px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold">
                                <i className="fas fa-check mr-1.5"></i> Fully Scheduled
                            </div>
                        </div>
                    </div>
                </div>

                {selectedDateBookings && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-md p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-slate-100 dark:border-slate-700">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                                <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">Bookings: {selectedDateBookings.date}</h3>
                                <button onClick={() => setSelectedDateBookings(null)} className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400 hover:text-rose-500 transition-all">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
                                {selectedDateBookings.bookings.length > 0 ? (
                                    <div className="space-y-6">
                                        {selectedDateBookings.bookings.map((b: any, idx: number) => (
                                            <div key={idx} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        b.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' :
                                                        b.status === 'REJECTED' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                                                    }`}>{b.status}</span>
                                                    <div className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                                                        <i className="far fa-clock mr-2 text-blue-500"></i> {b.startTime} - {b.endTime}
                                                    </div>
                                                </div>
                                                <h4 className="font-black text-slate-800 dark:text-white text-base mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all uppercase tracking-tighter leading-tight">{b.purpose}</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                                        <i className="fas fa-user-circle text-blue-400 mr-2 text-base"></i>
                                                        <span className="font-bold truncate">{b.requestor}</span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                                        <i className="fas fa-map-marker-alt text-rose-400 mr-2 text-base"></i>
                                                        <span className="font-bold truncate">{b.venue}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 flex flex-col items-center justify-center">
                                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-200 dark:text-slate-700 border-8 border-white dark:border-slate-800 shadow-inner">
                                            <i className="fas fa-calendar-times text-5xl"></i>
                                        </div>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm italic font-bold">No bookings scheduled for this date.</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-end">
                                <button onClick={() => setSelectedDateBookings(null)} className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white font-black text-sm rounded-2xl hover:opacity-90 transition-all shadow-xl active:scale-95 uppercase tracking-widest">Close Panel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
