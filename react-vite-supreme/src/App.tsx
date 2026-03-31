import React, { createContext, useContext, useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import Swal from 'sweetalert2';
import { Outlet } from "react-router-dom";
import { ModeToggle } from "./components/mode-toggle";

// @ts-ignore
const AppContext = createContext<any>(null);

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [offices, setOffices] = useState<any[]>([]);
    const [emailTemplates, setEmailTemplates] = useState<any[]>([]);

    useEffect(() => {
        fetch('http://192.168.18.155:8000/bookings/')
            .then(res => res.json())
            .then(data => setBookings(data))
            .catch(err => console.error("Error fetching bookings:", err));

        fetch('http://192.168.18.155:8000/offices/')
            .then(res => res.json())
            .then(data => setOffices(data))
            .catch(err => console.error("Error fetching offices:", err));

        fetch('http://192.168.18.155:8000/templates/')
            .then(res => res.json())
            .then(data => setEmailTemplates(data))
            .catch(err => console.error("Error fetching templates:", err));

        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
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
                const res = await fetch('http://192.168.18.155:8000/users/');
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
            const response = await fetch(`http://192.168.18.155:8000/bookings/${id}/`, {
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
            const response = await fetch(`http://192.168.18.155:8000/bookings/${id}/`, {
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

    return (
        <AppContext.Provider value={{ bookings, setBookings, offices, setOffices, handleUpdateStatus, handleDeleteBooking, sendNotifications }}>
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
