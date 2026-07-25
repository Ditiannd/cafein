'use client';

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, Users, DollarSign, Utensils } from 'lucide-react';

const financeData = [
  { name: 'Mon', income: 4000, outcome: 2400 },
  { name: 'Tue', income: 3000, outcome: 1398 },
  { name: 'Wed', income: 2000, outcome: 9800 },
  { name: 'Thu', income: 2780, outcome: 3908 },
  { name: 'Fri', income: 1890, outcome: 4800 },
  { name: 'Sat', income: 2390, outcome: 3800 },
  { name: 'Sun', income: 3490, outcome: 4300 },
];

const visitorData = [
  { time: '10:00', visitors: 12 },
  { time: '12:00', visitors: 45 },
  { time: '14:00', visitors: 30 },
  { time: '16:00', visitors: 65 },
  { time: '18:00', visitors: 80 },
  { time: '20:00', visitors: 55 },
];

export default function AdminOverview() {
  return (
    <div className="p-8 h-full bg-white/5 text-foreground">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Real-time cafe performance and analytics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Revenue', value: 'Rp 14.2M', icon: DollarSign, trend: '+12.5%' },
          { title: 'Total Visitors', value: '342', icon: Users, trend: '+5.2%' },
          { title: 'Most Used Table', value: 'Couch (C1)', icon: TrendingUp, trend: '85% occupancy' },
          { title: 'Top Selling', value: 'Oat Milk Latte', icon: Utensils, trend: '124 orders' },
        ].map((kpi, i) => (
          <div key={i} className="bg-background p-6 rounded-2xl border border-white/10 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/5 rounded-xl">
                <kpi.icon className="w-6 h-6 text-[var(--color-brand-accent)]" />
              </div>
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold">{kpi.trend}</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{kpi.title}</h3>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Outcome Chart */}
        <div className="bg-background p-6 rounded-2xl border border-white/10 shadow-sm">
          <h3 className="font-heading font-semibold text-lg mb-6">Income vs Outcome (Weekly)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutcome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                />
                <Legend verticalAlign="top" height={36}/>
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="outcome" stroke="#ef4444" fillOpacity={1} fill="url(#colorOutcome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visitors Chart */}
        <div className="bg-background p-6 rounded-2xl border border-white/10 shadow-sm">
          <h3 className="font-heading font-semibold text-lg mb-6">Today&apos;s Visitor Flow</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="visitors" fill="var(--color-brand-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
