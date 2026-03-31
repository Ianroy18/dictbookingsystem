import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Plus, Building, MapPin, Navigation2, ChevronDown, Search, Edit3, Trash2, DoorOpen, Pen, X } from 'lucide-react';

interface Room {
    id: number;
    name: string;
    office: number;
}

interface Office {
    id: number;
    name: string;
    region: string;
    address: string;
    rooms: Room[];
}

interface OfficeManagementProps {
    currentUser?: any;
}

export default function OfficeManagement({ currentUser }: OfficeManagementProps) {
    const [offices, setOffices] = useState<Office[]>([]);
    const [newOffice, setNewOffice] = useState({ name: '', region: '', address: '' });
    const [newRoom, setNewRoom] = useState<{ [key: number]: string }>({});
    const [editingOffice, setEditingOffice] = useState<number | null>(null);
    const [editOfficeData, setEditOfficeData] = useState({ name: '', region: '', address: '' });
    const [editingRoom, setEditingRoom] = useState<number | null>(null);
    const [editRoomName, setEditRoomName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ show: boolean, id: number | null, type: 'office' | 'room', name: string }>({ show: false, id: null, type: 'office', name: '' });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRegions, setExpandedRegions] = useState<string[]>([]);
    const [expandedOffices, setExpandedOffices] = useState<number[]>([]);

    const isSuperAdmin = currentUser?.role === 'super-admin';
    const isAdmin = currentUser?.role === 'admin';
    const canManageOffices = isSuperAdmin || isAdmin;

    // Filtered offices to display
    const visibleOffices = offices.filter(o => {
        if (isSuperAdmin) return true;

        let matchesRegion = true;
        let matchesOffice = true;

        if (currentUser?.assignedRegion && currentUser.assignedRegion !== 'All') {
            matchesRegion = o.region === currentUser.assignedRegion;
        }
        
        // Admins can see all offices in their region for management purposes
        if (isAdmin) {
            matchesOffice = true; 
        } else if (currentUser?.assignedOffice && currentUser.assignedOffice !== 'All') {
            matchesOffice = o.name === currentUser.assignedOffice;
        }

        return matchesRegion && matchesOffice;
    });

    const groupedOffices = React.useMemo(() => {
        const map = new Map<string, Office[]>();
        for (const o of visibleOffices) {
            const r = o.region || 'Unassigned Region';
            if (!map.has(r)) map.set(r, []);
            map.get(r)!.push(o);
        }
        return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [visibleOffices]);

    const filteredGroups = React.useMemo(() => {
        if (!searchTerm) return groupedOffices;
        const term = searchTerm.toLowerCase();
        
        return groupedOffices.map(([region, officesList]) => {
            if (region.toLowerCase().includes(term)) {
                return [region, officesList] as [string, Office[]];
            }
            const matchingOffices = officesList.filter(o => o.name.toLowerCase().includes(term));
            return [region, matchingOffices] as [string, Office[]];
        }).filter(([_, officesList]) => officesList.length > 0);
    }, [groupedOffices, searchTerm]);

    const toggleRegion = (region: string) => {
        setExpandedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]);
    };

    const toggleOffice = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setExpandedOffices(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    useEffect(() => {
        fetchOffices();
        if (isAdmin && currentUser?.assignedRegion && currentUser.assignedRegion !== 'All') {
            setNewOffice(prev => ({ ...prev, region: currentUser.assignedRegion }));
        }
    }, [isAdmin, currentUser]);

    const fetchOffices = async () => {
        const res = await fetch('http://192.168.18.155:8000/offices/');
        const data = await res.json();
        setOffices(data);
    };

    const handleAddOffice = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('http://192.168.18.155:8000/offices/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOffice)
            });
            if (res.ok) {
                setSuccessMessage('Office registered successfully.');
                setShowSuccess(true);
                setNewOffice(prev => ({ ...prev, name: '', address: '' })); // Keep region for admins
                await fetchOffices();
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Save Office Error:", errorData);
                alert("Failed to save office: " + (errorData.detail || "Server error. Check if all fields are valid."));
            }
        } catch (err) {
            console.error("Network Error:", err);
            alert("Network error. Please check if the server is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteOffice = async (id: number) => {
        setIsLoading(true);
        try {
            await fetch(`http://192.168.18.155:8000/offices/${id}/`, { method: 'DELETE' });
            setSuccessMessage('Office and associated rooms removed.');
            setShowSuccess(true);
            await fetchOffices();
            setDeleteModal({ ...deleteModal, show: false });
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (e) {
            console.error("Delete Office Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateOffice = async (id: number) => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://192.168.18.155:8000/offices/${id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editOfficeData)
            });
            if (res.ok) {
                setSuccessMessage('Office details updated.');
                setShowSuccess(true);
                setEditingOffice(null);
                await fetchOffices();
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (e) {
            console.error("Update Office Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddRoom = async (officeId: number) => {
        const roomName = newRoom[officeId];
        if (!roomName) return;

        setIsLoading(true);
        try {
            const res = await fetch('http://192.168.18.155:8000/rooms/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: roomName, office: officeId })
            });
            if (res.ok) {
                setSuccessMessage('Room added successfully.');
                setShowSuccess(true);
                setNewRoom({ ...newRoom, [officeId]: '' });
                await fetchOffices();
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (e) {
            console.error("Add Room Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRoom = async (roomId: number) => {
        setIsLoading(true);
        try {
            await fetch(`http://192.168.18.155:8000/rooms/${roomId}/`, { method: 'DELETE' });
            setSuccessMessage('Room removed successfully.');
            setShowSuccess(true);
            await fetchOffices();
            setDeleteModal({ ...deleteModal, show: false });
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (e) {
            console.error("Delete Room Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateRoom = async (roomId: number, officeId: number) => {
        if (!editRoomName) return;
        setIsLoading(true);
        try {
            const res = await fetch(`http://192.168.18.155:8000/rooms/${roomId}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editRoomName, office: officeId })
            });
            if (res.ok) {
                setSuccessMessage('Room name updated.');
                setShowSuccess(true);
                setEditingRoom(null);
                await fetchOffices();
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (e) {
            console.error("Update Room Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
            {/* Custom Deletion Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in zoom-in duration-300">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 border border-rose-100 dark:border-rose-800/50">
                                <AlertTriangle className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Confirm Removal</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm px-4">
                                {deleteModal.type === 'office' 
                                    ? `Are you sure you want to delete this office? All associated rooms will also be removed.` 
                                    : `Are you sure you want to remove the room "${deleteModal.name}"?`}
                            </p>
                        </div>
                        <div className="p-8 bg-slate-50/50 dark:bg-slate-900/30 flex gap-4">
                            <button 
                                onClick={() => setDeleteModal({ show: false, id: null, type: 'office', name: '' })} 
                                className="flex-1 py-4 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-[10px] border border-slate-200 dark:border-slate-600"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => deleteModal.type === 'office' ? handleDeleteOffice(deleteModal.id!) : handleDeleteRoom(deleteModal.id!)}
                                className="flex-1 py-4 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-600 shadow-xl shadow-rose-200 dark:shadow-none transition-all uppercase tracking-widest text-[10px]"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Modal */}
            {isLoading && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-widest">Processing Transaction...</p>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-8 right-8 z-[110] animate-in slide-in-from-right-full duration-500">
                    <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-emerald-200 dark:shadow-none flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5" />
                        <div>
                            <p className="font-black text-xs uppercase tracking-widest leading-none">Operation Successful</p>
                            <p className="text-[10px] opacity-80 font-bold mt-1 uppercase tracking-tighter">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}
            <header>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Office & Facilities</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Configure regional hubs and available venue spaces.</p>
            </header>

            {canManageOffices && (
                <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-none animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
                            <Plus className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">Add New Office</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Regional Workspace Registration</p>
                        </div>
                    </div>
                    <form onSubmit={handleAddOffice} className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-2">Office Name</label>
                            <div className="relative group">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
                                <input type="text" required placeholder="e.g. DICT Region 10" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 font-bold text-sm text-slate-900 dark:text-white transition-all" value={newOffice.name} onChange={(e) => setNewOffice({ ...newOffice, name: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-2">Region</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. Region X" 
                                    className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 font-bold text-sm text-slate-900 dark:text-white transition-all ${isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`} 
                                    value={newOffice.region} 
                                    readOnly={isAdmin}
                                    onChange={(e) => !isAdmin && setNewOffice({ ...newOffice, region: e.target.value })} 
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-2">Full Address</label>
                            <div className="relative group">
                                <Navigation2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
                                <input type="text" required placeholder="Full location details..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-11 pr-4 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 font-bold text-sm text-slate-900 dark:text-white transition-all" value={newOffice.address} onChange={(e) => setNewOffice({ ...newOffice, address: e.target.value })} />
                            </div>
                        </div>
                        <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                            Add Office <Plus className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative group mb-8">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors text-lg" />
                <input 
                    type="text" 
                    placeholder="Search by Region or Office Name..." 
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 pl-14 pr-6 py-5 rounded-[2rem] outline-none focus:border-blue-500 dark:focus:border-blue-400 font-bold text-slate-700 dark:text-white shadow-sm transition-all"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-6">
                {filteredGroups.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4 mx-auto" />
                        <p className="text-slate-500 dark:text-slate-400 font-bold">No regions or offices found matching your search.</p>
                    </div>
                )}
                
                {filteredGroups.map(([region, officesList]) => (
                    <div key={region} className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-300">
                        {/* Region Header */}
                        <div 
                            className="p-8 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group"
                            onClick={() => toggleRegion(region)}
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Geographic Region</p>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{region}</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="bg-slate-100 dark:bg-slate-700 px-4 py-1.5 rounded-full text-xs font-bold text-slate-500 dark:text-slate-300">
                                    {officesList.length} Office{officesList.length !== 1 ? 's' : ''}
                                </span>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 transition-all ${expandedRegions.includes(region) ? 'rotate-180 bg-indigo-100 text-indigo-600' : ''}`}>
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Offices List inside Region */}
                        {expandedRegions.includes(region) && (
                            <div className="p-8 pt-0 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/50">
                                <div className="mt-8 space-y-4">
                                    {officesList.map((office) => (
                                        <div key={office.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                            
                                            {/* Office Header */}
                                            <div 
                                                className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                                                onClick={(e) => toggleOffice(e, office.id)}
                                            >
                                                {editingOffice === office.id ? (
                                                    <div className="flex-1 grid grid-cols-1 gap-4" onClick={e => e.stopPropagation()}>
                                                        <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 p-3 rounded-xl text-sm font-bold shadow-inner" value={editOfficeData.name} onChange={e => setEditOfficeData({ ...editOfficeData, name: e.target.value })} placeholder="Office Name" />
                                                        <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 p-3 rounded-xl text-sm font-bold shadow-inner" value={editOfficeData.region} onChange={e => setEditOfficeData({ ...editOfficeData, region: e.target.value })} placeholder="Region" />
                                                        <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 p-3 rounded-xl text-sm font-bold shadow-inner" value={editOfficeData.address} onChange={e => setEditOfficeData({ ...editOfficeData, address: e.target.value })} placeholder="Full Address" />
                                                        <div className="flex gap-3 mt-2">
                                                            <button onClick={() => handleUpdateOffice(office.id)} className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black shadow-lg shadow-emerald-200 hover:scale-[1.02] active:scale-95 transition-all">Save Changes</button>
                                                            <button onClick={() => setEditingOffice(null)} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-slate-300 transition-colors">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-5">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg transition-all ${expandedOffices.includes(office.id) ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 group-hover:bg-blue-100'}`}>
                                                                <Building className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-slate-800 dark:text-white text-lg uppercase tracking-tighter leading-none mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{office.name}</h4>
                                                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest"><MapPin className="w-3 h-3 inline-block mr-2" /> {office.address || "No precise address"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 hidden sm:block">
                                                                {office.rooms?.length || 0} Room{office.rooms?.length !== 1 ? 's' : ''}
                                                            </span>
                                                            {canManageOffices && (
                                                                <div className="flex gap-2 mr-4" onClick={e => e.stopPropagation()}>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingOffice(office.id);
                                                                            setEditOfficeData({ name: office.name, region: office.region, address: office.address });
                                                                            if (!expandedOffices.includes(office.id)) setExpandedOffices([...expandedOffices, office.id]);
                                                                        }}
                                                                        className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                                        title="Edit Office"
                                                                    >
                                                                        <Edit3 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDeleteModal({ show: true, id: office.id, type: 'office', name: office.name })}
                                                                        className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                                        title="Delete Office"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-slate-300 transition-transform ${expandedOffices.includes(office.id) ? 'rotate-180 text-blue-500' : ''}`}>
                                                                <ChevronDown className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Rooms List inside Office */}
                                            {expandedOffices.includes(office.id) && !editingOffice && (
                                                <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <DoorOpen className="w-3.5 h-3.5 text-blue-500" /> Local Facilities ({office.rooms?.length || 0})
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                                        {office.rooms && office.rooms.length > 0 ? office.rooms.map(room => (
                                                            <div key={room.id} className="flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl hover:border-blue-300 dark:hover:border-blue-600 transition-all shadow-sm">
                                                                {editingRoom === room.id ? (
                                                                    <div className="flex gap-2 w-full">
                                                                        <input
                                                                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 px-3 py-2 rounded-xl text-xs font-bold"
                                                                            value={editRoomName}
                                                                            onChange={e => setEditRoomName(e.target.value)}
                                                                            autoFocus
                                                                        />
                                                                        <button onClick={() => handleUpdateRoom(room.id, office.id)} className="text-emerald-500 bg-emerald-50 w-8 flex items-center justify-center rounded-lg hover:scale-105 transition-all"><CheckCircle2 className="w-4 h-4" /></button>
                                                                        <button onClick={() => setEditingRoom(null)} className="text-slate-400 bg-slate-100 w-8 flex items-center justify-center rounded-lg hover:scale-105 transition-all"><X className="w-4 h-4" /></button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center justify-between w-full">
                                                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-3">
                                                                            <Building className="w-4 h-4 text-slate-300 dark:text-slate-600" /> {room.name}
                                                                        </span>
                                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingRoom(room.id);
                                                                                    setEditRoomName(room.name);
                                                                                }}
                                                                                className="w-7 h-7 flex items-center justify-center bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                                title="Edit Room"
                                                                            >
                                                                                <Pen className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setDeleteModal({ show: true, id: room.id, type: 'room', name: room.name })}
                                                                                className="w-7 h-7 flex items-center justify-center bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                                                title="Delete Room"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )) : (
                                                            <div className="col-span-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center">
                                                                <p className="text-xs text-slate-400 uppercase tracking-widest font-black italic">No rooms registered here yet.</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {canManageOffices && (
                                                        <div className="flex gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-[1.5rem]">
                                                            <input
                                                                type="text"
                                                                placeholder="Add facility (e.g. Lab 1)..."
                                                                className="flex-1 bg-transparent px-4 py-2 outline-none text-sm font-bold text-slate-900 dark:text-white"
                                                                value={newRoom[office.id] || ''}
                                                                onChange={(e) => setNewRoom({ ...newRoom, [office.id]: e.target.value })}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleAddRoom(office.id)}
                                                            />
                                                            <button 
                                                                onClick={() => handleAddRoom(office.id)} 
                                                                disabled={!newRoom[office.id]}
                                                                className="bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md transition-all active:scale-95 flex items-center gap-2"
                                                            >
                                                                Add <Plus className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
