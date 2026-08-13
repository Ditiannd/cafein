'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Search, Shield, Mail, Phone, Edit2, Trash2, X, Sparkles, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useApiQuery } from '@/lib/hooks';
import { api, StaffMember } from '@/lib/api';

export default function StaffManagerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', phone: '', role: 'barista' as 'admin' | 'barista', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: staffList, isLoading, refetch } = useApiQuery<StaffMember[]>('staff', () => api.staff.list());

  const handleCreateStaff = async () => {
    if (!newStaff.name || !newStaff.email || !newStaff.password) return;
    setIsSubmitting(true);
    try {
      await api.staff.create({
        name: newStaff.name,
        email: newStaff.email,
        password: newStaff.password,
        role: newStaff.role,
      });
      setIsAddModalOpen(false);
      setNewStaff({ name: '', email: '', phone: '', role: 'barista', password: '' });
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create staff account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveStaff = async (id: string) => {
    if (!confirm('Are you sure you want to remove this personnel account?')) return;
    try {
      await api.staff.delete(id);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove staff account');
    }
  };

  const staff = staffList || [];
  const filteredStaff = staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans select-none text-zinc-100">
      <div className="flex justify-between items-end mb-8 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">Personnel & Role Governance</h1>
            <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 font-bold">RBAC Vault</span>
          </div>
          <p className="text-zinc-400 text-xs font-mono mt-1">Audit executive access grants, barista POS operator credentials, and active terminal sessions.</p>
        </div>
        <Button variant="luxury" onClick={() => setIsAddModalOpen(true)} className="gap-2 text-xs font-bold py-5 px-6">
          <UserPlus className="w-4 h-4 stroke-[3]" />
          <span>Provision Personnel Account</span>
        </Button>
      </div>

      {/* Roster KPI Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 font-mono text-xs">
        <div className="card-luxury bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Total Enrolled Personnel</span>
            <span className="text-2xl font-extrabold text-white font-sans">{staff.length} Roster Accounts</span>
          </div>
        </div>

        <div className="card-luxury bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Admin Accounts</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-sans">{staff.filter(s => s.role === 'admin').length} Administrators</span>
          </div>
        </div>

        <div className="card-luxury bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-bold block">Security & Access Tier</span>
            <span className="text-2xl font-extrabold text-purple-300 font-sans">Dual-Factor RBAC</span>
          </div>
        </div>
      </div>

      <div className="card-luxury bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800/80 font-mono text-xs">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search personnel by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-luxury w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-zinc-600 focus:border-amber-500"
            />
          </div>
          <span className="text-zinc-500 font-bold">Enrolled Records: <span className="text-amber-400">{staff.length}</span></span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-bold bg-zinc-950/80 tracking-wider">
                  <th className="py-4 px-6">Employee Identity</th>
                  <th className="py-4 px-6">Contact Channels</th>
                  <th className="py-4 px-6">Access Role</th>
                  <th className="py-4 px-6">Account Created</th>
                  <th className="py-4 px-6 text-right">Ledger Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans text-sm">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-zinc-900/90 transition-all group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 font-heading font-extrabold text-base shadow-inner shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-heading font-extrabold text-white group-hover:text-amber-300 transition-colors">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-300"><Mail className="w-3 h-3 text-amber-400 shrink-0" /> <span>{member.email}</span></div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-extrabold border uppercase tracking-wider ${
                        member.role === 'admin' 
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                      }`}>
                        <Shield className="w-3 h-3" /> 
                        <span>{member.role} Tier</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-zinc-500">
                      {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right font-mono">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleRemoveStaff(member.id)} className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-400 transition-all" title="Expunge Roster Account"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStaff.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-zinc-500 font-mono">
                      <Users className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
                      No personnel records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-sans">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="card-luxury bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-zinc-100 font-mono text-xs"
            >
              <div className="flex justify-between items-center p-6 border-b border-zinc-800/80 bg-zinc-950/80 font-heading font-extrabold text-base text-white">
                <div className="flex items-center gap-2 text-amber-400">
                  <UserPlus className="w-4 h-4" />
                  <span>Provision New Personnel Account</span>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-xl bg-zinc-800/50 text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              
              <div className="p-6 space-y-4 bg-zinc-950/40">
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1.5">Full Employee Legal Name</label>
                  <input 
                    type="text" 
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                    className="input-luxury w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white font-bold text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1.5">Sanctuary Email Address</label>
                  <input 
                    type="email" 
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                    className="input-luxury w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white font-bold text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1.5">RBAC Access Role</label>
                  <select 
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({...newStaff, role: e.target.value as 'admin' | 'barista'})}
                    className="input-luxury w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white font-bold appearance-none"
                  >
                    <option value="barista">Barista (POS Cashier)</option>
                    <option value="admin">Admin (Executive Manager)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase font-bold mb-1.5 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Initial Temporary Password</span>
                  </label>
                  <input 
                    type="password" 
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                    className="input-luxury w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-white" 
                  />
                </div>
              </div>

              <div className="p-6 bg-zinc-950 flex gap-3 justify-end border-t border-zinc-800/80 font-sans">
                <Button variant="outline" className="flex-1 py-4 font-bold text-xs" onClick={() => setIsAddModalOpen(false)}>Dismiss</Button>
                <Button variant="luxury" className="flex-1 py-4 font-bold text-xs gap-1.5" onClick={handleCreateStaff} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isSubmitting ? 'Provisioning...' : 'Enrol Personnel to Roster'}</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
