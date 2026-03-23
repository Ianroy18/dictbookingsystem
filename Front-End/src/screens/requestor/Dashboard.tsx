import { useState, useEffect, useMemo } from 'react';
import { getHoliday, isSunday } from '../../utils/calendarUtils';

interface DashboardProps {
    role: string;
    bookings: any[];
    setView: (view: string) => void;
    currentUser?: any;
    offices?: any[];
    setPrefilledData?: (data: any) => void;
}

export default function Dashboard({ bookings, setView, offices = [], setPrefilledData }: Omit<DashboardProps, 'role' | 'currentUser'>) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [realTime, setRealTime] = useState('');
    const [reqRegion, setReqRegion] = useState('All');
    const [reqOffice, setReqOffice] = useState('All');
    const [reqFacility, setReqFacility] = useState('All');
    const [selectedDateBookings, setSelectedDateBookings] = useState<{ date: string, bookings: any[] } | null>(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState<{ start: string, end: string } | null>(null);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setRealTime(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const regions = useMemo(() => {
        const set = new Set(offices.map(o => o.region));
        return ['All', ...Array.from(set)];
    }, [offices]);

    const filteredOffices = useMemo(() => {
        if (reqRegion === 'All') return offices;
        return offices.filter(o => o.region === reqRegion);
    }, [reqRegion, offices]);

    const filteredBookings = useMemo(() => {
        const safeBookings = Array.isArray(bookings) ? bookings : [];
        return safeBookings.filter(b => {
            const office = offices.find(o => o.name === b.venue);
            const region = b.region || office?.region;

            if (reqRegion !== 'All' && region !== reqRegion) return false;
            if (reqOffice !== 'All' && b.venue !== reqOffice) return false;
            if (reqFacility !== 'All' && b.facility !== reqFacility) return false;
            return true;
        });
    }, [bookings, offices, reqRegion, reqOffice, reqFacility]);

    const stats = useMemo(() => {
        return {
            total: filteredBookings.length,
            pending: filteredBookings.filter(b => b.status === 'PENDING').length,
            approved: filteredBookings.filter(b => b.status === 'APPROVED').length
        };
    }, [filteredBookings]);

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
        for (let i = 1; i <= lastDate; i++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
            const dayBookings = filteredBookings.filter(b => b.date === dateKey);
            
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
    }, [currentDate, filteredBookings]);

    const changeMonth = (offset: number) => {
        const nextDate = new Date(currentDate);
        nextDate.setMonth(currentDate.getMonth() + offset);
        setCurrentDate(nextDate);
    };

    const handleDateClick = (d: any) => {
        if (!d.dateKey || d.type === 'prev') return;
        
        const todayStr = new Date();
        const year = todayStr.getFullYear();
        const month = String(todayStr.getMonth() + 1).padStart(2, '0');
        const day = String(todayStr.getDate()).padStart(2, '0');
        const formattedTodayStr = `${year}-${month}-${day}`;

        const isPast = d.dateKey < formattedTodayStr;

        if (isPast) return; 
        setSelectedDateBookings({ date: d.dateKey, bookings: d.bookings || [] });
        setSelectedTimeRange(null);
    };

    const format12Hour = (time24: string) => {
        const [h, m] = time24.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${String(hour12).padStart(2, '0')}:${m} ${ampm}`;
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let i = 8; i < 17; i++) {
            const startStr = `${i.toString().padStart(2, '0')}:00`;
            const endStr = `${(i + 1).toString().padStart(2, '0')}:00`;
            slots.push({ 
                start: startStr, 
                end: endStr,
                label: `${format12Hour(startStr)} - ${format12Hour(endStr)}`
            });
        }
        return slots;
    };

    const isSlotOccupied = (slotStart: string, slotEnd: string, dayBookings: any[]) => {
        return dayBookings.some(b => {
            if (b.status === 'REJECTED' || b.status === 'CANCELLED') return false;
            return (slotStart < b.endTime && slotEnd > b.startTime);
        });
    };

    const handleSlotClick = (slot: {start: string, end: string}, occupied: boolean) => {
        if (occupied) return;
        
        if (!selectedTimeRange) {
            setSelectedTimeRange(slot);
        } else {
            if (selectedTimeRange.start === slot.start && selectedTimeRange.end === slot.end) {
                setSelectedTimeRange(null);
                return;
            }
            if (slot.start === selectedTimeRange.end) {
                setSelectedTimeRange({ start: selectedTimeRange.start, end: slot.end });
            } else if (slot.end === selectedTimeRange.start) {
                setSelectedTimeRange({ start: slot.start, end: selectedTimeRange.end });
            } else {
                setSelectedTimeRange(slot);
            }
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-full">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome, Requestor!</h2>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-slate-500 dark:text-slate-400 flex items-center">
                                <i className="far fa-clock mr-2 text-[#00AEEF]"></i>
                                <span className="font-medium text-sm text-[#00AEEF]">{realTime}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold min-w-[200px] text-slate-700 dark:text-white"
                            value={reqRegion}
                            onChange={(e) => { setReqRegion(e.target.value); setReqOffice('All'); setReqFacility('All'); }}
                        >
                            <option value="All">Select Region</option>
                            {regions.filter(r => r !== 'All').map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <select
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold min-w-[200px] text-slate-700 dark:text-white disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900"
                            value={reqOffice}
                            onChange={(e) => { setReqOffice(e.target.value); setReqFacility('All'); }}
                            disabled={reqRegion === 'All'}
                        >
                            <option value="All">{reqRegion === 'All' ? 'Select Region First' : 'Select Office/Venue'}</option>
                            {filteredOffices.map(o => <option key={o.name} value={o.name}>{o.name}</option>)}
                        </select>
                        <select
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold min-w-[200px] text-slate-700 dark:text-white disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900"
                            value={reqFacility}
                            onChange={(e) => setReqFacility(e.target.value)}
                            disabled={reqOffice === 'All'}
                        >
                            <option value="All">{reqOffice === 'All' ? 'Select Venue First' : 'Select Room/Facility'}</option>
                            {reqOffice !== 'All' && offices.find(o => o.name === reqOffice)?.rooms?.map((r: any) => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setView('new-booking')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-blue-200/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center"
                        >
                            <i className="fas fa-plus mr-2"></i> New Booking
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/50">
                            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center uppercase tracking-tighter">
                                    <i className="fas fa-calendar-check mr-3 text-blue-500 text-2xl"></i> Availability Calendar
                                </h3>
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

                            <div className="p-4 sm:p-6 relative">
                                <div className="grid grid-cols-7 gap-1 sm:gap-2 w-full text-center">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-2">{day}</div>
                                    ))}
                                    {calendarData.map((d: any, i) => (
                                        <div
                                            key={i}
                                            onClick={() => handleDateClick(d)}
                                            className={`h-20 sm:h-28 border rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative text-sm hover:shadow-md ${d.type === 'prev' ? 'border-slate-50 dark:border-slate-800 text-slate-300 dark:text-slate-600 opacity-50 cursor-default' :
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
                                            {d.isSunday && !d.holidayName && <span className="text-[7px] font-black uppercase tracking-widest text-rose-400/50 mt-1">Closed</span>}
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
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h4 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Account Overview</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center group">
                                    <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Total Bookings</span>
                                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-lg text-sm font-bold group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition">{stats.total}</span>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Approved Missions</span>
                                    <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-lg text-sm font-bold group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900 transition">{stats.approved}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                            <i className="fas fa-info-circle text-6xl absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"></i>
                            <h4 className="font-bold text-lg mb-2 flex items-center">
                                <i className="fas fa-bell mr-2 text-blue-300"></i> Notice
                            </h4>
                            <p className="text-sm text-blue-100 leading-relaxed italic relative z-10">
                                All facility requests must be submitted at least 48 hours prior to the event for coordination.
                            </p>
                        </div>
                    </div>
                </div>

                {selectedDateBookings && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800 text-lg">Bookings for {selectedDateBookings.date}</h3>
                                <button onClick={() => setSelectedDateBookings(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                                <div>
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Time Slots</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {generateTimeSlots().map((slot, idx) => {
                                            const occupied = isSlotOccupied(slot.start, slot.end, selectedDateBookings.bookings);
                                            
                                            let isSelected = false;
                                            if (selectedTimeRange) {
                                                isSelected = slot.start >= selectedTimeRange.start && slot.end <= selectedTimeRange.end;
                                            }

                                            return (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => handleSlotClick(slot, occupied)}
                                                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                                                        occupied ? 'bg-rose-50 border-rose-100 text-rose-400 cursor-not-allowed opacity-60' :
                                                        isSelected ? 'bg-blue-500 border-blue-600 text-white cursor-pointer shadow-md scale-105' :
                                                        'bg-white border-slate-200 text-slate-600 cursor-pointer hover:border-blue-400 hover:bg-blue-50'
                                                    }`}
                                                >
                                                    {slot.label}
                                                    {occupied && <div className="text-[9px] uppercase tracking-widest mt-1">Occupied</div>}
                                                    {!occupied && isSelected && <div className="text-[9px] uppercase tracking-widest mt-1 text-blue-100">Selected</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-2 italic">
                                        <i className="fas fa-info-circle text-blue-400"></i>
                                        Click multiple adjacent slots to increase duration.
                                    </p>
                                </div>

                                {selectedDateBookings.bookings.length > 0 && (
                                    <div className="pt-4 border-t border-slate-100">
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Existing Commitments</h4>
                                        <div className="space-y-3">
                                            {selectedDateBookings.bookings.map((b: any, idx: number) => (
                                                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${
                                                            b.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                                            b.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                                        }`}>{b.status}</span>
                                                        <span className="text-xs font-bold text-slate-500">{format12Hour(b.startTime)} - {format12Hour(b.endTime)}</span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 text-sm mb-1">{b.purpose}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest"><i className="fas fa-map-marker-alt text-blue-400 mr-2"></i>{b.venue} • {b.facility}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                <button onClick={() => setSelectedDateBookings(null)} className="px-6 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors">Close</button>
                                <button onClick={() => {
                                    if (setPrefilledData) {
                                        setPrefilledData({
                                            date: selectedDateBookings.date,
                                            region: reqRegion,
                                            venue: reqOffice,
                                            facility: reqFacility,
                                            startTime: selectedTimeRange?.start || '',
                                            endTime: selectedTimeRange?.end || ''
                                        });
                                    }
                                    setSelectedDateBookings(null);
                                    setView('new-booking');
                                }} className="px-6 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
                                    <i className="fas fa-plus mr-1"></i> New Booking Here
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
