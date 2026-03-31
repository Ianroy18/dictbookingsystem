import React from 'react'
import ReactDOM from 'react-dom/client'
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import App, { AppProvider, useApp } from './App.tsx'
import './index.css'

import NotFound from "./screens/notFound";
import Loader from './components/loader/loader.tsx';
import { AuthProvider } from './screens/auth/AuthContext.tsx';
import { ThemeProvider } from './components/theme-provider.tsx';

const Page1 = lazy(() =>
  wait(1300).then(() => import("./screens/page1.tsx"))
);

const Page2 = lazy(() =>
  wait(1300).then(() => import("./screens/page2.tsx"))
);

const Login = lazy(() => import("./screens/shared/Login.tsx"));
const Register = lazy(() => import("./screens/auth/Register.tsx"));
const RequestorDashboard = lazy(() => import("./screens/requestor/Dashboard.tsx"));
import RequestorNavbar from "./screens/requestor/RequestorNavbar.tsx";

// ── Admin pages ───────────────────────────────────────────────────────────
import Sidebar from "./screens/shared/Sidebar.tsx";
import { Outlet } from "react-router-dom";

const AdminDashboard  = lazy(() => import("./screens/admin/AdminDashboard.tsx"));
const SuperAdminDashboard = lazy(() => import("./screens/super-admin/SuperAdminDashboard.tsx"));
const AdminUsers      = lazy(() => import("./screens/super-admin/UserManagement.tsx"));
const AdminDocuments  = lazy(() => import("./screens/admin/DocumentPage.tsx"));
const AdminSettings   = lazy(() => import("./screens/admin/Setting.tsx"));
const AdminProfile    = lazy(() => import("./screens/admin/Profile.tsx"));
const AdminReviewRequests = lazy(() => import("./screens/admin/ReviewRequests.tsx"));
const AdminInventory      = lazy(() => import("./screens/admin/Inventory.tsx"));
const AdminOffices        = lazy(() => import("./screens/admin/OfficeManagement.tsx"));
const AdminTemplates      = lazy(() => import("./screens/admin/Templates.tsx"));
const AdminReports        = lazy(() => import("./screens/admin/Reports.tsx"));
const TrackRequests       = lazy(() => import("./screens/requestor/TrackRequests.tsx"));
const NewBooking          = lazy(() => import("./screens/requestor/NewBooking.tsx"));

// Legacy route kept for old links
const LegacyDashboard = lazy(() => import("./screens/Dashboard.tsx"));

const getUser = () => {
    try {
        const userJson = localStorage.getItem('user');
        return userJson ? JSON.parse(userJson) : { role: 'admin' };
    } catch {
        return { role: 'admin' };
    }
};

const AdminLayoutWrapper = () => {
  const currentUser = getUser();
  
  return (
    <div className="flex bg-slate-50 min-h-screen relative font-['Inter',_sans-serif]">
       <Sidebar role={currentUser.role} notifCount={0} currentUser={currentUser} />
       <main className="flex-1 ml-80 transition-all duration-300">
          <Outlet />
       </main>
    </div>
  );
};

const RequestorLayoutWrapper = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Inter',_sans-serif]">
      <RequestorNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

const AdminRoute = ({ component: Component, ...rest }: any) => {
    const currentUser = getUser();
    const { bookings, offices, handleUpdateStatus, handleDeleteBooking } = useApp() || { bookings: [], offices: [] };
    
    return <Component currentUser={currentUser} bookings={bookings} offices={offices} onUpdateStatus={handleUpdateStatus} onDeleteBooking={handleDeleteBooking} {...rest} />;
};

const RootRoute = ({ component: Component, ...rest }: any) => {
    const { bookings, offices, setBookings, sendNotifications } = useApp() || { bookings: [], offices: [] };
    return <Component bookings={bookings} offices={offices} setBookings={setBookings} sendNotifications={sendNotifications} {...rest} />;
};

const RoleBasedDashboard = ({ currentUser, bookings, offices, ...rest }: any) => {
    if (currentUser?.role === 'super-admin') {
        return <SuperAdminDashboard bookings={bookings} {...rest} />;
    }
    return <AdminDashboard bookings={bookings} offices={offices} currentUser={currentUser} {...rest} />;
};

