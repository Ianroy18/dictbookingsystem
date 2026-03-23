import React, { useState } from 'react';

interface ProfileProps {
    currentUser: any;
    setCurrentUser: (user: any) => void;
}

export default function Profile({ currentUser }: ProfileProps) {
    const [formData, setFormData] = useState<any>({
        email: currentUser.email,
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!"); return;
        }

        try {
            const res = await fetch(`http://localhost:8000/users/${currentUser.id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: formData.password })
            });
            if (res.ok) {
                alert("Password updated successfully!");
                setFormData({ ...formData, password: '', confirmPassword: '' });
            }
        } catch (e) { alert("Failed to update password."); }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Security Credentials</h2>
                <p className="text-slate-500 mt-1">Manage your administrative access and identifier.</p>
            </header>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex items-center space-x-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl">
                        <i className="fas fa-user-shield"></i>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Authority</p>
                        <p className="text-xl font-bold text-slate-900">{currentUser.email}</p>
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest mt-1 inline-block">{currentUser.role}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Update Security Key (Password)</label>
                        <input type="password" required className="w-full border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm New Security Key</label>
                        <input type="password" required className="w-full border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm shadow-xl transition-all hover:bg-black active:scale-95">Update Access Key</button>
                </form>
            </div>
        </div>
    );
}
