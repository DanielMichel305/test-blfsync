import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  Award,
  Bell,
  FileText,
  Megaphone,
  MessageCircle,
  Newspaper,
  Shield,
  UserPlus,
  Users,
} from "lucide-react";
import type { Donor, Track } from "../types";

const AdminAnnouncements = lazy(() =>
  import("./admin/AdminContent").then((module) => ({
    default: module.AdminAnnouncements,
  })),
);
const AdminTestimonies = lazy(() =>
  import("./admin/AdminContent").then((module) => ({
    default: module.AdminTestimonies,
  })),
);
const AdminAuditLogs = lazy(() =>
  import("./admin/AdminOperations").then((module) => ({
    default: module.AdminAuditLogs,
  })),
);
const AdminBadges = lazy(() =>
  import("./admin/AdminOperations").then((module) => ({
    default: module.AdminBadges,
  })),
);
const AdminInvitations = lazy(() =>
  import("./admin/AdminOperations").then((module) => ({
    default: module.AdminInvitations,
  })),
);
const AdminNotifications = lazy(() =>
  import("./admin/AdminOperations").then((module) => ({
    default: module.AdminNotifications,
  })),
);
const AdminPrayerModeration = lazy(() =>
  import("./admin/AdminPrayerModeration").then((module) => ({
    default: module.AdminPrayerModeration,
  })),
);
const AdminTracks = lazy(() =>
  import("./admin/AdminTracks").then((module) => ({
    default: module.AdminTracks,
  })),
);
const AdminUsers = lazy(() =>
  import("./admin/AdminUsers").then((module) => ({
    default: module.AdminUsers,
  })),
);
const AdminPrayerThreadView = lazy(() =>
  import("./admin/AdminUsers").then((module) => ({
    default: module.AdminPrayerThreadView,
  })),
);
const AdminFieldUpdates = lazy(() =>
  import("./admin/AdminFieldUpdates").then((module) => ({
    default: module.AdminFieldUpdates,
  })),
);

type Tab =
  | "prayer"
  | "tracks"
  | "users"
  | "invitations"
  | "announcements"
  | "testimonies"
  | "field-updates"
  | "badges"
  | "notifications"
  | "logs";
const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "prayer",
    label: "Comments / Threads",
    icon: <MessageCircle className="h-4 w-4" />,
  },
  { id: "tracks", label: "Tracks", icon: <FileText className="h-4 w-4" /> },
  { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
  {
    id: "invitations",
    label: "Invitations",
    icon: <UserPlus className="h-4 w-4" />,
  },
  {
    id: "announcements",
    label: "Announcements",
    icon: <Megaphone className="h-4 w-4" />,
  },
  {
    id: "testimonies",
    label: "Testimonies",
    icon: <MessageCircle className="h-4 w-4" />,
  },
  {
    id: "field-updates",
    label: "Field Updates",
    icon: <Newspaper className="h-4 w-4" />,
  },
  { id: "badges", label: "Badges", icon: <Award className="h-4 w-4" /> },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="h-4 w-4" />,
  },
  { id: "logs", label: "Audit logs", icon: <Shield className="h-4 w-4" /> },
];

function readTab(selectedUserId?: string, selectedTrackId?: string): Tab {
  if (selectedUserId) return "users";
  if (selectedTrackId) return "tracks";
  const value =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("admin_tab");
  return tabs.some((tab) => tab.id === value) ? (value as Tab) : "prayer";
}

function AdminSectionLoader() {
  return (
    <div className="py-12 text-center text-xs text-editorial-charcoal/50">
      Loading section…
    </div>
  );
}

export default function AdminPanel({
  currentUser,
  tracks,
  selectedUserId,
  selectedTrackId,
  selectedPrayerThreadId,
  onOpenUser,
  onCloseUser,
  onOpenTrack,
  onCloseTrack,
}: {
  currentUser: Donor;
  tracks: Track[];
  selectedUserId?: string;
  selectedTrackId?: string;
  selectedPrayerThreadId?: string;
  onOpenUser: (id: string) => void;
  onCloseUser: () => void;
  onOpenTrack: (id: string) => void;
  onCloseTrack: () => void;
}) {
  const [tab, setTab] = useState<Tab>(() =>
    readTab(selectedUserId, selectedTrackId),
  );
  useEffect(() => {
    if (selectedUserId) setTab("users");
  }, [selectedUserId]);
  useEffect(() => {
    if (selectedTrackId) setTab("tracks");
  }, [selectedTrackId]);
  useEffect(() => {
    const pop = () => setTab(readTab(selectedUserId, selectedTrackId));
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, [selectedUserId, selectedTrackId]);
  const chooseTab = (next: Tab) => {
    if (selectedUserId) onCloseUser();
    if (selectedTrackId) onCloseTrack();
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("admin_tab", next);
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  };
  const trackOptions = tracks.map((track) => ({
    id: track.track_id,
    name: track.name,
  }));
  return (
    <section className="space-y-6 py-5">
      <nav
        aria-label="Admin sections"
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => chooseTab(item.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-wider ${tab === item.id ? "bg-editorial-charcoal text-editorial-cream" : "border border-editorial-charcoal/10 bg-editorial-card text-editorial-charcoal/60"}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <Suspense fallback={<AdminSectionLoader />}>
        {selectedPrayerThreadId ? (
          <AdminPrayerThreadView
            id={selectedPrayerThreadId}
            onBack={() => window.history.back()}
          />
        ) : (
          tab === "prayer" && <AdminPrayerModeration />
        )}
        {tab === "tracks" && (
          <AdminTracks
            isAdmin={currentUser.role === "admin"}
            selectedTrackId={selectedTrackId}
            onOpenTrack={onOpenTrack}
            onCloseTrack={onCloseTrack}
          />
        )}
        {tab === "users" && (
          <AdminUsers
            currentUserId={currentUser.donor_id}
            selectedUserId={selectedUserId}
            onOpenUser={onOpenUser}
            onCloseUser={onCloseUser}
          />
        )}
        {tab === "invitations" && <AdminInvitations />}
        {tab === "announcements" && (
          <AdminAnnouncements tracks={trackOptions} />
        )}
        {tab === "testimonies" && <AdminTestimonies tracks={trackOptions} />}
        {tab === "field-updates" && <AdminFieldUpdates tracks={trackOptions} />}
        {tab === "badges" && <AdminBadges />}
        {tab === "notifications" && <AdminNotifications />}
        {tab === "logs" && <AdminAuditLogs />}
      </Suspense>
    </section>
  );
}
