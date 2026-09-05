"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  CheckCircle2,
  Clock3,
  FileCheck,
  Landmark,
  Lock,
  MapPin,
  Palette,
  Phone,
  Save,
  Shield,
  UserRound,
  type LucideIcon,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getSession, type SessionUser } from "@/lib/auth";
import { getLegalTheme, setLegalTheme, ThemeIcon } from "@/components/ui/ThemeToggle";
import { useLawyerCases } from "@/hooks/useLawyerCases";
import { setLawyerAvailability } from "@/services/lawyerMatch.api";
import { getMeApi, updateProfileApi } from "@/services/auth.api";
import { apiClient } from "@/lib/api-client";

type Role = "CITIZEN" | "LAWYER";
type Theme = "light" | "dark" | "system";

const citizenPrefs = ["case-updates", "hearing-reminders", "documents", "judgments", "research-alerts", "communications"];
const lawyerPrefs = ["client-cases", "client-messages", "court-updates", "document-uploads", "research-alerts", "billing-alerts"];
const labels: Record<string, string> = {
  "case-updates": "Case status updates",
  "hearing-reminders": "Hearing reminders",
  documents: "Document processing",
  judgments: "Relevant judgments",
  "research-alerts": "Research alerts",
  communications: "Lawyer communications",
  "client-cases": "New client cases",
  "client-messages": "Client messages",
  "court-updates": "Court updates",
  "document-uploads": "Client document uploads",
  "billing-alerts": "Billing alerts",
};

