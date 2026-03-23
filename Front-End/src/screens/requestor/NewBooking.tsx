import { useState, useMemo, useEffect, ChangeEvent, FormEvent } from 'react';
import Swal from 'sweetalert2';

interface NewBookingProps {
    offices: any[];
    bookings?: any[];
    prefilledData?: any;
    onAdd: (newEntry: any) => void;
    onCancel: () => void;
}

export default function NewBooking({ offices, bookings = [], prefilledData, onAdd, onCancel }: NewBookingProps) {
    const [formData, setFormData] = useState<any>({
        venue: prefilledData?.venue && prefilledData.venue !== 'All' ? prefilledData.venue : '',
        facility: prefilledData?.facility && prefilledData.facility !== 'All' ? prefilledData.facility : '',
        date: prefilledData?.date || '',
        startTime: prefilledData?.startTime || '',
        endTime: prefilledData?.endTime || '',
        purpose: '',
        requestor: '',
        email: '',
        phoneNumber: '',
        selectedEquipment: [], // Array of items with requestedQty
        attachmentName: '',
        attachment: null
    });
    const [inventory, setInventory] = useState<any[]>([]);
    const [warning, setWarning] = useState<string | null>(null);

    useEffect(() => {
        fetch('http://localhost:8000/inventory/')
            .then(res => res.json())
            .then(data => setInventory(data))
            .catch(err => console.error("Error fetching inventory:", err));
    }, []);

    const selectedOffice = useMemo(() => offices.find(o => o.name === formData.venue), [formData.venue, offices]);
    
    const availableEquipment = useMemo(() => {
        if (!formData.venue) return [];
        return inventory.filter(item => item.venue === formData.venue && item.available > 0);
    }, [formData.venue, inventory]);

    const handleDateChange = (dateVal: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(dateVal);
        
        if (selected < today) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Date',
                text: 'You cannot select a past date.',
                confirmButtonColor: '#3085d6'
            });
            setWarning("You cannot select a past date.");
            setFormData({ ...formData, date: '' });
            return;
        }

        const existingCount = bookings.filter(b => 
            b.date === dateVal && 
            b.venue === formData.venue && 
            b.facility === formData.facility &&
            b.status !== 'REJECTED' && b.status !== 'CANCELLED'
        ).length;

        if (existingCount >= 3) {
            Swal.fire({
                icon: 'error',
                title: 'Facility Fully Booked',
                text: 'This facility is fully booked for the selected date. Please choose another date or venue.',
                confirmButtonColor: '#d33'
            });
            setWarning("This facility is fully booked for the selected date. Please choose another date or venue.");
            setFormData({ ...formData, date: '' });
            return;
        }

        setWarning(null);
        setFormData({ ...formData, date: dateVal });
    };

    const handleEquipmentToggle = (item: any) => {
        setFormData((prev: any) => {
            const isSelected = prev.selectedEquipment.some((e: any) => e.id === item.id);
            if (isSelected) {
                return {
                    ...prev,
                    selectedEquipment: prev.selectedEquipment.filter((e: any) => e.id !== item.id)
                };
            } else {
                return {
                    ...prev,
                    selectedEquipment: [...prev.selectedEquipment, { ...item, requestedQty: 1 }]
                };
            }
        });
    };

    const handleQtyChange = (itemId: number, delta: number) => {
        setFormData((prev: any) => ({
            ...prev,
            selectedEquipment: prev.selectedEquipment.map((e: any) => {
                if (e.id === itemId) {
                    const newQty = Math.max(1, Math.min(e.available, e.requestedQty + delta));
                    return { ...e, requestedQty: newQty };
                }
                return e;
            })
        }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev: any) => ({
                    ...prev,
                    attachmentName: file.name,
                    attachment: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!formData.date) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a valid reservation date.',
                confirmButtonColor: '#3085d6'
            });
            setWarning("Please select a valid reservation date.");
            return;
        }

        const payload = {
            ...formData,
            status: 'PENDING',
            region: selectedOffice?.region || '',
            createdAt: new Date().toISOString()
        };

        Swal.fire({
            title: 'Submitting Request',
            text: 'Please wait while we process your booking...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await fetch('http://localhost:8000/bookings/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const textResponse = await response.text();
            let result;
            try {
                result = JSON.parse(textResponse);
            } catch (e) {
                result = { message: "Server encountered a critical error. Please try without attachments or check server logs." };
            }
            
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Submission Successful',
                    text: 'Your booking request has been submitted for review!',
                    confirmButtonColor: '#10b981'
                });
                onAdd(result);
            } else {
                let errorMessage = "Unknown error occurred.";
                if (typeof result === 'object' && result !== null) {
                    const errors = [];
                    for (const [key, value] of Object.entries(result)) {
                        if (Array.isArray(value)) {
                            errors.push(`${key}: ${value[0]}`);
                        } else if (typeof value === 'string') {
                            errors.push(value);
                        }
                    }
                    if (errors.length > 0) errorMessage = errors.join('\n');
                }
                Swal.fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: errorMessage,
                    confirmButtonColor: '#d33'
                });
            }
        } catch (error) {
            console.error("Booking Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Network Error',
                text: 'Error connecting to the server. Please check your connection and try again.',
                confirmButtonColor: '#d33'
            });
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border border-slate-200/60 dark:border-slate-700 overflow-hidden">
                {/* Tactical Header */}
                <div className="bg-slate-900 border-b border-slate-800 p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full -mr-64 -mt-64 blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full -ml-40 -mb-40 blur-[80px]"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-16 h-16 bg-blue-600 rounded-[2rem] shadow-2xl shadow-blue-500/30 flex items-center justify-center transform hover:rotate-12 transition-transform duration-500">
                                <i className="fas fa-file-signature text-3xl text-white"></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-blue-500 font-black text-[11px] uppercase tracking-[0.5em] mb-1">Booking Information</span>
                                <h2 className="text-5xl font-black text-white tracking-tighter leading-none">Facility Request</h2>
                            </div>
                        </div>
                        <p className="text-slate-400 font-medium max-w-2xl text-lg leading-relaxed mb-0">Reserve a space and equipment for your events or meetings at our regional offices.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-12 space-y-20">
                    {/* Section 1: Venue & Timing */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-3xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-2xl shadow-inner border border-blue-100 dark:border-blue-800/50">01</div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Location & Schedule</h3>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Specify the venue and timeframe for your request</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50/50 dark:bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-sm">
                            <div className="space-y-4">
                                <label className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <i className="fas fa-map-marker-alt mr-2 text-blue-500"></i> Regional Office
                                </label>
                                <select
                                    required
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl focus:ring-8 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all font-black text-sm text-slate-900 dark:text-white appearance-none cursor-pointer"
                                    value={formData.venue}
                                    onChange={(e) => setFormData({ ...formData, venue: e.target.value, facility: '', selectedEquipment: [] })}
                                >
                                    <option value="">Choose a Regional Office...</option>
                                    {offices.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <i className="fas fa-door-open mr-2 text-blue-500"></i> Selected Room / Unit
                                </label>
                                <select
                                    required
                                    disabled={!selectedOffice || !selectedOffice.rooms || selectedOffice.rooms.length === 0}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl focus:ring-8 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all font-black text-sm text-slate-900 dark:text-white appearance-none disabled:opacity-20 cursor-pointer"
                                    value={formData.facility}
                                    onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                                >
                                    <option value="">Select a Room...</option>
                                    {selectedOffice?.rooms?.map((r: any) => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <label className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <i className="fas fa-calendar-check mr-2 text-blue-500"></i> Reservation Date
                                </label>
                                <div className="relative group">
                                    <input
                                        type="date" required
                                        className={`w-full bg-white dark:bg-slate-800 border p-6 rounded-2xl focus:ring-8 outline-none transition-all font-black text-sm text-slate-900 dark:text-white tracking-[0.2em] ${warning ? 'border-rose-500 focus:ring-rose-100 dark:focus:ring-rose-900/30' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-100 dark:focus:ring-blue-900/20'}`}
                                        value={formData.date}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                    />
                                    {warning && (
                                        <div className="flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase tracking-widest mt-4 ml-3 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800/50 animate-bounce">
                                            <i className="fas fa-exclamation-triangle"></i> Notification: {warning}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <i className="fas fa-clock mr-2 text-blue-500"></i> Start Time
                                </label>
                                <input type="time" required className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl focus:ring-8 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all font-black text-sm text-slate-900 dark:text-white" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <i className="fas fa-history mr-2 text-blue-500"></i> End Time
                                </label>
                                <input type="time" required className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl focus:ring-8 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all font-black text-sm text-slate-900 dark:text-white" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Equipment Selection */}
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-3xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-2xl shadow-inner border border-indigo-100 dark:border-indigo-800/50">02</div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Equipment & Resources</h3>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Request available equipment for your reservation</p>
                            </div>
                        </div>
                        
                        {!formData.venue ? (
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-20 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center space-y-4 hover:border-blue-400 dark:hover:border-blue-800 transition-all duration-500">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                    <i className="fas fa-satellite-dish text-4xl text-slate-300 dark:text-slate-600"></i>
                                </div>
                                <p className="text-slate-400 dark:text-slate-500 font-black text-[11px] uppercase tracking-[0.3em]">Awaiting Venue Selection for Inventory Linkage</p>
                            </div>
                        ) : availableEquipment.length === 0 ? (
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-20 rounded-[3rem] border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
                                <i className="fas fa-boxes text-4xl text-slate-300 dark:text-slate-700"></i>
                                <p className="text-slate-400 dark:text-slate-500 font-black text-[11px] uppercase tracking-[0.3em]">No Assets Registered at this Command Hub</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {availableEquipment.map((item: any) => {
                                    const sessionItem = formData.selectedEquipment.find((e: any) => e.id === item.id);
                                    const isSelected = !!sessionItem;
                                    
                                    return (
                                        <div 
                                            key={item.id}
                                            onClick={() => !isSelected && handleEquipmentToggle(item)}
                                            className={`p-8 rounded-[2rem] border-2 transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full ${isSelected 
                                                ? 'bg-blue-600 border-transparent shadow-[0_20px_50px_-15px_rgba(37,99,235,0.4)] scale-105 z-10' 
                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl'}`}
                                        >
                                            <div className="flex justify-between items-start mb-10">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all'}`}>
                                                    <i className="fas fa-laptop-code"></i>
                                                </div>
                                                {isSelected && (
                                                    <div 
                                                        onClick={(e) => { e.stopPropagation(); handleEquipmentToggle(item); }}
                                                        className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-rose-500 hover:scale-110 transition-all cursor-pointer"
                                                    >
                                                        <i className="fas fa-times text-[10px]"></i>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <h4 className={`font-black text-lg tracking-tight mb-2 ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{item.name}</h4>
                                                <div className={`text-[10px] font-black uppercase tracking-[0.2em] inline-flex items-center gap-2 px-3 py-1 rounded-lg ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                                                    <i className="fas fa-info-circle"></i> Stock: {item.available}
                                                </div>
                                            </div>
                                            
                                            {isSelected && (
                                                <div className="mt-8 p-3 bg-white/10 dark:bg-black/20 rounded-2xl animate-in fade-in zoom-in duration-500 border border-white/5">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleQtyChange(item.id, -1); }}
                                                            className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all border border-white/5"
                                                        >
                                                            <i className="fas fa-minus text-xs"></i>
                                                        </button>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-white font-black text-2xl tabular-nums leading-none mb-1">{sessionItem.requestedQty}</span>
                                                            <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">Quantity</span>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); handleQtyChange(item.id, 1); }}
                                                            className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all border border-white/5"
                                                        >
                                                            <i className="fas fa-plus text-xs"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Section 3: Purpose */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-3xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-2xl shadow-inner border border-indigo-100 dark:border-indigo-800/50">03</div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Request Details</h3>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Purpose and goals of your request</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-4">
                                <label className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <i className="fas fa-pen-nib mr-2 text-indigo-500"></i> Purpose of Request / Goals
                                </label>
                                <textarea required rows={6} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] focus:ring-8 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 outline-none transition-all font-medium resize-none text-slate-700 dark:text-white placeholder:text-slate-300 leading-relaxed shadow-inner" placeholder="Provide details about your event or request..." value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Authentication */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-3xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-2xl shadow-inner border border-emerald-100 dark:border-emerald-800/50">04</div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Contact Information</h3>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Requestor verification and details</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <div className="space-y-4">
                                <label className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <i className="fas fa-id-badge mr-2 text-emerald-500"></i> Requestor Name
                                </label>
                                <input type="text" required className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl focus:ring-8 focus:ring-emerald-100 dark:focus:ring-emerald-900/20 outline-none transition-all font-black text-sm text-slate-900 dark:text-white" placeholder="Juan Dela Cruz" value={formData.requestor} onChange={(e) => setFormData({ ...formData, requestor: e.target.value })} />
                            </div>
                            <div className="space-y-4">
                                <label className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <i className="fas fa-envelope-open-text mr-2 text-emerald-500"></i> Official Email Address
                                </label>
                                <input type="email" required className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl focus:ring-8 focus:ring-emerald-100 dark:focus:ring-emerald-900/20 outline-none transition-all font-black text-sm text-slate-900 dark:text-white" placeholder="juan.d@dict.gov.ph" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="space-y-4">
                                <label className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <i className="fas fa-phone-alt mr-2 text-emerald-500"></i> Contact Number
                                </label>
                                <input type="tel" required className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl focus:ring-8 focus:ring-emerald-100 dark:focus:ring-emerald-900/20 outline-none transition-all font-black text-sm text-slate-900 dark:text-white" placeholder="+63 9XX XXX XXXX" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
                            </div>

                             <div className="md:col-span-2 lg:col-span-3 space-y-4">
                                <label className="flex items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                                    <i className="fas fa-file-pdf mr-2 text-emerald-500"></i> Formal Request Letter
                                </label>
                                <div className="border-4 border-dashed border-slate-100 dark:border-slate-700 rounded-[3.5rem] p-20 text-center hover:border-emerald-500 dark:hover:border-emerald-700 hover:bg-emerald-50/10 dark:hover:bg-emerald-900/10 transition-all cursor-pointer group relative overflow-hidden shadow-sm">
                                    <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" />
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-slate-100 dark:border-slate-800 mb-8 group-hover:scale-110 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-all duration-500 shadow-sm">
                                            <i className="fas fa-cloud-upload-alt text-4xl text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 transition-colors"></i>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">
                                                {formData.attachmentName || 'Click to Upload Request Letter'}
                                            </p>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Support Document • PDF / Image • 10MB Max</p>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Final Actions */}
                    <div className="pt-16 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-end gap-8 bg-slate-50/40 dark:bg-black/20 -mx-12 -mb-12 p-12 backdrop-blur-sm">
                        <button 
                            type="button" 
                            onClick={onCancel} 
                            className="px-14 py-6 text-slate-400 dark:text-slate-500 font-black text-[11px] uppercase tracking-[0.3em] hover:text-slate-900 dark:hover:text-white transition-all order-2 sm:order-1"
                        >
                            Cancel Request
                        </button>
                        <button 
                            type="submit" 
                            className="px-20 py-6 bg-slate-900 dark:bg-blue-600 text-white font-black rounded-3xl shadow-[0_25px_50px_-12px_rgba(30,41,59,0.5)] dark:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-6 order-1 sm:order-2 group"
                        >
                            Submit Booking <i className="fas fa-arrow-right text-sm group-hover:translate-x-2 transition-transform"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