const router = createBrowserRouter([
  // ── Requestor pages (with navbar) ─────────────────────
  {
    path: "/",
    element: <RequestorLayoutWrapper />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loader />}>
            <RootRoute component={RequestorDashboard} setView={(view: string) => { if (view === 'new-booking') window.location.href = '/new-booking'; }} />
          </Suspense>
        ),
      },
      {
        path: "track-requests",
        element: (
          <Suspense fallback={<Loader />}>
            <RootRoute component={TrackRequests} />
          </Suspense>
        ),
      },
      {
        path: "new-booking",
        element: (
          <Suspense fallback={<Loader />}>
            <RootRoute component={NewBooking} onCancel={() => window.history.back()} onAdd={(entry: any) => { console.log('Booking added', entry); window.location.href = '/track-requests'; }} />
          </Suspense>
        ),
      },
    ],
  },

  // ── Auth pages (no navbar) ────────────────────────────
  {
    path: "/bookings/login",
    element: (
      <Suspense fallback={<Loader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/bookings/register",
    element: (
      <Suspense fallback={<Loader />}>
        <Register />
      </Suspense>
    ),
  },

  // ── Admin pages wrapper ───────────────────────────────
  {
    path: "/bookings/admin",
    element: <AdminLayoutWrapper />,
    children: [
      {
        path: "dashboard",
        element: (
             <Suspense fallback={<Loader />}>
                <AdminRoute component={RoleBasedDashboard} />
             </Suspense>
        ),
      },
      {
        path: "track-requests",
        element: (
             <Suspense fallback={<Loader />}>
                <AdminRoute component={TrackRequests} />
             </Suspense>
        ),
      },
      {
        path: "review-requests",
        element: (
             <Suspense fallback={<Loader />}>
                <AdminRoute component={AdminReviewRequests} />
             </Suspense>
        ),
      },
      {
        path: "inventory",
        element: (
             <Suspense fallback={<Loader />}>
                <AdminRoute component={AdminInventory} />
             </Suspense>
        ),
      },
      {
        path: "offices",
        element: (
             <Suspense fallback={<Loader />}>
                <AdminRoute component={AdminOffices} />
             </Suspense>
        ),
      },
      {
        path: "templates",
        element: (
             <Suspense fallback={<Loader />}>
                <AdminRoute component={AdminTemplates} />
             </Suspense>
        ),
      },
      {
        path: "reports",
        element: (
             <Suspense fallback={<Loader />}>
                <AdminRoute component={AdminReports} />
             </Suspense>
        ),
      },
      {
        path: "users",
        element: (
             <Suspense fallback={<Loader />}>
                <AdminRoute component={AdminUsers} />
             </Suspense>
        ),
      },
      {
        path: "documents",
        element: (
             <Suspense fallback={<Loader />}>
                {/* @ts-ignore */}
                <AdminDocuments />
             </Suspense>
        ),
      },
      {
        path: "settings",
        element: (
             <Suspense fallback={<Loader />}>
                {/* @ts-ignore */}
                <AdminSettings />
             </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
             <Suspense fallback={<Loader />}>
                {/* @ts-ignore */}
                <AdminProfile />
             </Suspense>
        ),
      },
    ]
  },

  // ── Legacy dashboard redirect ──────────────────────────
  {
    path: "/bookings/dashboard",
    element: <Navigate to="/bookings/admin/dashboard" replace />,
  },

  // ── Legacy standalone dashboard (kept as fallback) ────
  {
    path: "/bookings/dashboard-old",
    element: <Suspense fallback={<Loader />}><LegacyDashboard /></Suspense>,
  },

  // ── Main app with navbar ──────────────────────────────
  {
    path: "/bookings/",
    element: <App />,
    children: [
      {
        path: "/bookings/",
        element: <Navigate to="/bookings/admin/dashboard" />,
      },
      {
        path: "/bookings/page1",
        element: (
          <Suspense fallback={<Loader />}>
            <Page1 />
          </Suspense>
        ),
      },
      {
        path: "/bookings/page2",
        element: (
          <Suspense fallback={<Loader />}>
            <Page2 />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

import { ModeToggle } from './components/mode-toggle.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <AppProvider>
          <div className="relative min-h-screen">
            <RouterProvider router={router} />
            {/* Persistent floating theme switcher */}
            <div className="fixed bottom-6 right-6 z-[100] shadow-2xl rounded-full overflow-hidden hover:scale-110 active:scale-95 transition-all">
              <ModeToggle />
            </div>
          </div>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
