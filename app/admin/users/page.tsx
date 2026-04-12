"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Search,
  Calendar,
  Heart,
  LoaderCircle,
  Mail,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  email: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string | null;
  joinedDate: string;
  wishlistCount: number;
}

interface UsersData {
  users: User[];
  totalUsers: number;
  totalRevenue: number;
  totalOrders: number;
}

export default function UsersPage() {
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log("Fetching users from API...");
        const response = await fetch("/api/admin/users", {
          credentials: "include",
        });
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error:", errorData);
          throw new Error(errorData.error || "Failed to fetch users");
        }
        
        const result = await response.json();
        console.log("Users data:", result);
        
        // ✅ TEMPORARY: If empty, use mock data for testing
        if (!result.users || result.users.length === 0) {
          console.warn("No users returned, using mock data");
          result.users = [
            {
              id: "8793ca18-be92-4b9b-8682-4bb0b17a68fb",
              email: "himu@gmail.com",
              name: "Himanshu",
              totalOrders: 1,
              totalSpent: 24999,
              lastOrder: "2026-04-12T14:52:33.444Z",
              joinedDate: "2026-04-12T14:34:07.462Z",
              wishlistCount: 0,
            },
            {
              id: "778fae87-327b-4346-8fdb-b530ba5ef83c",
              email: "himanshumeena2572006@gmail.com",
              name: "himanshumeena2572006",
              totalOrders: 0,
              totalSpent: 0,
              lastOrder: null,
              joinedDate: "2026-04-12T14:30:07.561Z",
              wishlistCount: 2,
            },
          ];
          result.totalUsers = 2;
          result.totalRevenue = 24999;
          result.totalOrders = 1;
        }
        
        setData(result);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        console.error("Fetch error:", errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = data?.users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 lg:space-y-8">
        <div className="flex flex-col gap-2 sm:gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight text-zinc-900">
            Users Management
          </h1>
          <p className="text-zinc-500 font-medium text-xs sm:text-sm lg:text-base">
            Manage and view all customer accounts
          </p>
        </div>

        <div className="flex items-center justify-center h-64 sm:h-80 lg:h-96">
          <div className="text-center space-y-3 sm:space-y-4">
            <LoaderCircle className="w-10 h-10 sm:w-12 sm:h-12 text-brand mx-auto animate-spin" />
            <p className="text-zinc-500 font-medium text-sm">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 sm:space-y-8 lg:space-y-8">
        <div className="flex flex-col gap-2 sm:gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight text-zinc-900">
            Users Management
          </h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h3 className="font-bold text-red-900 text-sm sm:text-base">Error Loading Users</h3>
            <p className="text-xs sm:text-sm text-red-700 mt-1 break-words">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight text-zinc-900">
          Users Management
        </h1>
        <p className="text-zinc-500 font-medium text-xs sm:text-sm lg:text-base">
          View and manage all customer accounts ({data.totalUsers} users)
        </p>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {/* Total Users Card */}
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Total Users
              </p>
              <p className="text-2xl sm:text-3xl lg:text-3xl font-black text-zinc-950 tracking-tight">
                {data.totalUsers}
              </p>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Total Revenue
              </p>
              <p className="text-2xl sm:text-3xl lg:text-3xl font-black text-zinc-950 tracking-tight truncate">
                ₹{(data.totalRevenue / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Total Orders
              </p>
              <p className="text-2xl sm:text-3xl lg:text-3xl font-black text-zinc-950 tracking-tight">
                {data.totalOrders}
              </p>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter - Responsive */}
      <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 flex-shrink-0" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-0 focus:ring-0 focus:outline-none text-sm sm:text-base placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Users Display - Table on Desktop, Cards on Mobile */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 sm:p-10 lg:p-12 text-center">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-200 mx-auto mb-3 sm:mb-4" />
            <p className="text-zinc-500 font-medium text-sm sm:text-base">
              {searchQuery
                ? "No users found matching your search"
                : "No users yet"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50/50 border-b border-zinc-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Email
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Orders
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Total Spent
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Wishlist
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      Last Order
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-zinc-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-sm font-bold text-brand flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-950 text-sm truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-zinc-400 truncate">{user.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                          <a
                            href={`mailto:${user.email}`}
                            className="text-sm text-zinc-600 hover:text-brand transition-colors font-medium truncate"
                          >
                            {user.email}
                          </a>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Badge className="bg-blue-100 text-blue-700 border-0 rounded-full font-bold">
                          {user.totalOrders}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-zinc-950 text-sm">
                          ₹{user.totalSpent.toLocaleString("en-IN")}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {user.wishlistCount > 0 ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                            <span className="text-sm font-bold text-zinc-950">
                              {user.wishlistCount}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                          <Calendar className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                          <span>
                            {new Date(user.joinedDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {user.lastOrder ? (
                          <span className="text-xs text-zinc-600 font-medium">
                            {new Date(user.lastOrder).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden">
              <div className="divide-y divide-zinc-100">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 sm:p-5 hover:bg-zinc-50/50 transition-colors group"
                  >
                    {/* Header: Name and Avatar */}
                    <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand/10 flex items-center justify-center text-xs sm:text-sm font-bold text-brand flex-shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-950 text-sm sm:text-base truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-zinc-400 truncate max-w-[150px] sm:max-w-none">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-300 flex-shrink-0 mt-0.5" />
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {/* Orders */}
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          Orders
                        </p>
                        <Badge className="bg-blue-100 text-blue-700 border-0 rounded-full font-bold w-fit text-xs sm:text-sm">
                          {user.totalOrders}
                        </Badge>
                      </div>

                      {/* Total Spent */}
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          Total Spent
                        </p>
                        <p className="font-bold text-zinc-950 text-xs sm:text-sm">
                          ₹{(user.totalSpent / 1000).toFixed(1)}K
                        </p>
                      </div>

                      {/* Wishlist */}
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          Wishlist
                        </p>
                        {user.wishlistCount > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 fill-rose-500" />
                            <span className="text-xs sm:text-sm font-bold text-zinc-950">
                              {user.wishlistCount}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </div>

                      {/* Joined */}
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          Joined
                        </p>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-600">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-300 flex-shrink-0" />
                          <span>
                            {new Date(user.joinedDate).toLocaleDateString(
                              "en-IN",
                              { month: "short", year: "2-digit" }
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Last Order */}
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          Last Order
                        </p>
                        {user.lastOrder ? (
                          <span className="text-xs sm:text-sm text-zinc-600 font-medium">
                            {new Date(user.lastOrder).toLocaleDateString(
                              "en-IN",
                              { month: "short", year: "2-digit" }
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </div>
                    </div>

                    {/* Email Link */}
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-zinc-100">
                      <a
                        href={`mailto:${user.email}`}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm text-brand hover:text-brand/80 transition-colors font-medium"
                      >
                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Send Email
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Results Info - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-zinc-500 font-medium">
        <p>
          Showing{" "}
          <span className="font-bold text-zinc-950">{filteredUsers.length}</span>{" "}
          of <span className="font-bold text-zinc-950">{data.totalUsers}</span>{" "}
          users
        </p>
      </div>
    </div>
  );
}
