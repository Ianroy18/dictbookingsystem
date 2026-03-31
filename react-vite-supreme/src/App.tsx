import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Outlet } from "react-router-dom";
import { ModeToggle } from "./components/mode-toggle";

// @ts-ignore
const AppContext = createContext<any>(null);

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [offices, setOffices] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [bookingsRes, officesRes] = await Promise.all([
                    axios.get('http://192.168.18.155:8000/bookings/'),
                    axios.get('http://192.168.18.155:8000/offices/'),
                ]);
                setBookings(bookingsRes.data);
                setOffices(officesRes.data);
            } catch (err) {
                console.error("Error loading initial data:", err);
            }
        };

        loadData();

        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const handleUpdateStatus = async (id: string | number, newStatus: string, remarks?: string) => {
        const bookingToUpdate = bookings.find(b => b.id === id);
        if (!bookingToUpdate) return;

        const updatePayload: any = { status: newStatus };
        if (remarks !== undefined) updatePayload.remarks = remarks;

        try {
            const response = await axios.patch(`http://192.168.18.155:8000/bookings/${id}/`, updatePayload, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status >= 200 && response.status < 300) {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updatePayload } : b));
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
            const response = await axios.delete(`http://192.168.18.155:8000/bookings/${id}/`);

            if (response.status >= 200 && response.status < 300) {
                setBookings(prev => prev.filter(b => b.id !== id));
                Swal.fire('Deleted!', 'The booking has been successfully removed.', 'success');
            } else {
                Swal.fire('Error!', 'Failed to delete the booking.', 'error');
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                setBookings(prev => prev.filter(b => b.id !== id));
                Swal.fire('Deleted!', 'The booking has been successfully removed.', 'success');
            } else {
                console.error("Delete Error:", error);
                Swal.fire('Error!', 'Network error occurred while trying to delete.', 'error');
            }
        }
    };

    return (
        <AppContext.Provider value={{ bookings, setBookings, offices, setOffices, handleUpdateStatus, handleDeleteBooking }}>
            {children}
        </AppContext.Provider>
    );
};

export default function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Basic fallback Navbar for any public pages that might use <App /> */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/bookings/">
              <span className="font-bold sm:inline-block">
                SYS_NAME
              </span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/bookings/">Docs</a>
              <a className="transition-colors hover:text-foreground/80 text-foreground/60" href="/bookings/">Components</a>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center">
              <ModeToggle />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
