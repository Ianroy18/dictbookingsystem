import { useState } from 'react';
import Swal from 'sweetalert2';
import { MapPin, CalendarDays, UserCircle, Clock3, Paperclip, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface ReviewRequestsProps {
    bookings: any[];
    offices: any[];
    currentUser: any;
    onUpdateStatus: (id: string | number, status: string, remarks: string) => void;
    onDeleteBooking: (id: string | number) => void;
}

export default function ReviewRequests({ bookings, offices, currentUser, onUpdateStatus, onDeleteBooking }: ReviewRequestsProps) {
    const [filter, setFilter] = useState('PENDING');
    const [remarkText, setRemarkText] = useState<any>({});
    const [processingIds, setProcessingIds] = useState<Array<string | number>>([]);

    const isSuperAdmin = currentUser?.role?.toLowerCase().includes('super');
    const assignedRegion = currentUser?.assignedRegion;
    const assignedOffice = currentUser?.assignedOffice;

    const filteredBookings = bookings.filter(b => {
        if (filter !== 'ALL' && b.status?.toUpperCase() !== filter) return false;
        if (isSuperAdmin) return true;
        
        const isMatch = (s1?: string, s2?: string) => {
            if (!s1 || !s2) return false;
            const a = s1.toLowerCase().trim();
            const b = s2.toLowerCase().trim();
            return a.includes(b) || b.includes(a);
        };

        const office = offices.find(o => isMatch(o.name, b.venue));
        const region = b.region || office?.region;
        
        // Relaxed matching based on user request: if it maps to their region OR office, allow it.
        let isAllowed = false;
        
        if (!assignedRegion || assignedRegion === 'All') {
            isAllowed = true;
            // if assignedOffice is specific, restrict to that office
            if (assignedOffice && assignedOffice !== 'All' && !isMatch(b.venue, assignedOffice)) {
                isAllowed = false;
            }
        } else {
            const regionMatch = isMatch(region, assignedRegion) || isMatch(b.venue, assignedRegion);
            if (regionMatch) {
                isAllowed = true;
            } else if (assignedOffice && assignedOffice !== 'All' && isMatch(b.venue, assignedOffice)) {
                isAllowed = true;
            }
        }
        
        return isAllowed;
    });

    const format12Hour = (time24: string) => {
        if (!time24) return '';
        const [h, m] = time24.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${String(hour12).padStart(2, '0')}:${m} ${ampm}`;
    };

    const setProcessing = (id: string | number, processing: boolean) => {
        setProcessingIds((prev) => {
            if (processing) {
                return prev.includes(id) ? prev : [...prev, id];
            }
            return prev.filter((item) => item !== id);
        });
    };

    const isProcessing = (id: string | number) => processingIds.includes(id);

    const handleAction = async (id: string | number, status: string) => {
        const remarks = remarkText[id] || '';
        if (status === 'REJECTED' && !remarks) {
            await Swal.fire({
                icon: 'warning',
                title: 'Remarks required',
                text: 'Please provide remarks before rejecting this request.',
                confirmButtonColor: '#d33',
            });
            return;
        }

        setProcessing(id, true);
        const title = status === 'APPROVED' ? 'Granting request' : 'Processing request';
        const successText = status === 'APPROVED' ? 'Booking request has been approved.' : 'Booking request has been updated.';

        await Swal.fire({
            title,
            text: 'Please wait while we update the request.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            await Promise.resolve(onUpdateStatus(id, status, remarks));
            await Swal.fire({
                icon: 'success',
                title: status === 'APPROVED' ? 'Granted' : 'Updated',
                text: successText,
                timer: 1700,
                showConfirmButton: false,
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
            });
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Update failed',
                text: 'There was a problem updating the request. Please try again.',
                confirmButtonColor: '#d33',
            });
        } finally {
            setProcessing(id, false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Request Review</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Evaluate and authorize facility access missions.</p>
            </header>

            <div className="flex gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 inline-flex">
                {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredBookings.length > 0 ? filteredBookings.map((b) => (
                    <div key={b.id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col md:flex-row">
                        <div className="p-8 flex-1 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${b.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' :
                                        b.status === 'REJECTED' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                                    }`}>
                                    {b.status}
                                </span>
                                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">ID: {b.id}</span>
                            </div>

                            <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase">{b.purpose}</h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                    <MapPin className="mr-3 text-rose-500 dark:text-rose-400" size={16} /> {b.venue}
                                </div>
                                <div className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                    <CalendarDays className="mr-3 text-blue-500 dark:text-blue-400" size={16} /> {b.date}
                                </div>
                                <div className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                    <UserCircle className="mr-3 text-indigo-500 dark:text-indigo-400" size={16} /> {b.requestor}
                                </div>
                                <div className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                    <Clock3 className="mr-3 text-emerald-500 dark:text-emerald-400" size={16} /> {format12Hour(b.startTime)} - {format12Hour(b.endTime)}
                                </div>
                            </div>

                            {b.attachmentName && (
                                <div className="pt-4 border-t border-slate-50 dark:border-slate-700/50">
                                    <a href={b.attachment} download={b.attachmentName} className="inline-flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all border border-blue-100 dark:border-blue-800/50">
                                        <Paperclip className="text-sm" size={14} /> {b.attachmentName}
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-slate-50 dark:bg-slate-900/40 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 w-full md:w-96 flex flex-col justify-center space-y-6">
                            {b.status === 'PENDING' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Decision Remarks</label>
                                        <textarea
                                            placeholder="Specify justification..."
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-sm font-bold text-slate-800 dark:text-white transition-all h-24"
                                            value={remarkText[b.id] || ''}
                                            onChange={(e) => setRemarkText({ ...remarkText, [b.id]: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleAction(b.id, 'APPROVED')}
                                            disabled={isProcessing(b.id)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 dark:bg-emerald-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {isProcessing(b.id) ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                            {isProcessing(b.id) ? 'Granting...' : 'Grant'}
                                        </button>
                                        <button
                                            onClick={() => handleAction(b.id, 'REJECTED')}
                                            disabled={isProcessing(b.id)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 bg-rose-600 dark:bg-rose-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            <XCircle size={16} />
                                            Deny
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Archive Record</p>
                                    {isSuperAdmin && (
                                        <button onClick={() => onDeleteBooking(b.id)} className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-rose-500 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-800">Prune Archive</button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center text-slate-400 italic">No bookings found for review.</div>
                )}
            </div>
        </div>
    );
}
