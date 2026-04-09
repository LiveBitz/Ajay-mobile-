"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, TrendingUp, Package, ShoppingCart, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

interface DashboardData {
  month: number;
  year: number;
  timePeriod?: string;
  dateRange?: { start: string; end: string };
  stats: {
    totalProducts: number;
    totalCategories: number;
    totalOrders: number;
    totalRevenue: number;
    newCustomers: number;
  };
  ordersByStatus: Record<string, number>;
  revenueChart: Array<{ date: string; revenue: number }>;
  topProducts: Array<{ name: string; quantity: number; value: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const REFRESH_INTERVAL = 5000; // 5 seconds auto-refresh

export default function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "year">("month");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const monthParam = selectedMonth;
      const yearParam = selectedYear;
      console.log(`[Dashboard] Fetching data for ${timePeriod} view with params:`, { monthParam, yearParam, timePeriod });
      const response = await fetch(
        `/api/admin/dashboard?month=${monthParam}&year=${yearParam}&timePeriod=${timePeriod}`
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error ${response.status}: ${errorData.error || 'Unknown error'}`);
      }
      const dashboardData = await response.json();
      console.log("[Dashboard] Data fetched:", dashboardData);
      setData(dashboardData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(`Unable to load dashboard data: ${errorMsg}`);
      console.error("[Dashboard] Fetch error:", err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    console.log("[Dashboard] Component mounted, starting auto-refresh");
    fetchDashboardData();

    // Set up auto-refresh interval
    const intervalId = setInterval(() => {
      console.log("[Dashboard] Auto-refresh tick");
      fetchDashboardData();
    }, REFRESH_INTERVAL);

    // Cleanup interval on unmount
    return () => {
      console.log("[Dashboard] Cleaning up interval");
      clearInterval(intervalId);
    };
  }, [selectedMonth, selectedYear, timePeriod]);

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const formatLastUpdated = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) {
      return `${diffSecs}s ago`;
    }
    const diffMins = Math.floor(diffSecs / 60);
    return `${diffMins}m ago`;
  };

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-600">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Orders",
      value: data?.stats.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Total Revenue",
      value: `₹${(data?.stats.totalRevenue ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Products",
      value: data?.stats.totalProducts ?? 0,
      icon: Package,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "New Customers",
      value: data?.stats.newCustomers ?? 0,
      icon: TrendingUp,
      color: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  // Helper function to get date range display text
  const getDateRangeText = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(timePeriod) {
      case "week": {
        const weekStart = new Date(today);
        const weekEnd = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      }
      case "year":
        return `${today.getFullYear()}`;
      case "month":
      default:
        return `${MONTHS[selectedMonth]} ${selectedYear}`;
    }
  };

  const statusData = data
    ? Object.entries(data.ordersByStatus).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        fill: STATUS_COLORS[status] || "#666",
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Time Period Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
        {/* Time Period Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Dashboard Analytics</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Updated {formatLastUpdated()}</p>
          </div>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
            {(["week", "month", "year"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 sm:px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  timePeriod === period
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-transparent text-gray-700 hover:bg-gray-200"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Month/Year Navigation - Only show for Month and Year views */}
        {(timePeriod === "month" || timePeriod === "year") && (
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-4 border border-blue-100">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-5 h-5 text-blue-600" />
            </button>
            
            <div className="flex flex-col items-center">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {getDateRangeText()}
              </h3>
            </div>
            
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              aria-label="Next period"
            >
              <ChevronRight className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        )}

        {/* Current Period Display for Week */}
        {timePeriod === "week" && (
          <div className="text-center bg-gradient-to-r from-green-50 to-transparent rounded-lg p-4 border border-green-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {getDateRangeText()}
            </h3>
          </div>
        )}
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`${card.color} border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 font-medium text-sm">{card.label}</h3>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Revenue Chart - spans 2 columns */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
              {/* Header with Title and Stats */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 uppercase tracking-tight">
                      Revenue Trend
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {timePeriod === "week" && "This Week's Performance"}
                      {timePeriod === "month" && `${MONTHS[selectedMonth]} ${selectedYear}`}
                      {timePeriod === "year" && `Year ${selectedYear} Overview`}
                    </p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {data?.revenueChart && data.revenueChart.length > 0 && (
                      <>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg px-3 py-2 border border-blue-200">
                          <p className="text-xs text-blue-600 font-medium">
                            {timePeriod === "week" && "Weekly"}
                            {timePeriod === "month" && "Monthly"}
                            {timePeriod === "year" && "Yearly"} Total
                          </p>
                          <p className="text-sm sm:text-base font-bold text-blue-900">
                            ₹{data.revenueChart.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg px-3 py-2 border border-green-200">
                          <p className="text-xs text-green-600 font-medium">
                            {timePeriod === "week" && "Daily Avg"} 
                            {timePeriod === "month" && "Daily Avg"}
                            {timePeriod === "year" && "Daily Avg"}
                          </p>
                          <p className="text-sm sm:text-base font-bold text-green-900">
                            ₹{Math.round(data.revenueChart.reduce((sum, d) => sum + d.revenue, 0) / data.revenueChart.length).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg px-3 py-2 border border-purple-200">
                          <p className="text-xs text-purple-600 font-medium">Peak Revenue</p>
                          <p className="text-sm sm:text-base font-bold text-purple-900">
                            ₹{Math.max(...data.revenueChart.map(d => d.revenue)).toLocaleString()}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {data?.revenueChart && data.revenueChart.length > 0 ? (
                <div className="w-full">
                  {/* Mobile View */}
                  <div className="sm:hidden">
                    <div className="overflow-x-auto -mx-4 px-4">
                      <div style={{ minWidth: timePeriod === "year" ? "280px" : "300px" }}>
                        <ResponsiveContainer width={timePeriod === "year" ? 280 : 300} height={240}>
                          <LineChart 
                            data={data.revenueChart}
                            key={`revenue-mobile-${JSON.stringify(data.revenueChart.map(d => d.revenue).join(','))}`}
                            margin={timePeriod === "year" ? { top: 10, right: 10, left: 10, bottom: 50 } : { top: 10, right: 10, left: 10, bottom: 40 }}
                          >
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#d1d5db"
                              tick={{ fontSize: 10, fill: "#6b7280" }}
                              interval={timePeriod === "year" ? 0 : Math.ceil(data.revenueChart.length / 5) - 1}
                              angle={timePeriod === "year" ? -45 : 0}
                              height={timePeriod === "year" ? 60 : 40}
                            />
                            <YAxis 
                              stroke="#d1d5db"
                              tick={{ fontSize: 10, fill: "#6b7280" }}
                              width={35}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "2px solid #3b82f6",
                                borderRadius: "8px",
                                padding: "10px",
                                fontSize: "11px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              }}
                              formatter={(value: any) => {
                                const numValue = typeof value === 'number' ? value : 0;
                                return [`₹${numValue.toLocaleString()}`, "Revenue"];
                              }}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              dot={{ fill: "#3b82f6", r: 3 }}
                              activeDot={{ r: 5 }}
                              fillOpacity={1}
                              fill="url(#colorRevenue)"
                              isAnimationActive={true}
                              name="Revenue"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Tablet View */}
                  <div className="hidden sm:block lg:hidden">
                    <div className="overflow-x-auto -mx-6 px-6">
                      <div style={{ minWidth: timePeriod === "year" ? "400px" : "500px" }}>
                        <ResponsiveContainer width={timePeriod === "year" ? 400 : 500} height={300}>
                          <LineChart 
                            data={data.revenueChart}
                            key={`revenue-tablet-${JSON.stringify(data.revenueChart.map(d => d.revenue).join(','))}`}
                            margin={timePeriod === "year" ? { top: 15, right: 20, left: 50, bottom: 70 } : { top: 15, right: 20, left: 50, bottom: 50 }}
                          >
                            <defs>
                              <linearGradient id="colorRevenueTb" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#9ca3af"
                              tick={{ fontSize: 11, fill: "#6b7280" }}
                              interval={timePeriod === "year" ? 0 : Math.ceil(data.revenueChart.length / 6) - 1}
                              angle={timePeriod === "year" ? -45 : 0}
                              height={timePeriod === "year" ? 70 : 50}
                            />
                            <YAxis 
                              stroke="#9ca3af"
                              tick={{ fontSize: 11, fill: "#6b7280" }}
                              label={{ value: "Revenue (₹)", angle: -90, position: "insideLeft", fontSize: 11 }}
                              width={45}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "2px solid #3b82f6",
                                borderRadius: "8px",
                                padding: "12px",
                                fontSize: "12px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              }}
                              formatter={(value: any) => {
                                const numValue = typeof value === 'number' ? value : 0;
                                return [`₹${numValue.toLocaleString()}`, "Revenue"];
                              }}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="#3b82f6"
                              strokeWidth={2.5}
                              dot={{ fill: "#3b82f6", r: 4 }}
                              activeDot={{ r: 6 }}
                              fillOpacity={1}
                              fill="url(#colorRevenueTb)"
                              isAnimationActive={true}
                              name="Revenue"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden lg:block">
                    <ResponsiveContainer width="100%" height={380}>
                      <LineChart 
                        data={data.revenueChart}
                        key={`revenue-desktop-${JSON.stringify(data.revenueChart.map(d => d.revenue).join(','))}`}
                        margin={timePeriod === "year" ? { top: 20, right: 30, left: 70, bottom: 80 } : { top: 20, right: 30, left: 70, bottom: 60 }}
                      >
                        <defs>
                          <linearGradient id="colorRevenueDesktop" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={true} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9ca3af"
                          tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                          interval={timePeriod === "year" ? 0 : Math.ceil(data.revenueChart.length / 8) - 1}
                          angle={timePeriod === "year" ? -45 : 0}
                          height={timePeriod === "year" ? 80 : 60}
                        />
                        <YAxis 
                          stroke="#9ca3af"
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          label={{ value: "Revenue (₹)", angle: -90, position: "insideLeft", fontSize: 12, offset: 15 }}
                          width={60}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "2px solid #3b82f6",
                            borderRadius: "10px",
                            padding: "14px",
                            fontSize: "13px",
                            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                          }}
                          formatter={(value: any) => {
                            const numValue = typeof value === 'number' ? value : 0;
                            return [`₹${numValue.toLocaleString()}`, timePeriod === "year" ? "Monthly Revenue" : "Daily Revenue"];
                          }}
                          labelFormatter={(label) => `${timePeriod === "year" ? "Month" : "Date"}: ${label}`}
                          cursor={{ stroke: "#3b82f6", strokeWidth: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: "#3b82f6", r: timePeriod === "year" ? 6 : 5 }}
                          activeDot={{ r: timePeriod === "year" ? 8 : 7, fill: "#1e40af" }}
                          fillOpacity={1}
                          fill="url(#colorRevenueDesktop)"
                          isAnimationActive={true}
                          name={timePeriod === "year" ? "Monthly Revenue" : "Daily Revenue"}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-56 sm:h-72 lg:h-96 text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-100">
                  <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-300 mb-3" />
                  <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-600">No revenue data</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 px-4 text-center">Revenue data will appear as orders are processed</p>
                </div>
              )}
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Orders by Status</h2>
              {statusData && statusData.length > 0 ? (
                <div className="space-y-4">
                  {statusData.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.fill }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 capitalize">{item.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-lg font-bold text-gray-900">{item.value}</span>
                        <p className="text-xs text-gray-500">order{item.value !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  No order data
                </div>
              )}
            </div>
          </div>

          {/* Top Products and Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Top Products - Professional Table View */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-xl font-bold text-gray-900">Top Products by Orders</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Best performing products this month</p>
              </div>
              {data?.topProducts && data.topProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-3 py-3 text-left font-bold text-gray-900 uppercase tracking-wider">Rank</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-900 uppercase tracking-wider">Product Name</th>
                        <th className="px-3 py-3 text-right font-bold text-gray-900 uppercase tracking-wider">Orders</th>
                        <th className="px-3 py-3 text-right font-bold text-gray-900 uppercase tracking-wider">Revenue</th>
                        <th className="px-3 py-3 text-right font-bold text-gray-900 uppercase tracking-wider">Avg Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProducts.map((product, index) => (
                        <tr 
                          key={index} 
                          className="border-b border-gray-100 hover:bg-green-50 transition-colors"
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-bold">
                                {index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 text-lg">•</span>
                              <span className="font-semibold text-gray-900">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="inline-block px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-bold">
                              {product.quantity}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="inline-block px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-bold">
                              ₹{product.value.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span className="font-semibold text-gray-900">
                              ₹{Math.round(product.value / product.quantity).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-56 sm:h-72 lg:h-96 text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-100">
                  <Package className="w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-300 mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-600">No product data available</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 px-4 text-center">Products will appear once orders are placed</p>
                </div>
              )}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-xl font-bold text-gray-900">Recent Orders</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Latest transactions</p>
              </div>
              {data?.recentOrders && data.recentOrders.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                  {data.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 sm:block">
                          <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                            Order #{order.orderNumber}
                          </p>
                          <span
                            className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold capitalize text-white whitespace-nowrap sm:hidden"
                            style={{
                              backgroundColor: STATUS_COLORS[order.status.toLowerCase()] || "#f3f4f6",
                              color: STATUS_COLORS[order.status.toLowerCase()] ? "white" : "#374151",
                            }}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs sm:mt-1 truncate">{order.customerName}</p>
                        <p className="text-gray-400 text-xs mt-0.5 sm:mt-1">{order.createdAt}</p>
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-2">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm">₹{order.total.toLocaleString()}</p>
                        <span
                          className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize text-white"
                          style={{
                            backgroundColor: STATUS_COLORS[order.status.toLowerCase()] || "#f3f4f6",
                            color: STATUS_COLORS[order.status.toLowerCase()] ? "white" : "#374151",
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-56 sm:h-72 lg:h-96 text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-100">
                  <ShoppingCart className="w-7 h-7 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-300 mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-600">No recent orders</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1 px-4 text-center">Orders will appear here once customers purchase</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
