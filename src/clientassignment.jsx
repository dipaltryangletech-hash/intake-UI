import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Bell, ChevronRight, Calendar, Filter,
  LayoutDashboard, Briefcase, ChevronUp, ChevronDown, Check,
  AlertCircle, TrendingUp, Clock, MoreVertical, X
} from 'lucide-react';

const ClientAssignment = () => {
  const [activeSubTab, setActiveSubTab] = useState('ASSIGNMENTS');
  const [filterTab, setFilterTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const dropdownRef = useRef(null);

  // --- ENHANCED DATA MODEL ---
  const [assignments] = useState([
    { id: 'SEC-2024-001', name: 'Quarterly Security Compliance Review', status: 'IN PROGRESS', progress: 65, dueDate: 'Oct 24, 2024', priority: 'High', owner: 'JD' },
    { id: 'VRA-2024-88', name: 'Vendor Risk Assessment - CloudOps', status: 'NEEDS CLARIFICATION', progress: 42, dueDate: 'Nov 02, 2024', priority: 'Medium', owner: 'SK' },
    { id: 'ARC-2024-12', name: 'Architecture Baseline Validation', status: 'SUBMITTED', progress: 100, dueDate: 'Oct 12, 2024', priority: 'Medium', owner: 'AM' },
    { id: 'POL-2024-05', name: 'Policy Affirmation: Remote Work v3', status: 'COMPLETED', progress: 100, dueDate: 'Oct 01, 2024', priority: 'Low', owner: 'JD' },
    { id: 'HR-2024-115', name: 'New Employee Hardware Provisioning', status: 'OVERDUE', progress: 15, dueDate: 'Oct 18, 2024', priority: 'High', owner: 'BT' },
  ]);

  const uniqueStatuses = Array.from(new Set(assignments.map(a => a.status)));

  // --- STATS CALCULATIONS ---
  const stats = {
    total: assignments.length,
    needsAction: assignments.filter(a => ['OVERDUE', 'NEEDS CLARIFICATION'].includes(a.status)).length,
    completed: assignments.filter(a => a.progress === 100).length,
    avgProgress: Math.round(assignments.reduce((acc, curr) => acc + curr.progress, 0) / assignments.length)
  };

  // --- HANDLERS ---
  const handleToggleStatus = (status) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAssignments.length) setSelectedIds([]);
    else setSelectedIds(filteredAssignments.map(a => a.id));
  };

  const toggleSelectRow = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsStatusOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN PROGRESS': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'NEEDS CLARIFICATION': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'SUBMITTED': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'COMPLETED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'OVERDUE': return 'text-rose-600 bg-rose-50 border-rose-100 animate-pulse';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const filteredAssignments = assignments.filter((asg) => {
    const matchesSearch = asg.name.toLowerCase().includes(searchQuery.toLowerCase()) || asg.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = filterTab === 'ALL' || (filterTab === 'PENDING' && ['IN PROGRESS', 'NEEDS CLARIFICATION', 'OVERDUE'].includes(asg.status)) || (filterTab === 'REVIEW' && asg.status === 'SUBMITTED');
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(asg.status);
    return matchesSearch && matchesTab && matchesStatus;
  });

  // --- SUB-COMPONENT: STAT CARD ---
  const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-2xl ${colorClass}`}>
          <Icon size={18} />
        </div>
        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{trend}</span>
      </div>
      <div className="mt-4">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.1em]">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-poppins antialiased">
      {/* Tab Navigation */}
      <div className="px-8 mt-6 border-b border-slate-100 bg-white">
        <div className="flex gap-8">
          {['ASSIGNMENTS', 'DASHBOARD', 'PROFILE'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`text-[11px] font-black tracking-[0.1em] pb-4 transition-all ${activeSubTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="px-6 py-4 max-w-[1800px] mx-auto">
        {/* Header Section */}
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">My Assignments</h2>
            <p className="text-slate-500 mt-1 text-sm">Review and manage your security documentation workflow.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200">
            <Briefcase size={16} /> New Request
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Active" value={stats.total} icon={Briefcase} colorClass="bg-blue-50 text-blue-600" trend="+2.5%" />
          <StatCard title="Needs Action" value={stats.needsAction} icon={AlertCircle} colorClass="bg-rose-50 text-rose-600" trend="High" />
          <StatCard title="Completed" value={stats.completed} icon={Check} colorClass="bg-emerald-50 text-emerald-600" trend="80%" />
          <StatCard title="Avg. Progress" value={`${stats.avgProgress}%`} icon={TrendingUp} colorClass="bg-amber-50 text-amber-600" trend="+12%" />
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-xs w-72 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <div className="h-8 w-[1px] bg-slate-100 mx-2" />
            <div className="bg-slate-50 p-1 rounded-xl flex gap-1">
              {['ALL', 'PENDING', 'REVIEW'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${filterTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3" ref={dropdownRef}>
            <div className="relative">
              <button 
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className={`flex items-center gap-3 border px-4 py-2 rounded-xl text-xs font-bold transition-all outline-none ${statusFilter.length > 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Filter size={14} />
                {statusFilter.length > 0 ? `${statusFilter.length} Selected` : 'Filter Status'}
                {isStatusOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {isStatusOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[100] p-2 overflow-hidden">
                  {uniqueStatuses.map((status) => (
                    <label key={status} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer group transition-colors">
                      <input 
                        type="checkbox" 
                        className="peer appearance-none w-4 h-4 border-2 border-slate-200 rounded checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                        checked={statusFilter.includes(status)}
                        onChange={() => handleToggleStatus(status)}
                      />
                      <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-800 transition-colors">{status}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 w-10">
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll}
                    checked={selectedIds.length === filteredAssignments.length && filteredAssignments.length > 0}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-5">Assignment Details</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5">Progress</th>
                <th className="px-6 py-5">Due Date</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAssignments.map((asg) => (
                <tr key={asg.id} className={`hover:bg-blue-50/30 transition-colors group ${selectedIds.includes(asg.id) ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(asg.id)}
                      onChange={() => toggleSelectRow(asg.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 border border-white shadow-sm">
                        {asg.owner}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{asg.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">ID: {asg.id}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className={`text-[10px] font-bold ${asg.priority === 'High' ? 'text-rose-500' : 'text-slate-400'}`}>
                            {asg.priority} Priority
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black border tracking-tighter shadow-sm ${getStatusColor(asg.status)}`}>
                        {asg.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-40">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-black text-slate-400">{asg.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${asg.status === 'OVERDUE' ? 'bg-rose-500' : 'bg-blue-600'}`}
                          style={{ width: `${asg.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                      <Clock size={14} className="text-slate-300" />
                      {asg.dueDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100">
                        <MoreVertical size={16} />
                      </button>
                      <button className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredAssignments.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-4">
                <Search className="text-slate-200" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No matches found</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">We couldn't find any assignments matching your current search or filters.</p>
              <button 
                onClick={() => {setSearchQuery(''); setStatusFilter([]); setFilterTab('ALL');}}
                className="mt-6 text-blue-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
              >
                Clear all filters <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Footer Pagination (Visual Only) */}
        <div className="mt-8 flex justify-between items-center px-4">
          <p className="text-xs font-bold text-slate-400">Showing {filteredAssignments.length} of {assignments.length} assignments</p>
          <div className="flex gap-2">
             <button className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-400 hover:bg-white transition-all cursor-not-allowed">Previous</button>
             <button className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white transition-all">Next</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientAssignment;