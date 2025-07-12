"use client";
import {ArrowLeft} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Button} from "./ui/button";
import {AdminNavigation} from "@/app/admin/_components/admin-navigation";
import {useAdminDashboard} from "@/app/admin/_hooks/use-admin-dashboard";
import type {NavigationType} from "@/lib/types";
import { cn } from "@/lib/utils";

const getNavigationType = (pathname: string): NavigationType => {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname === "/") return "home";
  return "default";
};

// stickyを適用するページを定義
const getShouldBeSticky = (navType: NavigationType): boolean => {
  // トップページのみsticky
  return navType === "home";
};

export default function Header() {
  const pathname = usePathname();
  const navType = getNavigationType(pathname);
  const shouldBeSticky = getShouldBeSticky(navType);

  const {
    notifications,
    unreadNotifications,
    markNotificationAsRead,
    markAllAsRead,
  } = useAdminDashboard();

  return (
    <nav className={cn(
      "relative border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/80 z-50",
      shouldBeSticky && "sticky top-0"
    )}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {navType === "admin" ? (
          <AdminNavigation
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            onMarkAsRead={markNotificationAsRead}
            onMarkAllAsRead={markAllAsRead}
          />
        ) : (
          <MainNav navType={navType} />
        )}
      </div>
    </nav>
  );
}

const MainNav = ({navType}: {navType: NavigationType}) => {
  return (
    <div className="flex justify-between items-center h-16">
      {navType === "home" ? (
        <div className="flex items-center space-x-2">
          <span className="text-2xl" role="img" aria-label="火">
            🔥
          </span>
          <h1 className="text-xl font-bold text-white">もくもくReact</h1>
        </div>
      ) : (
        <h1>
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5 text-slate-400" />
            <span className="text-2xl">🔥</span>
            <span className="text-xl font-bold text-white">もくもくReact</span>
          </Link>
        </h1>
      )}
      {navType === "home" && <HomeNavButtons />}
    </div>
  );
};

const HomeNavButtons = () => (
  <div className="flex items-center space-x-4">
    <Button
      asChild
      variant="ghost"
      className="text-slate-300 hover:opacity-80 rounded-full"
    >
      <Link href="/admin">管理画面</Link>
    </Button>
    <Button
      asChild
      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-80 rounded-full"
    >
      <Link href="/reserve">事前登録する</Link>
    </Button>
  </div>
);
