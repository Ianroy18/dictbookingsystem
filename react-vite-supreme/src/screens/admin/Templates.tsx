import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import Loader from '@/components/loader/loader';
import SlideUp from '@/components/animation/revealUp';
import { Mail, FileText, Save, Loader2, Eye, X, Sparkles } from 'lucide-react';

export default function TemplateBuilder() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { fetchTemplates(); }, []);
    const fetchTemplates = async () => {
        try {
            const res = await axios.get('http://192.168.18.155:8000/templates/');
            setTemplates(res.data);
        } catch (error) {
            console.error('Error loading templates:', error);
            Swal.fire('Load Error', 'Could not load templates. Please refresh.', 'error');
        }
    };

    const handleSave = async () => {
        if (!selectedTemplate) return;
        setIsSaving(true);
        try {
            const res = await axios.patch(`http://192.168.18.155:8000/templates/${selectedTemplate.id}/`, selectedTemplate, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.status >= 200 && res.status < 300) {
                await fetchTemplates();
                Swal.fire('Saved', 'Template successfully updated.', 'success');
            } else {
                throw new Error('Failed to save template');
            }
        } catch (error) {
            console.error('Template Save Error', error);
            Swal.fire('Save Error', 'Could not save template. Please try again.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="relative p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {isSaving && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center">
                    <Loader />
                    <div className="absolute inset-0 bg-slate-950/75" />
                    <div className="relative z-10 flex flex-col items-center gap-4 rounded-[2.5rem] bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-2xl p-8">
                        <span className="text-slate-900 dark:text-white text-sm font-black uppercase tracking-[0.3em]">Saving protocol...</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs">Please wait while the template updates.</span>
                    </div>
                </div>
            )}

            <header className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-100 dark:bg-slate-800 px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700 animate-in slide-in-from-left-4 duration-300">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-600 dark:text-slate-300">Admin email templates</span>
                </div>
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Protocol Templates</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Standardize automated communication for all mission phases.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="space-y-4">
                    {templates.map(t => (
                        <button key={t.id} onClick={() => { setSelectedTemplate(t); setPreviewOpen(true); }} className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${selectedTemplate?.id === t.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20 scale-[1.01]' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:-translate-y-0.5'}`}>
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <span className="text-lg"><FileText className={selectedTemplate?.id === t.id ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-500 dark:text-slate-300'} /></span>
                                <span className={`inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-black ${selectedTemplate?.id === t.id ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}><Eye className="w-3 h-3" /> Preview</span>
                            </div>
                            <p className="font-black text-sm tracking-tight uppercase mb-1">{t.name}</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${selectedTemplate?.id === t.id ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>ID: {t.id}</p>
                        </button>
                    ))}
                </div>

                <div className="lg:col-span-3 space-y-6">
                    {selectedTemplate ? (
                        <SlideUp width="100%">
                            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl p-10 space-y-8">
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-4 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                <Sparkles className="w-4 h-4" />
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
                                <Button type="button" onClick={handleSave} disabled={isSaving} className="w-full uppercase tracking-widest justify-center gap-2 text-[10px] py-5 rounded-2xl">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {isSaving ? 'Saving...' : 'Save Protocol'}
                                </Button>
                            </div>
                        </div>
                        </SlideUp>
                    ) : (
                        <div className="h-[500px] bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-700 space-y-4">
                            <Sparkles className="w-14 h-14 opacity-20" />
                            <p className="font-black uppercase tracking-widest text-[10px]">Select a protocol to edit.</p>
                        </div>
                    )}
                </div>
            </div>

            {previewOpen && selectedTemplate && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 p-6">
                    <div className="relative w-full max-w-3xl rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between gap-3 p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Preview: {selectedTemplate.name}</h3>
                                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Template body preview</p>
                                </div>
                            </div>
                            <button onClick={() => setPreviewOpen(false)} className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-6">
                                <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 mb-3">Subject</h4>
                                <p className="text-base text-slate-800 dark:text-slate-100">{selectedTemplate.subject}</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                                <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 mb-3">Message Body</h4>
                                <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">{selectedTemplate.body}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
