'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Search, MoreVertical, Shield, Mail, Phone, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Barista';
  status: 'Active' | 'Inactive';
  lastActive: string;
}

const mockStaff: StaffMember[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@cafeintoday.com', phone: '+62 812-3456-7890', role: 'Admin', status: 'Active', lastActive: '2 mins ago' },
  { id: '2', name: 'Maria Garcia', email: 'maria@cafeintoday.com', phone: '+62 812-9876-5432', role: 'Barista', status: 'Active', lastActive: '1 hr ago' },
  { id: '3', name: 'Budi Santoso', email: 'budi@cafeintoday.com', phone: '+62 813-1111-2222', role: 'Barista', status: 'Inactive', lastActive: '2 days ago' },
];

export default function StaffManagerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-white mb-2">Staff Manager</h1>
          <p className="text-gray-400">Manage employee accounts and access roles.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 bg-[var(--color-brand-accent)] text-black hover:bg-white transition-colors">
          <UserPlus className="w-4 h-4" /> Add Staff Member
        </Button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input 
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-[var(--color-brand-accent)] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-500 text-sm">
                <th className="py-4 px-4 font-medium uppercase tracking-wider">Name</th>
                <th className="py-4 px-4 font-medium uppercase tracking-wider">Contact</th>
                <th className="py-4 px-4 font-medium uppercase tracking-wider">Role</th>
                <th className="py-4 px-4 font-medium uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 font-medium uppercase tracking-wider">Last Active</th>
                <th className="py-4 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockStaff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((staff) => (
                <tr key={staff.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 font-semibold">
                        {staff.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-200">{staff.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-400"><Mail className="w-3 h-3" /> {staff.email}</div>
                      <div className="flex items-center gap-2 text-gray-400"><Phone className="w-3 h-3" /> {staff.phone}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${staff.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                      <Shield className="w-3 h-3" /> {staff.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${staff.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Active' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                      {staff.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">{staff.lastActive}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-500 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-2 text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold">Add New Staff</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--color-brand-accent)] focus:outline-none" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                  <input type="email" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--color-brand-accent)] focus:outline-none" placeholder="john@cafeintoday.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                    <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--color-brand-accent)] focus:outline-none" placeholder="+62..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--color-brand-accent)] focus:outline-none appearance-none">
                      <option value="Barista">Barista (Cashier)</option>
                      <option value="Admin">Admin (Manager)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Temporary Password</label>
                  <input type="password" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--color-brand-accent)] focus:outline-none" placeholder="••••••••" />
                </div>
              </div>
              <div className="p-6 bg-white/5 flex gap-3 justify-end border-t border-white/10">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button className="bg-[var(--color-brand-accent)] text-black hover:bg-white border-transparent" onClick={() => setIsAddModalOpen(false)}>Create Account</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
