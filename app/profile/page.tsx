import React from "react";
import {
  MapPin,
  ShoppingBag,
  Settings,
  Mail,
  Calendar,
  Store,
  ChevronRight,
  Shield,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AddressesManager } from "@/components/profile/AddressesManager";
import { OrderHistory } from "@/components/profile/OrderHistory";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { CibilChat } from "@/components/profile/CibilChat";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userInitial = user.email?.[0].toUpperCase() || "U";
  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const userName = user.email?.split("@")[0] || "User";

  return (
    <div className="pf-root">

      <div className="pf-container">

        {/* ── Hero Banner ── */}
        <div className="pf-hero">
          {/* Background pattern */}
          <div className="pf-hero-bg" />

          <div className="pf-hero-inner">
            <div className="pf-hero-left">
              {/* Avatar */}
              <div className="pf-avatar">
                <span className="pf-avatar-letter">{userInitial}</span>
                <div className="pf-avatar-ring" />
              </div>

              {/* User info */}
              <div className="pf-hero-info">
                <div className="pf-hero-name-row">
                  <h1 className="pf-hero-name">{userName}</h1>
                  <span className="pf-badge">
                    <div className="pf-badge-dot" />
                    Active
                  </span>
                </div>
                <div className="pf-hero-meta">
                  <div className="pf-meta-item">
                    <Mail className="pf-meta-icon" />
                    <span>{user.email}</span>
                  </div>
                  <div className="pf-meta-sep" />
                  <div className="pf-meta-item">
                    <Calendar className="pf-meta-icon" />
                    <span>Since {joinDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <LogoutButton />
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="pf-grid">

          {/* ── Sidebar ── */}
          <aside className="pf-sidebar">
            <div className="pf-sidebar-inner">

              {/* Quick links */}
              <div className="pf-card">
                <p className="pf-card-label">Quick Access</p>
                <div className="pf-links">
                  <Link href="/cart" className="pf-link group">
                    <div className="pf-link-icon-wrap">
                      <ShoppingBag className="pf-link-icon" />
                    </div>
                    <span className="pf-link-text">View Cart</span>
                    <ChevronRight className="pf-link-chevron" />
                  </Link>
                  <Link href="/" className="pf-link group">
                    <div className="pf-link-icon-wrap">
                      <Store className="pf-link-icon" />
                    </div>
                    <span className="pf-link-text">Continue Shopping</span>
                    <ChevronRight className="pf-link-chevron" />
                  </Link>
                </div>
              </div>

              {/* Account summary */}
              <div className="pf-card pf-summary-card">
                <div className="pf-summary-row">
                  <Shield className="pf-summary-icon" />
                  <div>
                    <p className="pf-summary-title">Standard Account</p>
                    <p className="pf-summary-sub">All features enabled</p>
                  </div>
                </div>
                <div className="pf-summary-divider" />
                <div className="pf-summary-row">
                  <User className="pf-summary-icon" />
                  <div>
                    <p className="pf-summary-title">Member since</p>
                    <p className="pf-summary-sub">{joinDate}</p>
                  </div>
                </div>
              </div>

            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="pf-main">

            {/* Address Book */}
            <section className="pf-section">
              <div className="pf-section-header">
                <div className="pf-section-icon-wrap">
                  <MapPin className="pf-section-icon" />
                </div>
                <div>
                  <h2 className="pf-section-title">Address Book</h2>
                  <p className="pf-section-sub">Manage your delivery addresses</p>
                </div>
              </div>
              <div className="pf-section-body">
                <AddressesManager />
              </div>
            </section>

            {/* Order History */}
            <section className="pf-section">
              <div className="pf-section-header">
                <div className="pf-section-icon-wrap">
                  <ShoppingBag className="pf-section-icon" />
                </div>
                <div>
                  <h2 className="pf-section-title">Order History</h2>
                  <p className="pf-section-sub">Track and review your purchases</p>
                </div>
              </div>
              <div className="pf-section-body">
                <OrderHistory />
              </div>
            </section>

            {/* CIBIL Score Checker */}
            <CibilChat />

            {/* Account Details */}
            <section className="pf-section">
              <div className="pf-section-header">
                <div className="pf-section-icon-wrap">
                  <Settings className="pf-section-icon" />
                </div>
                <div>
                  <h2 className="pf-section-title">Account Details</h2>
                  <p className="pf-section-sub">Your personal information</p>
                </div>
              </div>
              <div className="pf-section-body">
                <div className="pf-details-grid">
                  <div className="pf-detail-item">
                    <p className="pf-detail-label">Email Address</p>
                    <p className="pf-detail-value">{user.email}</p>
                  </div>
                  <div className="pf-detail-item">
                    <p className="pf-detail-label">Account Status</p>
                    <div className="pf-status">
                      <div className="pf-status-dot" />
                      <span className="pf-status-text">Active</span>
                    </div>
                  </div>
                  <div className="pf-detail-item">
                    <p className="pf-detail-label">Member Since</p>
                    <p className="pf-detail-value">{joinDate}</p>
                  </div>
                  <div className="pf-detail-item">
                    <p className="pf-detail-label">Account Type</p>
                    <p className="pf-detail-value">Standard</p>
                  </div>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>

      <style>{`
        /* ── Root ── */
        .pf-root {
          min-height: 100vh;
          background: #fafafa;
          padding: 24px 16px 80px;
        }
        @media (min-width: 768px) {
          .pf-root { padding: 40px 24px 80px; }
        }
        @media (min-width: 1024px) {
          .pf-root { padding: 48px 32px 80px; }
        }

        .pf-container {
          max-width: 1080px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .pf-container { gap: 28px; }
        }

        /* ── Hero ── */
        .pf-hero {
          position: relative;
          background: #0f0f0f;
          border-radius: 20px;
          overflow: hidden;
          padding: 28px 24px;
        }
        @media (min-width: 640px) {
          .pf-hero { padding: 32px 32px; border-radius: 24px; }
        }

        /* Subtle dot grid */
        .pf-hero-bg {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .pf-hero-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (min-width: 640px) {
          .pf-hero-inner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
          }
        }

        .pf-hero-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Avatar */
        .pf-avatar {
          position: relative;
          width: 60px;
          height: 60px;
          flex-shrink: 0;
        }
        @media (min-width: 640px) {
          .pf-avatar { width: 68px; height: 68px; }
        }
        .pf-avatar-letter {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(135deg, #dc2626, #991b1b);
          color: white;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        @media (min-width: 640px) {
          .pf-avatar-letter { font-size: 26px; }
        }
        .pf-avatar-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1.5px solid rgba(220,38,38,0.3);
          pointer-events: none;
        }

        /* Hero info */
        .pf-hero-info { flex: 1; min-width: 0; }
        .pf-hero-name-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }
        .pf-hero-name {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.03em;
          line-height: 1;
          text-transform: capitalize;
        }
        @media (min-width: 640px) {
          .pf-hero-name { font-size: 22px; }
        }
        .pf-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 999px;
          padding: 3px 9px;
          font-size: 10px;
          font-weight: 700;
          color: #34d399;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .pf-badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #34d399;
          animation: pf-pulse 2s ease infinite;
        }
        @keyframes pf-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .pf-hero-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pf-meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #71717a;
          font-weight: 500;
        }
        .pf-meta-icon {
          width: 12px; height: 12px;
          color: #52525b;
          flex-shrink: 0;
        }
        .pf-meta-sep {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #3f3f46;
          flex-shrink: 0;
        }

        /* ── Grid ── */
        .pf-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 1024px) {
          .pf-grid {
            grid-template-columns: 260px 1fr;
            gap: 24px;
            align-items: start;
          }
        }

        /* ── Sidebar ── */
        .pf-sidebar-inner {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        @media (min-width: 1024px) {
          .pf-sidebar { position: sticky; top: 96px; }
        }

        /* ── Card (sidebar) ── */
        .pf-card {
          background: #ffffff;
          border: 1px solid #f0f0f0;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .pf-card-label {
          font-size: 10px;
          font-weight: 800;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 12px;
        }

        /* Links */
        .pf-links { display: flex; flex-direction: column; gap: 2px; }
        .pf-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 10px;
          transition: background 0.16s ease;
          text-decoration: none;
        }
        .pf-link:hover { background: #f4f4f5; }
        .pf-link-icon-wrap {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: #f4f4f5;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.16s ease;
        }
        .pf-link:hover .pf-link-icon-wrap { background: #e4e4e7; }
        .pf-link-icon {
          width: 14px; height: 14px;
          color: #52525b;
        }
        .pf-link-text {
          flex: 1;
          font-size: 13px;
          font-weight: 600;
          color: #3f3f46;
          transition: color 0.16s ease;
        }
        .pf-link:hover .pf-link-text { color: #09090b; }
        .pf-link-chevron {
          width: 14px; height: 14px;
          color: #d4d4d8;
          transition: color 0.16s ease, transform 0.16s ease;
        }
        .pf-link:hover .pf-link-chevron { color: #a1a1aa; transform: translateX(2px); }

        /* Summary card */
        .pf-summary-card { padding: 16px 18px; }
        .pf-summary-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pf-summary-icon {
          width: 16px; height: 16px;
          color: #a1a1aa;
          flex-shrink: 0;
        }
        .pf-summary-title {
          font-size: 12px;
          font-weight: 700;
          color: #18181b;
          line-height: 1.2;
        }
        .pf-summary-sub {
          font-size: 11px;
          color: #a1a1aa;
          font-weight: 500;
          margin-top: 1px;
        }
        .pf-summary-divider {
          height: 1px;
          background: #f4f4f5;
          margin: 12px 0;
        }

        /* ── Main content ── */
        .pf-main {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ── Section ── */
        .pf-section {
          background: #ffffff;
          border: 1px solid #f0f0f0;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .pf-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid #f4f4f5;
          background: #fafafa;
        }
        @media (min-width: 640px) {
          .pf-section-header { padding: 20px 24px; }
        }
        .pf-section-icon-wrap {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: #f4f4f5;
          border: 1px solid #e4e4e7;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .pf-section-icon {
          width: 15px; height: 15px;
          color: #52525b;
        }
        .pf-section-title {
          font-size: 14px;
          font-weight: 800;
          color: #09090b;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }
        .pf-section-sub {
          font-size: 11px;
          color: #a1a1aa;
          font-weight: 500;
          margin-top: 1px;
        }
        .pf-section-body {
          padding: 20px;
        }
        @media (min-width: 640px) {
          .pf-section-body { padding: 24px; }
        }

        /* ── Account details grid ── */
        .pf-details-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 500px) {
          .pf-details-grid { grid-template-columns: 1fr 1fr; }
        }
        .pf-detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 14px 16px;
          background: #fafafa;
          border: 1px solid #f4f4f5;
          border-radius: 12px;
        }
        .pf-detail-label {
          font-size: 10px;
          font-weight: 700;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .pf-detail-value {
          font-size: 13px;
          font-weight: 600;
          color: #18181b;
          line-height: 1.3;
          word-break: break-all;
        }
        .pf-status {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }
        .pf-status-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16,185,129,0.18);
        }
        .pf-status-text {
          font-size: 13px;
          font-weight: 600;
          color: #059669;
        }
      `}</style>
    </div>
  );
}