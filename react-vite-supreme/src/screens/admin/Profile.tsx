import { useEffect, useState } from "react";
import { Camera, Save, Lock, Mail, Phone, Briefcase, Building, ShieldCheck } from "lucide-react";
import api from "../auth/authService";
import { ProfileSkeleton } from "./Skeleton";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>("");
  const [tab, setTab] = useState<"info" | "password">("info");

  const [info, setInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    department: "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/users/me/");
        setInfo({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          phone: data.phoneNumber || "",
          jobTitle: data.position || "",
          department: data.office ? String(data.office) : "",
        });
      } catch (err) {
        console.error("Unable to load profile from backend:", err);
        setInfo({
          firstName: "Admin",
          lastName: "User",
          email: "admin@example.com",
          phone: "+63 912 345 6789",
          jobTitle: "System Administrator",
          department: "IT Department",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (tab === "password" && passwords.newPass !== passwords.confirm) {
      setError("New passwords do not match.");
      return;
    }

    setError("");
    setSaving(true);
    setSaved(false);

    try {
      if (tab === "info") {
        const payload = {
          email: info.email,
          first_name: info.firstName,
          last_name: info.lastName,
          position: info.jobTitle,
          office: info.department,
        };
        await api.patch("/auth/users/me/", payload);
      } else {
        await api.post("/auth/users/set_password/", {
          current_password: passwords.current,
          new_password: passwords.newPass,
          re_new_password: passwords.confirm,
        });
      }

      setSaved(true);
      setPasswords((prev) => ({ ...prev, current: "" }));
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Unable to save profile changes.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-10">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Profile dashboard
        </div>
        <div className="max-w-3xl">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Personal account settings</h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Update your profile details, contact information, and security settings in a layout that matches the system’s admin experience.</p>
        </div>
      </header>

      {loading ? (
        <div className="bg-card border border-border rounded-[2rem] p-8">
          <ProfileSkeleton />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-[2rem] border border-border bg-white/90 dark:bg-slate-950 shadow-xl shadow-slate-900/10 overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="relative">
                  <div className="h-28 w-28 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-black uppercase">
                    {info.firstName.slice(0, 1)}{info.lastName.slice(0, 1)}
                  </div>
                  <button className="absolute -right-1 -bottom-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm hover:bg-accent transition">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">system administrator</p>
                  <h2 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{info.firstName} {info.lastName}</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{info.email}</p>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                {[
                  { icon: Mail, label: "Email", value: info.email },
                  { icon: Phone, label: "Phone", value: info.phone },
                  { icon: Briefcase, label: "Department", value: info.department },
                  { icon: Building, label: "Title", value: info.jobTitle },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 rounded-3xl border border-border bg-slate-50 dark:bg-slate-950 px-4 py-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">{label}</p>
                      <p className="mt-1 font-semibold text-sm text-slate-900 dark:text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-border bg-card shadow-xl shadow-slate-900/10 overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-950 px-8 py-6 border-b border-border">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Account settings</p>
                  <h2 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">Edit your profile</h2>
                </div>
                <div className="inline-flex rounded-full border border-border bg-background p-1">
                  {(["info", "password"] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setTab(option)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        tab === option
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {option === "info" ? "Personal Info" : "Password"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {tab === "info" ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    { key: "firstName", label: "First Name", placeholder: "Juan" },
                    { key: "lastName", label: "Last Name", placeholder: "Dela Cruz" },
                    { key: "email", label: "Email", placeholder: "admin@example.com" },
                    { key: "phone", label: "Phone", placeholder: "+63 912 345 6789" },
                    { key: "jobTitle", label: "Job Title", placeholder: "System Administrator" },
                    { key: "department", label: "Department", placeholder: "IT Department" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">{label}</label>
                      <input
                        type="text"
                        value={info[key as keyof typeof info]}
                        onChange={(e) => setInfo({ ...info, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 rounded-3xl border border-border bg-slate-50 dark:bg-slate-950 px-4 py-4 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    Use a strong password with at least 8 characters.
                  </div>
                  {[
                    { key: "current", label: "Current Password", placeholder: "Enter current password" },
                    { key: "newPass", label: "New Password", placeholder: "Enter new password" },
                    { key: "confirm", label: "Confirm Password", placeholder: "Repeat new password" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">{label}</label>
                      <input
                        type="password"
                        value={passwords[key as keyof typeof passwords]}
                        onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                      />
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="rounded-3xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500 dark:text-slate-400">{saved ? "Changes saved successfully." : "All changes are local until you save."}</div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-3xl bg-primary px-6 py-3 text-sm font-black text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default Profile;
