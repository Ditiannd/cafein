'use client';

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, Users, DollarSign, Utensils, Activity, ArrowUpRight, Loader2 } from 'lucide-react';
import { useApiQuery } from '@/lib/hooks';
import { api, AnalyticsData } from '@/lib/api';

// Fallback data for empty states
const emptyFinanceData = [
  { name: 'Mon', income: 0, outcome: 0 },
  { name: 'Tue', income: 0, outcome: 0 },
  { name: 'Wed', income: 0, outcome: 0 },
  { name: 'Thu', income: 0, outcome: 0 },
  { name: 'Fri', income: 0, outcome: 0 },
  { name: 'Sat', income: 0, outcome: 0 },
  { name: 'Sun', income: 0, outcome: 0 },
];

const emptyVisitorData = [
  { time: '10:00', visitors: 0 },
  { time: '12:00', visitors: 0 },
  { time: '14:00', visitors: 0 },
  { time: '16:00', visitors: 0 },
  { time: '18:00', visitors: 0 },
  { time: '20:00', visitors: 0 },
];

export default function AdminOverview() {
  const { data: analytics, isLoading } = useApiQuery<AnalyticsData>('analytics', () => api.analytics.getOverview('7d'));

  const financeData = analytics?.financeData?.length ? analytics.financeData : emptyFinanceData;
  const visitorData = analytics?.visitorData?.length ? analytics.visitorData : emptyVisitorData;
  const kpi = analytics?.kpi;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)}k`;
    return `Rp ${amount}`;
  };

  return (
    <div className="p-8 h-full bg-transparent text-[#ECE6DD] font-sans select-none max-w-7xl mx-auto">
      <div className="mb-10 pb-6 border-b border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="section-heading text-3xl sm:text-4xl text-[#FFFFFF] tracking-tight">Executive Dashboard</h1>
            <span className="micro-label bg-[#E5A93C]/10 text-[#E5A93C] px-3 py-1 rounded-full border border-[#E5A93C]/30 shadow-[0_0_10px_rgba(229,169,60,0.1)]">Real-time Telemetry</span>
          </div>
          <p className="supporting-paragraph text-sm text-[#ECE6DD]/70 max-w-xl">Holistic performance auditing and patron engagement analytics across the sanctuary ecosystem.</p>
        </div>
        <div className="flex items-center gap-2 micro-label text-[#ECE6DD]/50">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Synchronized with POS & Sandbox v2</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#E5A93C] animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Luxury Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { title: 'Total Revenue (7d)', value: kpi ? formatCurrency(kpi.totalRevenue) : 'Rp 0', icon: DollarSign, trend: kpi && kpi.totalRevenue > 0 ? '+' + kpi.patronCount + ' orders' : 'No data yet', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { title: 'Patron Footfall', value: kpi ? String(kpi.patronCount) : '0', icon: Users, trend: kpi && kpi.patronCount > 0 ? 'This week' : 'No orders yet', color: 'text-[#E5A93C]', bg: 'bg-[#E5A93C]/10 border-[#E5A93C]/20' },
              { title: 'Peak Canonical Table', value: kpi?.topTable || 'N/A', icon: TrendingUp, trend: kpi?.topTableOrders ? `${kpi.topTableOrders} orders` : 'No data', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
              { title: 'Artisanal Bestseller', value: kpi?.topItem || 'N/A', icon: Utensils, trend: kpi?.topItemSold ? `${kpi.topItemSold} sold` : 'No data', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
            ].map((kpiItem, i) => (
              <div key={i} className="gpu-accelerated card-luxury bg-[#241E19]/50 backdrop-blur-2xl border border-white/10 hover:border-[#E5A93C]/40 p-6 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col justify-between transition-all duration-500 group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl border ${kpiItem.bg} ${kpiItem.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                    <kpiItem.icon className="w-5 h-5" />
                  </div>
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-0.5 tracking-wider uppercase">
                    <span>{kpiItem.trend}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
                <div>
                  <h3 className="micro-label text-[#ECE6DD]/60 mb-2">{kpiItem.title}</h3>
                  <p className="text-2xl font-sans font-normal text-[#FFFFFF] tracking-tight">{kpiItem.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Income vs Outcome Chart */}
            <div className="gpu-accelerated card-luxury bg-[#241E19]/50 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-heading text-xl text-[#FFFFFF] tracking-wide mb-1">Revenue vs Operating Expense</h3>
                  <p className="micro-label text-[#ECE6DD]/50">Weekly financial ledger comparison (in IDR)</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5A93C] shadow-[0_0_10px_currentColor] animate-pulse" />
              </div>
              <div className="h-80 w-full font-sans text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOutcome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#C6C0B4" tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#C6C0B4" tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val/1000}k`} dx={-10} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A241F" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141210', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#ECE6DD', fontSize: '13px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}
                      labelStyle={{ fontFamily: 'var(--font-geist-mono)', color: '#E5A93C', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      itemStyle={{ padding: '2px 0' }}
                      formatter={(value: any) => [`Rp ${Number(value || 0).toLocaleString('id-ID')}`, undefined]}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ECE6DD' }} />
                    <Area type="monotone" name="Income Allocation" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" name="Operating Outflow" dataKey="outcome" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorOutcome)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Visitors Chart */}
            <div className="gpu-accelerated card-luxury bg-[#241E19]/50 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-heading text-xl text-[#FFFFFF] tracking-wide mb-1">Patron Footfall Velocity</h3>
                  <p className="micro-label text-[#ECE6DD]/50">Hourly resort occupancy tracking (24h Window)</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_currentColor] animate-pulse" />
              </div>
              <div className="h-80 w-full font-sans text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visitorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A241F" />
                    <XAxis dataKey="time" stroke="#C6C0B4" tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#C6C0B4" tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(229, 169, 60, 0.05)' }}
                      contentStyle={{ backgroundColor: '#141210', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#ECE6DD', fontSize: '13px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}
                      labelStyle={{ fontFamily: 'var(--font-geist-mono)', color: '#E5A93C', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      itemStyle={{ padding: '2px 0' }}
                    />
                    <Bar name="Patron Headcount" dataKey="visitors" fill="#E5A93C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
