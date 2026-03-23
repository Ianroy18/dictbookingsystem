import { useState, useEffect, FormEvent } from 'react';

interface InventoryProps {
    currentUser: any;
    offices?: any[];
}

export default function Inventory({ currentUser, offices = [] }: InventoryProps) {
    const [items, setItems] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({ name: '', available: 0, venue: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const fetchItems = async () => {
        try {
            const res = await fetch('http://localhost:8000/inventory/');
            if (res.ok) setItems(await res.json());
        } catch (e) { console.error("Fetch items error", e); }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const method = editItem ? 'PATCH' : 'POST';
        const url = editItem ? `http://localhost:8000/inventory/${editItem.id}/` : 'http://localhost:8000/inventory/';
        try {
            const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            if (resp.ok) {
                setFeedbackMessage(editItem ? 'Changes saved successfully' : 'Equipment added successfully');
                setShowSuccess(true);
                setShowModal(false); 
                setEditItem(null); 
                setFormData({ name: '', available: 0, venue: '' }); 
                await fetchItems();
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                const err = await resp.json();
                alert("Error saving: " + (err.message || "Unknown error"));
            }
        } catch (e) {
            console.error("Save Error", e);
            alert("Connection error.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (item: any) => {
        console.log("DEBUG: Attempting to delete item:", item);
        if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
            setIsLoading(true);
            try {
                const url = `http://localhost:8000/inventory/${item.id}/`;
                console.log("DEBUG: Delete Request URL:", url);
                const resp = await fetch(url, { method: 'DELETE' });
                console.log("DEBUG: Delete Response Status:", resp.status);
                
                if (resp.ok) {
                    setFeedbackMessage('Equipment removed successfully');
                    setShowSuccess(true);
                    await fetchItems();
                    setTimeout(() => setShowSuccess(false), 3000);
                } else {
                    const errorMsg = await resp.text();
                    console.error("DEBUG: Delete Failed:", errorMsg);
                    alert(`Failed to delete: ${resp.status} - ${errorMsg}`);
                }
            } catch (e) {
                console.error("Delete Network Error", e);
                alert("Network error occurred while deleting.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const canManage = currentUser?.role === 'super-admin' || currentUser?.role === 'admin';

    const filteredItems = items.filter((item: any) => {
        if (currentUser?.role === 'super-admin') return true;
        
        if (currentUser?.role === 'admin') {
            const office = offices.find(o => o.name === item.venue);
            const region = office?.region;

            let matchesRegion = true;
            if (currentUser.assignedRegion && currentUser.assignedRegion !== 'All') {
                matchesRegion = region === currentUser.assignedRegion;
            }
            // Consistent with relevantOffices: show all equipment in admin's region
            return matchesRegion;
        }
        
        return true;
    });

    const relevantOffices = offices.filter(o => {
        if (currentUser?.role === 'super-admin') return true;
        if (currentUser?.role === 'admin') {
            let matchesRegion = true;
            if (currentUser.assignedRegion && currentUser.assignedRegion !== 'All') {
                matchesRegion = o.region === currentUser.assignedRegion;
            }
            // Consistent with OfficeManagement: admins see all offices in their region
            return matchesRegion;
        }
        return false;
    });

    useEffect(() => { fetchItems(); }, []);
    useEffect(() => {
        if (!editItem && relevantOffices.length === 1) {
            setFormData((prev: any) => ({ ...prev, venue: relevantOffices[0].name }));
        }
    }, [relevantOffices, editItem, showModal]);

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
            {/* Loading Modal */}
            {isLoading && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-widest text-center">Processing Request...</p>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-8 right-8 z-[110] animate-in slide-in-from-right-full duration-500">
                    <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-emerald-200 dark:shadow-none flex items-center gap-3">
                        <i className="fas fa-check-circle text-xl"></i>
                        <div>
                            <p className="font-black text-xs uppercase tracking-widest leading-none">Operation Successful</p>
                            <p className="text-[10px] opacity-80 font-bold mt-1 uppercase tracking-tighter">{feedbackMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Equipment Inventory</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage hardware assets available at each venue.</p>
                </div>
                {canManage && (
                    <button onClick={() => { setEditItem(null); setFormData({ name: '', available: 0, venue: '' }); setShowModal(true); }} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-200 dark:shadow-none hover:shadow-blue-300 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                        <i className="fas fa-plus"></i> Add New Equipment
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item: any) => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800/50">{item.venue}</span>
                                {canManage && (
                                    <div className="flex gap-2 transition-all">
                                        <button 
                                            onClick={() => { setEditItem(item); setFormData(item); setShowModal(true); }} 
                                            className="text-blue-600 dark:text-blue-400 w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm"
                                            title="Edit Equipment"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item)} 
                                            className="text-rose-600 dark:text-rose-400 w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors shadow-sm"
                                            title="Delete Equipment"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.name}</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold tracking-tighter">Equipment Item</p>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-700 flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Stock Level</span>
                                <span className="font-black text-slate-900 dark:text-white text-3xl tabular-nums leading-none tracking-tighter">{item.available}</span>
                            </div>
                            <div className={`h-2 w-12 rounded-full ${item.available > 5 ? 'bg-emerald-400' : (item.available > 0 ? 'bg-amber-400' : 'bg-rose-400')}`}></div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-md p-6">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-300 border border-slate-100 dark:border-slate-700">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{editItem ? 'Update Equipment' : 'Register New Equipment'}</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">Inventory Management</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
                                <i className="fas fa-times-circle text-2xl"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                                    <i className="fas fa-tag mr-2 text-blue-500"></i> Item Name
                                </label>
                                <input 
                                    type="text" 
                                    required 
                                    list="equipment-list"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 transition-all font-bold text-slate-900 dark:text-white" 
                                    placeholder="e.g. Projector XL" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                />
                                <datalist id="equipment-list">
                                    <option value="Projector XL" />
                                    <option value="Laptop (Standard)" />
                                    <option value="Laptop (High-End)" />
                                    <option value="HDMI Cable (5m)" />
                                    <option value="Extension Cord (5-gang)" />
                                    <option value="Sound System" />
                                    <option value="Wireless Microphone" />
                                    <option value="Webcam (1080p)" />
                                    <option value="Whiteboard Marker (Set)" />
                                    <option value="Laser Pointer / Clicker" />
                                    <option value="Portable Screen" />
                                    <option value="Network Switch (16-port)" />
                                    <option value="Printer" />
                                    <option value="Scanner" />
                                    <option value="UPS" />
                                </datalist>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="flex items-center text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                                        <i className="fas fa-sort-numeric-up mr-2 text-blue-500"></i> Quantity
                                    </label>
                                    <input type="number" required min="0" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 transition-all font-bold text-slate-900 dark:text-white" value={formData.available} onChange={(e) => setFormData({ ...formData, available: e.target.value })} />
                                </div>
                                <div className="flex items-end pb-3">
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">Units in stock</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                                    <i className="fas fa-building mr-2 text-blue-500"></i> Assign to Office
                                </label>
                                <select required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 transition-all font-bold text-slate-900 dark:text-white appearance-none" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })}>
                                    <option value="" className="dark:bg-slate-800">Choose Office...</option>
                                    {relevantOffices.map(o => (
                                        <option key={o.id} value={o.name} className="dark:bg-slate-800">{o.name}</option>
                                    ))}
                                </select>
                            </div>
                             <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all uppercase tracking-widest text-[10px]">Cancel</button>
                                <button type="submit" className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 dark:shadow-none group flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all">
                                    {editItem ? 'Save Changes' : 'Register Equipment'} <i className="fas fa-check-circle group-hover:scale-110 transition-transform"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
