
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface UsageReportProps {
    bookings: any[];
    offices: any[];
    currentUser?: any;
}

export default function UsageReport({ bookings, offices, currentUser }: UsageReportProps) {
    const isSuperAdmin = currentUser?.role === 'super-admin';

    const filteredOffices = offices.filter(o => {
        if (isSuperAdmin) return true;
        let matchesRegion = true;
        let matchesOffice = true;
        if (currentUser?.assignedRegion && currentUser.assignedRegion !== 'All') {
            matchesRegion = o.region === currentUser.assignedRegion;
        }
        if (currentUser?.assignedOffice && currentUser.assignedOffice !== 'All') {
            matchesOffice = o.name === currentUser.assignedOffice;
        }
        return matchesRegion && matchesOffice;
    });

    const filteredBookings = bookings.filter(b => {
        if (isSuperAdmin) return true;
        const validOfficeNames = filteredOffices.map(o => o.name);
        return validOfficeNames.includes(b.venue);
    });

    const approvedBookings = filteredBookings.filter(b => b.status === 'APPROVED');

    const venueStats = filteredOffices.map(office => ({
        name: office.name,
        count: approvedBookings.filter(b => b.venue === office.name).length
    }));

    const exportPDF = () => {
        const input = document.getElementById('report-content');
        if (!input) return;
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`DICT_Usage_Report_${new Date().toLocaleDateString()}.pdf`);
        });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Usage Analysis</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Operational data and facility utilization metrics.</p>
                </div>
                <button onClick={exportPDF} className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-200 dark:shadow-none">
                    <i className="fas fa-file-pdf text-rose-500 dark:text-white"></i> Export Report
                </button>
            </header>

            <div id="report-content" className="space-y-10 bg-white dark:bg-slate-800 p-12 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-2xl transition-colors duration-300">
                <div className="flex items-center gap-8 border-b border-slate-100 dark:border-slate-700 pb-10">
                    <img src="/dict.png" alt="DICT" className="h-20 w-20" />
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">Facility Usage Analysis</h1>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Regional Operational Intelligence | Period Ending {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-500/20 group">
                        <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Total Requests</p>
                        <h3 className="text-5xl font-black tracking-tight group-hover:scale-105 transition-transform duration-300">{filteredBookings.length}</h3>
                    </div>
                    <div className="bg-slate-900 dark:bg-slate-950 rounded-[2rem] p-8 text-white shadow-xl shadow-black/20 group">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Active Missions</p>
                        <h3 className="text-5xl font-black tracking-tight group-hover:scale-105 transition-transform duration-300">{approvedBookings.length}</h3>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-8 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 group">
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Pending Review</p>
                        <h3 className="text-5xl font-black tracking-tight group-hover:scale-105 transition-transform duration-300">{filteredBookings.filter(b => b.status === 'PENDING').length}</h3>
                    </div>
                </div>

                <div className="space-y-8 pt-6">
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-2 flex items-center">
                        <i className="fas fa-chart-line mr-3 text-blue-500"></i> Venue Utilization Breakdown
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                        {venueStats.map(stat => (
                            <div key={stat.name} className="bg-slate-50/50 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 transition-all hover:border-blue-200 dark:hover:border-blue-900">
                                <div className="flex justify-between items-end mb-4">
                                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{stat.name}</span>
                                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 tracking-widest">{stat.count} BOOKINGS</span>
                                </div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-1 shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out" style={{ width: `${(stat.count / approvedBookings.length) * 100 || 0}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
