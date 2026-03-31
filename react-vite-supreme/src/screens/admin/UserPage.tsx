import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Plus, MoreHorizontal, User as UserIcon } from "lucide-react";
import { TableSkeleton } from "./Skeleton";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  joined: string;
}

// Mock data — replace with real API call
const MOCK_USERS: User[] = [
  { id: 1,  name: "Juan Dela Cruz",  email: "juan@example.com",   role: "Admin",    status: "Active",   joined: "Jan 12, 2025" },
  { id: 2,  name: "Maria Santos",    email: "maria@example.com",  role: "Editor",   status: "Active",   joined: "Feb 3, 2025" },
  { id: 3,  name: "Pedro Reyes",     email: "pedro@example.com",  role: "Viewer",   status: "Inactive", joined: "Mar 20, 2025" },
  { id: 4,  name: "Ana Garcia",      email: "ana@example.com",    role: "Editor",   status: "Active",   joined: "Apr 8, 2025" },
  { id: 5,  name: "Carlo Lim",       email: "carlo@example.com",  role: "Viewer",   status: "Active",   joined: "May 15, 2025" },
  { id: 6,  name: "Rosa Mendoza",    email: "rosa@example.com",   role: "Admin",    status: "Inactive", joined: "Jun 1, 2025" },
];

const statusColor = {
  Active:   "bg-green-500/10 text-green-600 dark:text-green-400",
  Inactive: "bg-muted text-muted-foreground",
};

const UserPage = () => {
  const [loading, setLoading]   = useState(true);
  const [users, setUsers]       = useState<User[]>([]);
  const [search, setSearch]     = useState("");

  const normalizeUser = (user: any): User => {
    const name = user.name || `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email || "Unknown";
    const status = user.status
      ? user.status === "active" || user.status === "Active"
        ? "Active"
        : "Inactive"
      : user.is_active
      ? "Active"
      : "Inactive";
    const joinedDate = user.joined || user.date_joined || user.created_at || "";
    const joined = joinedDate ? new Date(joinedDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) : "Unknown";

    return {
      id: user.id,
      name,
      email: user.email || "n/a",
      role: user.role || user.user_type || "User",
      status,
      joined,
    };
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://192.168.18.155:8000/users/");
      const data = Array.isArray(res.data) ? res.data : [];
      setUsers(data.map(normalizeUser));
    } catch (error) {
      console.error("Unable to load users from backend:", error);
      setUsers(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-5 sm:flex-col sm:items-stretch">
        <div className="relative flex-1 max-w-xs sm:max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
          />
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Table / Skeleton */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border bg-muted/40 slg:grid-cols-[2fr_1fr_auto]">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5" /> User
            </p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide slg:hidden">Role</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</p>
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No users found.
            </div>
          ) : (
            filtered.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3.5 border-b border-border last:border-0 items-center hover:bg-accent/40 transition-colors slg:grid-cols-[2fr_1fr_auto]"
              >
                {/* User info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold uppercase">
                    {user.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>

                {/* Role */}
                <p className="text-sm text-foreground slg:hidden">{user.role}</p>

                {/* Status badge */}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${statusColor[user.status]}`}>
                  {user.status}
                </span>

                {/* Actions */}
                <button className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer count */}
      {!loading && (
        <p className="text-xs text-muted-foreground mt-3">
          Showing {filtered.length} of {users.length} users
        </p>
      )}
    </>
  );
};

export default UserPage;