export function SettingsPage({ role }: { role: Role }) {
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [theme, setTheme] = useState<Theme>("dark");
  const [saved, setSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Profile Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [barCouncil, setBarCouncil] = useState("");
  const [barNumber, setBarNumber] = useState("");
  const [court, setCourt] = useState("");
  const [location, setLocation] = useState("");
  const [practiceAreas, setPracticeAreas] = useState("");
  const [languages, setLanguages] = useState("");
  const [experienceYears, setExperienceYears] = useState<string>("");

  const [channels, setChannels] = useState({ email: true, push: true, inapp: true });
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    const u = getSession();
    setUser(u);
    if (u) {
      setName(u.name || "");
      setEmail(u.email || "");
      setPhone(u.phone || "");
      setBarCouncil(u.barCouncil || "");
      setBarNumber(u.barNumber || "");
      setCourt(u.court || "");
      setLocation(u.location || "");
      setPracticeAreas((u.practiceAreas || []).join(", "));
      setLanguages((u.languages || []).join(", "));
      setExperienceYears(u.experienceYears !== undefined && u.experienceYears !== null ? String(u.experienceYears) : "");
    }
    setTheme(getLegalTheme());

    // Fetch live user from backend
    getMeApi().then((res) => {
      if (res.success && res.data) {
        const d = res.data;
        setName(d.name || "");
        setEmail(d.email || "");
        setPhone(d.phone || "");
        setBarCouncil(d.barCouncil || "");
        setBarNumber(d.barNumber || "");
        setCourt(d.court || d.courtAdmission || "");
        setLocation(d.location || "");
        if (d.practiceAreas) setPracticeAreas(d.practiceAreas.join(", "));
        if (d.languages) setLanguages(d.languages.join(", "));
        if (d.experienceYears !== undefined && d.experienceYears !== null) {
          setExperienceYears(String(d.experienceYears));
        }
      }
    });

    if (role === "LAWYER") {
      apiClient<{
        isAvailable?: boolean;
        court?: string;
        location?: string;
        practiceAreas?: string[];
        languages?: string[];
        experienceYears?: number;
      }>("/lawyers/profile").then((res) => {
        if (res.success && res.data) {
          if (res.data.isAvailable !== undefined) setIsAvailable(res.data.isAvailable);
          if (res.data.court) setCourt(res.data.court);
          if (res.data.location) setLocation(res.data.location);
          if (res.data.practiceAreas?.length) setPracticeAreas(res.data.practiceAreas.join(", "));
          if (res.data.languages?.length) setLanguages(res.data.languages.join(", "));
          if (res.data.experienceYears !== undefined && res.data.experienceYears !== null) {
            setExperienceYears(String(res.data.experienceYears));
          }
        }
      });
    }

    const stored = localStorage.getItem(`legalai-${role.toLowerCase()}-notifications`);
    if (stored) {
      const parsed = JSON.parse(stored);
      setChannels(parsed.channels || { email: true, push: true, inapp: true });
      setPrefs(parsed.prefs || {});
    } else {
      setPrefs(Object.fromEntries((role === "LAWYER" ? lawyerPrefs : citizenPrefs).map((k) => [k, true])));
    }

    const onTheme = () => setTheme(getLegalTheme());
    window.addEventListener("legalai-theme-change", onTheme);
    return () => window.removeEventListener("legalai-theme-change", onTheme);
  }, [role]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    const parsedAreas = practiceAreas
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedLangs = languages
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedExp = experienceYears.trim() ? parseInt(experienceYears.trim(), 10) : undefined;

    const res = await updateProfileApi({
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
      barCouncil: role === "LAWYER" ? barCouncil.trim() || undefined : undefined,
      barNumber: role === "LAWYER" ? barNumber.trim() || undefined : undefined,
      court: role === "LAWYER" ? court.trim() || undefined : undefined,
      location: role === "LAWYER" ? location.trim() || undefined : undefined,
      practiceAreas: role === "LAWYER" ? parsedAreas : undefined,
      languages: role === "LAWYER" ? parsedLangs : undefined,
      experienceYears: role === "LAWYER" ? (isNaN(parsedExp as number) ? undefined : parsedExp) : undefined,
    });

    if (role === "LAWYER") {
      await apiClient("/lawyers/profile", {
        method: "POST",
        body: JSON.stringify({
          court: court.trim() || undefined,
          location: location.trim() || undefined,
          practiceAreas: parsedAreas,
          languages: parsedLangs,
          experienceYears: isNaN(parsedExp as number) ? undefined : parsedExp,
        }),
      });
    }

    setSavingProfile(false);
    if (res.success) {
      setSaved(true);
      setProfileMsg("Profile updated successfully.");
      const updatedUser = getSession();
      if (updatedUser) setUser(updatedUser);
      window.setTimeout(() => {
        setSaved(false);
        setProfileMsg(null);
      }, 2500);
    } else {
      setProfileMsg(res.error?.message || "Failed to update profile.");
    }
  };

  const saveNotifications = () => {
    localStorage.setItem(`legalai-${role.toLowerCase()}-notifications`, JSON.stringify({ channels, prefs }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const changeTheme = (value: Theme) => {
    setTheme(value);
    setLegalTheme(value);
  };

  const handleToggleAvailability = async (val: boolean) => {
    setIsAvailable(val);
    await setLawyerAvailability(val);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const isLawyer = role === "LAWYER";
  const { stats: caseStats } = useLawyerCases();
  const tabs = [
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Lock },
    ...(isLawyer ? [{ id: "verification", label: "Verification Details", icon: Shield }] : []),
  ];

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold">Settings</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Control your account, profile, notifications, appearance, and workspace preferences.
          </p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-[var(--border-color)] pb-px">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold ${
              tab === t.id
                ? "border-[var(--accent-gold)] text-[var(--accent-gold)]"
                : "border-transparent text-[var(--text-secondary)]"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <Card variant="glass" className="p-6">
          <div className="flex items-center gap-4 border-b border-[var(--border-color)] pb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-gold-light)] text-lg font-bold text-[var(--accent-gold)]">
              {user?.initials || "LA"}
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold">{user?.name || "LegalAI User"}</h2>
              <p className="text-xs text-[var(--text-secondary)]">{user?.email || "—"}</p>
            </div>
            {isLawyer && (
              <Badge variant={user?.verificationStatus === "VERIFIED" ? "success" : "neutral"} className="ml-auto">
                {user?.verificationStatus === "VERIFIED" ? "Verified" : "Self-Declared Details"}
              </Badge>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold">Full Legal Name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold">Email Address (Account ID)</span>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm opacity-75 cursor-not-allowed"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold">Phone Number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm"
                />
              </label>

              {isLawyer && (
                <>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold">State Bar Council</span>
                    <input
                      type="text"
                      value={barCouncil}
                      onChange={(e) => setBarCouncil(e.target.value)}
                      placeholder="e.g. Bar Council of Maharashtra & Goa"
                      className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold">Bar Enrollment Number</span>
                    <input
                      type="text"
                      value={barNumber}
                      onChange={(e) => setBarNumber(e.target.value)}
                      placeholder="e.g. MAH/1234/2020"
                      className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold">Primary Court / Jurisdiction</span>
                    <input
                      type="text"
                      value={court}
                      onChange={(e) => setCourt(e.target.value)}
                      placeholder="e.g. Bombay High Court, District Court"
                      className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold">City / Location</span>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Mumbai, Pune, Nagpur"
                      className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold">Practice Areas (comma-separated)</span>
                    <input
                      type="text"
                      value={practiceAreas}
                      onChange={(e) => setPracticeAreas(e.target.value)}
                      placeholder="e.g. Constitutional Law, Civil Litigation, Labour Law"
                      className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold">Languages Spoken (comma-separated)</span>
                    <input
                      type="text"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      placeholder="e.g. English, Hindi, Marathi"
                      className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold">Years of Experience</span>
                    <input
                      type="number"
                      min="0"
                      max="70"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g. 8"
                      className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm"
                    />
                  </label>
                </>
              )}
            </div>

            {profileMsg && (
              <p
                className={`text-xs ${
                  profileMsg.includes("successfully") ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {profileMsg}
              </p>
            )}

            <Button type="submit" isLoading={savingProfile}>
              <Save className="mr-2 h-4 w-4" />
              Save Profile Changes
            </Button>
          </form>

          {isLawyer && (
            <div className="mt-8 border-t border-[var(--border-color)] pt-6 space-y-4">
              <h3 className="text-sm font-bold font-serif text-[var(--text-primary)]">
                Client Request Availability
              </h3>
              <ToggleRow
                label="Accepting New Consultation Requests from Citizens"
                value={isAvailable}
                onChange={handleToggleAvailability}
              />
              <div className="pt-2">
                <h3 className="text-sm font-bold font-serif text-[var(--text-primary)]">Cases Handled</h3>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    ["Total Cases", caseStats.total],
                    ["Active", caseStats.active],
                    ["Settled", caseStats.settled],
                    ["Closed", caseStats.closed],
                  ].map(([label, value]) => (
                    <div
                      key={label as string}
                      className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 text-center"
                    >
                      <p className="text-2xl font-bold font-serif text-[var(--accent-gold)]">{value}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {tab === "notifications" && (
        <div className="space-y-5">
          <Card variant="glass" className="p-6">
            <h2 className="font-serif text-xl font-bold">Notification channels</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {Object.entries(channels).map(([key, val]) => (
                <ToggleRow
                  key={key}
                  label={key === "email" ? "Email notifications" : key === "push" ? "Push notifications" : "In-app notifications"}
                  value={val}
                  onChange={(v) => setChannels((c) => ({ ...c, [key]: v }))}
                />
              ))}
            </div>
          </Card>
          <Card variant="glass" className="p-6">
            <h2 className="font-serif text-xl font-bold">Granular preferences</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(isLawyer ? lawyerPrefs : citizenPrefs).map((key) => (
                <ToggleRow
                  key={key}
                  label={labels[key]}
                  value={prefs[key] ?? true}
                  onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
                />
              ))}
            </div>
            <Button onClick={saveNotifications} className="mt-5">
              <Save className="mr-2 h-4 w-4" />
              Save notification preferences
            </Button>
          </Card>
        </div>
      )}

      {tab === "appearance" && (
        <Card variant="glass" className="p-6">
          <h2 className="font-serif text-xl font-bold">Appearance</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            This preference is global and persists across Citizen and Lawyer pages.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {(["light", "dark", "system"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => changeTheme(t)}
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  theme === t
                    ? "border-[var(--accent-gold)] bg-[var(--accent-gold-light)]"
                    : "border-[var(--border-color)] bg-[var(--bg-card)]"
                }`}
              >
                <ThemeIcon theme={t} />
                <p className="mt-3 text-sm font-bold capitalize">{t}</p>
                <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                  {t === "system"
                    ? "Follow device preference"
                    : t === "dark"
                    ? "Deep charcoal legal workspace"
                    : "Warm paper legal workspace"}
                </p>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-[var(--bg-card)] p-4">
            <div className="flex items-center gap-3">
              <Palette className="h-4 w-4 text-[var(--accent-gold)]" />
              <div>
                <p className="text-xs font-semibold">Current theme</p>
                <p className="text-[10px] text-[var(--text-muted)]">{theme}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {tab === "security" && (
        <div className="space-y-5">
          <Card variant="glass" className="p-6">
            <h2 className="font-serif text-xl font-bold">Password & security</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Current password" type="password" value="" />
              <Field label="New password" type="password" value="" />
            </div>
            <Button className="mt-5" onClick={saveNotifications}>
              <Save className="mr-2 h-4 w-4" />
              Update password
            </Button>
          </Card>
          <Card variant="glass" className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold">Two-factor authentication</h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Frontend control for the future auth backend.</p>
              </div>
              <Badge variant="warning">Not enabled</Badge>
            </div>
            <Button variant="outline" className="mt-5">
              Enable 2FA
            </Button>
          </Card>
          <Card variant="glass" className="p-6">
            <h2 className="font-serif text-xl font-bold">Session control</h2>
            <div className="mt-4 rounded-xl bg-[var(--bg-card)] p-4">
              <div className="flex items-center gap-3">
                <Clock3 className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-xs font-semibold">Current browser session</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Protected session</p>
                </div>
                <Badge className="ml-auto">Active</Badge>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <LogoutButton compact />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("legalai-session");
                  router.push("/");
                }}
              >
                Logout all devices
              </Button>
            </div>
          </Card>
        </div>
      )}

      {tab === "verification" && isLawyer && (
        <Card variant="glass" className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-purple-300" />
            <div>
              <h2 className="font-serif text-xl font-bold">Professional identity details</h2>
              <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                Self-declared credentials submitted by advocate. Official third-party state bar verification is pending integration with statutory Bar Council portals.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Info icon={FileCheck} label="Enrollment" value={user?.barNumber || barNumber || "Missing"} />
            <Info icon={Briefcase} label="Bar Council" value={user?.barCouncil || barCouncil || "Missing"} />
            <Info icon={Landmark} label="Jurisdiction" value={user?.court || court || "Not specified"} />
          </div>
          <Button variant="outline" className="mt-5" onClick={() => router.push("/lawyer/verification")}>
            Open verification workflow
          </Button>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold">{label}</span>
      <input
        type={type}
        defaultValue={value}
        className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm"
      />
    </label>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <span className="text-xs font-semibold">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-pressed={value}
        className={`relative h-6 w-11 rounded-full transition ${value ? "bg-[var(--accent-gold)]" : "bg-[var(--bg-secondary)]"}`}
      >
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${value ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--bg-card)] p-4">
      <Icon className="h-4 w-4 text-[var(--accent-gold)]" />
      <p className="mt-2 text-[10px] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-xs font-semibold">{value}</p>
    </div>
  );
}
