import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import Swal from 'sweetalert2';

import Dashboard from './screens/requestor/Dashboard';
import NewBooking from './screens/requestor/NewBooking';
import TrackRequests from './screens/requestor/TrackRequests';

import ReviewRequests from './screens/admin/ReviewRequests';
import Inventory from './screens/admin/Inventory';
import Reports from './screens/admin/Reports';
import Templates from './screens/admin/Templates';

import UserManagement from './screens/super-admin/UserManagement';
import SuperAdminDashboard from './screens/super-admin/SuperAdminDashboard';
import OfficeManagement from './screens/admin/OfficeManagement';
import AdminDashboard from './screens/admin/AdminDashboard';

import Login from './screens/shared/Login';
import Profile from './screens/shared/Profile';
import ChatBox from './screens/shared/ChatBox';
import Sidebar from './screens/shared/Sidebar';

function App() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const userRole = currentUser ? currentUser.role : 'requestor';
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [prefilledData, setPrefilledData] = useState<any>(null);
    const [currentView, setCurrentView] = useState('dashboard');
    const [bookings, setBookings] = useState<any[]>([]);
    const [offices, setOffices] = useState<any[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark';
    });

    const [emailTemplates, setEmailTemplates] = useState<any[]>([]);

    useEffect(() => {
        fetch('http://localhost:8000/bookings/')
            .then(res => res.json())
            .then(data => setBookings(data))
            .catch(err => console.error("Error fetching bookings:", err));

        fetch('http://localhost:8000/offices/')
            .then(res => res.json())
            .then(data => setOffices(data))
            .catch(err => console.error("Error fetching offices:", err));

        fetch('http://localhost:8000/templates/')
            .then(res => res.json())
            .then(data => setEmailTemplates(data))
            .catch(err => console.error("Error fetching templates:", err));

        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }

        const path = window.location.pathname.toLowerCase();
        if (path === '/admin' || path === '/superadmin') {
            setShowAdminLogin(true);
            window.history.replaceState({}, document.title, '/');
        }

        const params = new URLSearchParams(window.location.search);
        if (params.has('admin')) {
            setShowAdminLogin(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const sendNotifications = async (booking: any, status: string) => {
        let templateId = '';
        if (status === 'APPROVED') templateId = 'approval';
        else if (status === 'REJECTED') templateId = 'rejection';
        else if (status === 'CANCELLED') templateId = 'rejection';
        else if (status === 'PENDING') templateId = 'notification_to_approver';

        const template = emailTemplates.find(t => t.id === templateId);
        if (!template) {
            console.warn(`No template found for status: ${status}`);
            return;
        }

        const office = offices.find(o => o.name?.toLowerCase() === booking.venue?.toLowerCase());
        const regionText = office ? ` (${office.region})` : '';
        const fullVenue = booking.venue + regionText;

        const equipmentText = booking.selectedEquipment && booking.selectedEquipment.length > 0
            ? booking.selectedEquipment.map((e: any) => `${e.name} (x${e.requestedQty})`).join(', ')
            : 'None';

        const replacements: any = {
            '{requestor}': booking.requestor,
            '{venue}': fullVenue,
            '{date}': booking.date,
            '{id}': booking.id,
            '{equipment}': equipmentText,
            '{remarks}': booking.remarks || 'No additional remarks.'
        };

        let subject = template.subject;
        let body = template.body;

        Object.keys(replacements).forEach(key => {
            subject = subject.replaceAll(key, replacements[key]);
            body = body.replaceAll(key, replacements[key]);
        });

        let recipients = [{ email: booking.email, name: booking.requestor }];

        if (status === 'PENDING') {
            try {
                const res = await fetch('http://localhost:8000/users/');
                const users = await res.json();
                const isMatch = (s1?: string, s2?: string) => {
                    if (!s1 || !s2) return false;
                    const a = s1.toLowerCase().trim();
                    const b = s2.toLowerCase().trim();
                    return a.includes(b) || b.includes(a);
                };
                const approvers = users.filter((u: any) => {
                    if (u.role?.toLowerCase().includes('super')) return true;
                    if (u.role === 'admin') {
                        let isAllowed = false;
                        if (!u.assignedRegion || u.assignedRegion === 'All') {
                            isAllowed = true;
                            if (u.assignedOffice && u.assignedOffice !== 'All' && !isMatch(booking.venue, u.assignedOffice)) {
                                isAllowed = false;
                            }
                        } else {
                            const regionMatch = isMatch(office?.region, u.assignedRegion) || isMatch(booking.venue, u.assignedRegion);
                            if (regionMatch) {
                                isAllowed = true;
                            } else if (u.assignedOffice && u.assignedOffice !== 'All' && isMatch(booking.venue, u.assignedOffice)) {
                                isAllowed = true;
                            }
                        }
                        return isAllowed;
                    }
                    return false;
                });
                if (approvers.length > 0) {
                    const approverRecipients = approvers.map((a: any) => ({ email: a.email, name: 'Approver' }));
                    recipients = [...recipients, ...approverRecipients];
                }
            } catch (e) {
                console.error("Failed to fetch approvers", e);
            }
        }

        recipients.forEach(recipient => {
            const emailParams = {
                to_name: recipient.name,
                to_email: recipient.email,
                subject: subject,
                message: body,
                date: booking.date,
                venue: fullVenue,
                status: status
            };

            emailjs.send('service_mkbxoon', 'template_ri9jxg9', emailParams, '7xqnV-UNwj1xWOW0u')
                .then(() => {
                    console.log(`Email notification (${status}) sent successfully to ${recipient.email}!`);
                })
                .catch(err => console.error("EmailJS Error:", err));
        });

        if ("Notification" in window && Notification.permission === "granted") {
            let notifBody = `Booking Status Update: Your reservation for ${booking.venue} has been ${status}.`;
            if (status === 'PENDING') {
                notifBody = `Booking Submitted: Your request for ${booking.venue} has been sent for approval.`;
            }
            new Notification("DICT Booking System", {
                body: notifBody,
                icon: "/dict.png",
                tag: booking.id
            });
        }
    };

    const handleUpdateStatus = async (id: string | number, newStatus: string, remarks?: string) => {
        const bookingToUpdate = bookings.find(b => b.id === id);
        if (!bookingToUpdate) return;

        const updatePayload: any = { status: newStatus };
        if (remarks !== undefined) updatePayload.remarks = remarks;

        try {
            const response = await fetch(`http://localhost:8000/bookings/${id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload)
            });

            if (response.ok) {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updatePayload } : b));
                sendNotifications(bookingToUpdate, newStatus);
            }
        } catch (error) {
            console.error("Update Error:", error);
        }
    };

    const handleDeleteBooking = async (id: string | number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this deletion!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        Swal.fire({ title: 'Deleting...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

        try {
            const response = await fetch(`http://localhost:8000/bookings/${id}/`, {
                method: 'DELETE',
            });

            if (response.ok || response.status === 404) {
                setBookings(prev => prev.filter(b => b.id !== id));
                Swal.fire('Deleted!', 'The booking has been successfully removed.', 'success');
            } else {
                Swal.fire('Error!', 'Failed to delete the booking.', 'error');
            }
        } catch (error) {
            console.error("Delete Error:", error);
            Swal.fire('Error!', 'Network error occurred while trying to delete.', 'error');
        }
    };

    const handleBulkDeleteBookings = async (ids: (string | number)[]) => {
        const result = await Swal.fire({
            title: 'Delete Selected?',
            text: `You are about to delete ${ids.length} records permanently!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete all!'
        });

        if (!result.isConfirmed) return;

        Swal.fire({ title: 'Deleting Records...', text: 'Please wait, this might take a moment.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

        try {
            // Delete sequentially to avoid SQLite locks or network flood
            const failedIds: (string | number)[] = [];
            for (const id of ids) {
                try {
                    const res = await fetch(`http://localhost:8000/bookings/${id}/`, { method: 'DELETE' });
                    if (!res.ok && res.status !== 404) {
                        failedIds.push(id);
                    }
                } catch (e) {
                    failedIds.push(id);
                }
            }
            
            const successfulIds = ids.filter(id => !failedIds.includes(id));
            setBookings(prev => prev.filter(b => !successfulIds.includes(b.id)));

            if (failedIds.length > 0) {
                Swal.fire('Partial Deletion', `Successfully deleted ${successfulIds.length} records. Failed to delete ${failedIds.length} records.`, 'warning');
            } else {
                Swal.fire('Deleted!', 'All selected bookings have been removed.', 'success');
            }
        } catch (error) {
            console.error("Bulk Delete Error:", error);
            Swal.fire('Error!', 'An unexpected error occurred during bulk deletion.', 'error');
        }
    };

    const getFilteredPendingCount = () => {
        if (!currentUser || userRole === 'requestor') return 0;
        const pendingBookings = bookings.filter(b => b.status?.toUpperCase() === 'PENDING');
        if (userRole?.toLowerCase().includes('super')) return pendingBookings.length;
        return pendingBookings.filter(b => {
            const isMatch = (s1?: string, s2?: string) => {
                if (!s1 || !s2) return false;
                const a = s1.toLowerCase().trim();
                const b = s2.toLowerCase().trim();
                return a.includes(b) || b.includes(a);
            };
            const bookingOffice = offices.find(o => isMatch(o.name, b.venue));
            const itemRegion = b.region || bookingOffice?.region;
            
            let isAllowed = false;
            
            if (!currentUser.assignedRegion || currentUser.assignedRegion === 'All') {
                isAllowed = true;
                if (currentUser.assignedOffice && currentUser.assignedOffice !== 'All' && !isMatch(b.venue, currentUser.assignedOffice)) {
                    isAllowed = false;
                }
            } else {
                const regionMatch = isMatch(itemRegion, currentUser.assignedRegion) || isMatch(b.venue, currentUser.assignedRegion);
                if (regionMatch) {
                    isAllowed = true;
                } else if (currentUser.assignedOffice && currentUser.assignedOffice !== 'All' && isMatch(b.venue, currentUser.assignedOffice)) {
                    isAllowed = true;
                }
            }
            return isAllowed;
        }).length;
    };

    const pendingCount = getFilteredPendingCount();

    const handleAdminLoginSuccess = (user: any) => {
        setCurrentUser(user);
        setShowAdminLogin(false);
        setCurrentView('dashboard');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentView('dashboard');
        setShowAdminLogin(true);
    };

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    return (
        <div className={`flex min-h-screen transition-colors duration-300 font-sans`}>
            <div className="flex-1 flex bg-white dark:bg-slate-900 w-full relative">
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="fixed bottom-6 right-6 w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center z-50 text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all group"
                    title="Toggle Theme"
                >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-sm`}></i>
                    </div>
                </button>
                {showAdminLogin && (
                    <Login onLogin={handleAdminLoginSuccess} onCancel={() => setShowAdminLogin(false)} />
                )}

                {!showAdminLogin && (
                    <div className="flex-1 flex flex-col min-h-screen">
                        {/* Simple Navigation for Guest/Requestor */}
                        {userRole === 'requestor' && (
                            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex justify-between items-center z-30 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-50/50 dark:bg-slate-800 p-2 rounded-xl">
                                        <img src="/dict.png" alt="DICT" className="h-10 w-10 object-contain drop-shadow-sm" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-extrabold text-slate-800 dark:text-white tracking-tight text-lg">DICT Facility Booking</span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">Public Request Portal</span>
                                    </div>
                                </div>
                            </header>
                        )}

                        <div className="flex flex-1 relative">
                            {userRole !== 'requestor' && (
                                <Sidebar
                                    setView={setCurrentView}
                                    currentView={currentView}
                                    onLogoutClick={handleLogout}
                                    role={userRole}
                                    notifCount={pendingCount}
                                    currentUser={currentUser}
                                />
                            )}

                        <main className={`flex-1 transition-all duration-300 ${(userRole !== 'requestor' && currentUser) ? 'ml-80' : 'ml-0'}`}>
                            {currentView === 'dashboard' && (
                                <>
                                    {userRole === 'requestor' && (
                                        <Dashboard
                                            bookings={bookings}
                                            setView={setCurrentView}
                                            offices={offices}
                                            setPrefilledData={setPrefilledData}
                                        />
                                    )}
                                    {userRole === 'admin' && (
                                        <AdminDashboard
                                            bookings={bookings}
                                            currentUser={currentUser}
                                            offices={offices}
                                        />
                                    )}
                                    {userRole === 'super-admin' && (
                                        <SuperAdminDashboard
                                            bookings={bookings}
                                        />
                                    )}
                                </>
                            )}
                            {currentView === 'new-booking' && (
                                <NewBooking
                                    offices={offices}
                                    prefilledData={prefilledData}
                                    onAdd={(newEntry) => {
                                        if (newEntry) {
                                            setBookings(prev => [...prev, newEntry]);
                                            sendNotifications(newEntry, 'PENDING');
                                        }
                                        setCurrentView('dashboard');
                                        setPrefilledData(null);
                                    }}
                                    onCancel={() => {
                                        setCurrentView('dashboard');
                                        setPrefilledData(null);
                                    }}
                                />
                            )}
                            {currentView === 'track-requests' && (
                                <TrackRequests
                                    bookings={bookings}
                                    onUpdateStatus={handleUpdateStatus}
                                    onDeleteBooking={handleDeleteBooking}
                                    onBulkDeleteBookings={handleBulkDeleteBookings}
                                    currentUser={currentUser}
                                    offices={offices}
                                />
                            )}
                            {(currentView === 'manage-bookings' || currentView === 'requests') && (
                                <ReviewRequests
                                    bookings={bookings}
                                    offices={offices}
                                    currentUser={currentUser}
                                    onUpdateStatus={handleUpdateStatus}
                                    onDeleteBooking={handleDeleteBooking}
                                />
                            )}
                            {currentView === 'inventory' && <Inventory currentUser={currentUser} offices={offices} />}
                            {currentView === 'templates' && (userRole === 'admin' || userRole === 'super-admin') && <Templates />}
                            {currentView === 'reports' && (userRole === 'admin' || userRole === 'super-admin') && <Reports bookings={bookings} offices={offices} currentUser={currentUser} />}
                            {currentView === 'offices' && (userRole === 'admin' || userRole === 'super-admin') && <OfficeManagement currentUser={currentUser} />}
                            {currentView === 'users' && userRole === 'super-admin' && <UserManagement offices={offices} />}
                            {currentView === 'profile' && <Profile currentUser={currentUser} setCurrentUser={setCurrentUser} />}
                        </main>
                            {userRole !== 'requestor' && <ChatBox currentUser={currentUser} />}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
