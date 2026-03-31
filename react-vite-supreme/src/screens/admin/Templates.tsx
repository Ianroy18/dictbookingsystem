import { useState, useEffect } from 'react';

export default function TemplateBuilder() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

    useEffect(() => { fetchTemplates(); }, []);
    const fetchTemplates = async () => {
        const res = await fetch('http://192.168.18.155:8000/templates/');
        setTemplates(await res.json());
    };

    const handleSave = async () => {
        if (!selectedTemplate) return;
        await fetch(`http://192.168.18.155:8000/templates/${selectedTemplate.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedTemplate)
        });
        alert("Template Dispatched and Saved!"); fetchTemplates();
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Protocol Templates</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Standardize automated communication for all mission phases.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="space-y-4">
                    {templates.map(t => (
                        <button key={t.id} onClick={() => setSelectedTemplate(t)} className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${selectedTemplate?.id === t.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                            <p className="font-black text-sm tracking-tight uppercase mb-1">{t.name}</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${selectedTemplate?.id === t.id ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>ID: {t.id}</p>
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-3 space-y-6">
                    {selectedTemplate ? (
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-4 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                <i className="fas fa-magic text-sm"></i> 
                                <span>Injectable Tags: {'{requestor}, {venue}, {date}, {id}, {remarks}'}</span>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2">Broadcast Subject</label>
                                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 font-black text-sm text-slate-900 dark:text-white transition-all" value={selectedTemplate.subject} onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2">Message Body (HTML Supported)</label>
                                    <textarea rows={12} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 font-bold text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-mono" value={selectedTemplate.body} onChange={(e) => setSelectedTemplate({ ...selectedTemplate, body: e.target.value })} />
                                </div>
                                <button onClick={handleSave} className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all">Save Protocol</button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[500px] bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-700 space-y-4">
                            <i className="fas fa-edit text-5xl opacity-20"></i>
                            <p className="font-black uppercase tracking-widest text-[10px]">Select a protocol to edit.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
