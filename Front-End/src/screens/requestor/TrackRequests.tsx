import { useState } from 'react';

interface TrackRequestsProps {
    bookings: any[];
    onUpdateStatus: (id: string | number, status: string) => void;
    onDeleteBooking?: (id: string | number) => void;
    onBulkDeleteBookings?: (ids: (string | number)[]) => void;
    currentUser?: any;
    offices?: any[];
}

export default function TrackRequests({ bookings, onUpdateStatus, onDeleteBooking, onBulkDeleteBookings, currentUser, offices = [] }: TrackRequestsProps) {
    const [filter, setFilter] = useState('ALL');
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

    const filteredBookings = bookings.filter(b => {
        if (filter !== 'ALL' && b.status !== filter) return false;
        
        // Handle Requestor: Only show their own bookings (assuming currentUser.id exists or we filter by requestor)
        // Wait, previously there was no filter by currentUser for TrackRequests.
        // Let's implement the area filtering for admin.
        if (currentUser?.role?.toLowerCase().includes('super')) return true;
        
        if (currentUser?.role === 'admin') {
            const isMatch = (s1?: string, s2?: string) => {
                if (!s1 || !s2) return false;
                const a = s1.toLowerCase().trim();
                const b = s2.toLowerCase().trim();
                return a.includes(b) || b.includes(a);
            };

            const office = offices.find(o => isMatch(o.name, b.venue));
            const region = b.region || office?.region;
            
            let isAllowed = false;
            
            if (!currentUser.assignedRegion || currentUser.assignedRegion === 'All') {
                isAllowed = true;
                if (currentUser.assignedOffice && currentUser.assignedOffice !== 'All' && !isMatch(b.venue, currentUser.assignedOffice)) {
                    isAllowed = false;
                }
            } else {
                const regionMatch = isMatch(region, currentUser.assignedRegion) || isMatch(b.venue, currentUser.assignedRegion);
                if (regionMatch) {
                    isAllowed = true;
                } else if (currentUser.assignedOffice && currentUser.assignedOffice !== 'All' && isMatch(b.venue, currentUser.assignedOffice)) {
                    isAllowed = true;
                }
            }
            
            return isAllowed;
        }
        
        // Requestor sees all bookings? Usually they see their own, but since there's no email filter for requestor in the original code, we'll leave it as is.
        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
            case 'REJECTED': return 'bg-rose-100 text-rose-700';
            case 'CANCELLED': return 'bg-slate-100 text-slate-600';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    const format12Hour = (time24: string) => {
        if (!time24) return '';
        const [h, m] = time24.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${String(hour12).padStart(2, '0')}:${m} ${ampm}`;
    };

    const toggleSelectRow = (id: string | number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredBookings.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredBookings.map(b => b.id));
        }
    };

    const handleBulkDelete = () => {
        if (onBulkDeleteBookings && selectedIds.length > 0) {
            onBulkDeleteBookings(selectedIds);
            setSelectedIds([]);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Track Your Requests</h2>
                    <p className="text-slate-500 mt-1">View the status of your facility bookings.</p>
                </div>
            </header>

            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex gap-2">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setSelectedIds([]); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                {onBulkDeleteBookings && selectedIds.length > 0 && (
                    <button 
                        onClick={handleBulkDelete}
                        className="bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-rose-600 flex items-center gap-2 transition-all"
                    >
                        <i className="fas fa-trash-alt"></i> Delete Selected ({selectedIds.length})
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 w-12 text-center">
                                <input 
                                    type="checkbox" 
                                    className="rounded text-blue-600 w-4 h-4 cursor-pointer" 
                                    checked={filteredBookings.length > 0 && selectedIds.length === filteredBookings.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Venue</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Time</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredBookings.length > 0 ? (
                            filteredBookings.map((b) => (
                                <tr key={b.id} className={`transition-colors ${selectedIds.includes(b.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                                    <td className="p-4 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="rounded text-blue-600 w-4 h-4 cursor-pointer" 
                                            checked={selectedIds.includes(b.id)}
                                            onChange={() => toggleSelectRow(b.id)}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-slate-800">{b.venue}</p>
                                        <p className="text-xs text-slate-400">{b.purpose}</p>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 font-medium">{b.date}</td>
                                    <td className="p-4 text-sm text-slate-600 font-medium">{format12Hour(b.startTime)} - {format12Hour(b.endTime)}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(b.status)}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-4 items-center">
                                        {b.status === 'PENDING' && (
                                            <button
                                                onClick={() => { if (window.confirm("Cancel this booking?")) onUpdateStatus(b.id, 'CANCELLED'); }}
                                                className="text-amber-500 hover:text-amber-700 text-xs font-bold flex items-center gap-1"
                                            >
                                                <i className="fas fa-ban"></i> Cancel
                                            </button>
                                        )}
                                        {onDeleteBooking && (
                                            <button
                                                onClick={() => onDeleteBooking(b.id)}
                                                className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1"
                                            >
                                                <i className="fas fa-trash-alt"></i> Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-400 italic">No bookings found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
