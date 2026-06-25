import React from "react";
import { Shield, LogOut, User as UserIcon, QrCode, Scan, Heart, Activity } from "lucide-react";
import { User } from "../types.js";

interface NavbarProps {
  user: Omit<User, "password"> | null;
  onNavigate: (route: string) => void;
  currentRoute: string;
  onLogout: () => void;
}

export default function Navbar({ user, onNavigate, currentRoute, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-rose-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-left transition-transform active:scale-95"
          id="nav-logo"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-red-200">
            <Heart className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">
              Lifeline<span className="text-red-500 font-extrabold">ID</span>
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              Emergency QR System
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate("scan")}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentRoute === "scan"
                ? "bg-red-50 text-red-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            id="nav-scan"
          >
            <Scan className="h-4 w-4" />
            Scan QR
          </button>

          {user && (
            <>
              <button
                onClick={() => onNavigate("dashboard")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  currentRoute === "dashboard" || currentRoute === "profile"
                    ? "bg-red-50 text-red-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                id="nav-dashboard"
              >
                <UserIcon className="h-4 w-4" />
                My Profile
              </button>

              <button
                onClick={() => onNavigate("qr")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  currentRoute === "qr"
                    ? "bg-red-50 text-red-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                id="nav-qr"
              >
                <QrCode className="h-4 w-4" />
                My QR ID
              </button>

              {user.role === "admin" && (
                <button
                  onClick={() => onNavigate("admin")}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    currentRoute === "admin"
                      ? "bg-rose-100 text-rose-800"
                      : "text-rose-600 hover:bg-rose-50"
                  }`}
                  id="nav-admin"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </button>
              )}
            </>
          )}
        </nav>

        {/* User Profile Area */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 uppercase">
                  {user.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
                title="Sign Out"
                id="nav-logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate("scan")}
                className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                title="Scan Emergency QR"
              >
                <Scan className="h-4 w-4" />
              </button>
              <button
                onClick={() => onNavigate("auth")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-red-700 hover:to-rose-700 active:scale-95 transition-transform"
                id="nav-login-btn"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
