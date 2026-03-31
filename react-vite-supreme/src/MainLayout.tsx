import { Outlet } from 'react-router-dom';
import { useAuth } from './screens/auth/AuthContext';
// import { useBooking } from './contexts/BookingContext'; // Commented out as BookingContext doesn't exist in March 24 version
import Sidebar from './screens/shared/Sidebar';
import Loader from './components/loader/loader';
import ChatBox from './screens/shared/ChatBox';

export default function MainLayout() {
    const { user } = useAuth();
    // const { bookings, isLoading: bookingsLoading } = useBooking(); // Commented out missing context
    const bookings: any[] = [];
    const bookingsLoading = false;

    if (bookingsLoading) return <Loader />;

    const role = user?.role || 'requestor';
    const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {role !== 'requestor' && (
                <Sidebar

                    role={role}
                    notifCount={pendingCount}
                    currentUser={user}
                />
            )}

            <div className={`flex-1 flex flex-col min-w-0 ${role !== 'requestor' ? 'ml-80' : ''}`}>
                <main className="flex-1">
                    <Outlet />
                </main>
                {role !== 'requestor' && <ChatBox currentUser={user} />}
            </div>
        </div>
    );
}
