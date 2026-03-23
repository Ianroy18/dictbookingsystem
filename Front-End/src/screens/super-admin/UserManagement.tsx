import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface UserManagementProps {
    offices: any[];
}

export default function UserManagement({ offices }: UserManagementProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<any>({
        email: '',
        password: '',
        role: 'admin',
        assignedRegion: 'All',
        assignedOffice: 'All'
    });

    useEffect(() => { fetchUsers(); }, []);
    const fetchUsers = async () => {
        const res = await fetch('http://localhost:8000/users/');
        setUsers(await res.json());
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await fetch('http://localhost:8000/users/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setShowModal(false); setFormData({ email: '', password: '', role: 'admin', assignedRegion: 'All', assignedOffice: 'All' }); fetchUsers();
    };

    const handleDelete = async (id: string | number) => {
        if (window.confirm("Are you sure you want to revoke this agent's security clearance?")) {
            await fetch(`http://localhost:8000/users/${id}/`, { method: 'DELETE' });
            fetchUsers();
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Personnel Registry</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage system access authorities and regional assignments.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-200 dark:shadow-none">
                    <i className="fas fa-user-plus text-sm"></i> Onboard Personnel
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {users.map((u: any) => (
                    <div key={u.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl p-10 group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-900">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-bl-[5rem] -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${u.role === 'super-admin' ? 'bg-slate-900 dark:bg-slate-950 text-white border-transparent' : 'bg-blue-600 text-white border-transparent'}`}>
                                    {u.role.replace('-', ' ')}
                                </span>
                                {u.role !== 'super-admin' && (
                                    <button onClick={() => handleDelete(u.id)} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-rose-500 rounded-2xl transition-all border border-slate-100 dark:border-slate-700">
                                        <i className="fas fa-user-minus text-sm"></i>
                                    </button>
                                )}
                            </div>

                            <div className="space-y-8 flex-1">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Identity Baseline</p>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white truncate tracking-tight">{u.email}</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 transition-colors group-hover:border-blue-100 dark:group-hover:border-blue-900">
                                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">Office Unit</p>
                                        <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase truncate italic leading-none">{u.assignedOffice}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 transition-colors group-hover:border-blue-100 dark:group-hover:border-blue-900">
                                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">Regional Hub</p>
                                        <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase truncate italic leading-none">{u.assignedRegion}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 dark:bg-black/95 backdrop-blur-xl p-6">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-slate-200 dark:border-slate-700">
                        <div className="bg-white dark:bg-slate-800 p-10 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Onboard Personnel</h3>
                            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Initialize new system access credentials.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2">Email Identity</label>
                                    <input type="email" required placeholder="e.g. personnel@dict.gov.ph" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 font-black text-sm text-slate-900 dark:text-white transition-all" value={formData.email} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2">Security Passphrase</label>
                                    <input type="password" required placeholder="Min 12 characters recommended" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 font-black text-sm text-slate-900 dark:text-white transition-all" value={formData.password} onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2">Clearance Level</label>
                                        <select required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 font-black text-[10px] text-slate-900 dark:text-white transition-all appearance-none uppercase tracking-widest" value={formData.role} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, role: e.target.value })}>
                                            <option value="admin">Administrator</option>
                                            <option value="super-admin">Super Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2">Assigned Sector</label>
                                        <select required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 font-black text-[10px] text-slate-900 dark:text-white transition-all appearance-none uppercase tracking-widest" value={formData.assignedRegion} onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, assignedRegion: e.target.value })}>
                                            <option value="All">Global Access</option>
                                            {Array.from(new Set(offices.map(o => o.region))).map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-6 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-5 font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">Abort</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">Enable Access</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
