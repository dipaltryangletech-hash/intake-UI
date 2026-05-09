import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, Navigate, useNavigate } from "react-router-dom";
import {
  ChevronLeft, User, Mail, Phone, FileText, CheckCircle, CircleCheckBig,
  Clock, Eye, MoveRight, MoreVertical, Trash2,
  SquarePen
} from 'lucide-react';

const ClientDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.state?.id;

  // --- STATE FOR MENU AND DATA ---
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Use a unique key for assignments based on the client ID
  const storageKey = `assignments_client_${id}`;

  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    // Default fallback data
    return [
      { id: 'DOC-4421', name: 'Annual Compliance Audit', assigned: 'Sep 28, 2023', dueDate: 'Oct 15, 2023', status: 'IN REVIEW', color: 'bg-orange-50 text-orange-600', isOverdue: true },
      { id: 'DOC-4425', name: 'Partnership Agreement', assigned: 'Oct 02, 2023', dueDate: 'Oct 30, 2023', status: 'PENDING', color: 'bg-blue-50 text-blue-600', isOverdue: false },
      { id: 'DOC-4410', name: 'Quarterly Risk Assessment', assigned: 'Sep 15, 2023', dueDate: 'Sep 30, 2023', status: 'COMPLETED', color: 'bg-green-50 text-green-600', isOverdue: false },
    ];
  });





  // --- PERSIST TO LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(assignments));
  }, [assignments, storageKey]);

  // --- CLICK OUTSIDE HANDLER ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!id) return <Navigate to="/clients" replace />;

  const allClients = JSON.parse(localStorage.getItem("client")) || [];
  const client = allClients.find(c => c.id === Number(id)) || {
    name: "John Smith",
    company: "Senior Partner at Smith Global",
    email: "j.smith@smithglobal.com",
    phone: "+1 (555) 902-4412",
    status: "Active Member"
  };


  useEffect(() => {
    const loadData = () => {
      const allAsg = JSON.parse(localStorage.getItem('all_assignments')) || [];

      // Filter assignments where the client name matches this dashboard's client
      const filtered = allAsg.filter(asg => asg.client === client.name);
      setAssignments(filtered);
    };

    loadData();
    // Optional: listen for storage changes if you have multiple tabs open
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [client.name]);

  // --- ACTION HANDLERS ---
  const handleView = (docId) => {
    navigate('/clientassignment', { state: { assignmentId: docId } });
  };

  const handleEdit = (doc) => {
    // You can navigate to an edit page or open a modal
    // Example: navigate('/edit-assignment', { state: { doc } });
    console.log("Edit assignment:", doc.id);
  };

  const handleDelete = (docId) => {
    if (window.confirm("Are you sure you want to delete this assignment from the ledger?")) {
      const updated = assignments.filter(a => a.id !== docId);
      setAssignments(updated);
      setOpenMenuId(null);
    }
  };

  const getStatusStyles = (status) => {
    const s = status?.toUpperCase();
    if (s === 'COMPLETED') return 'bg-green-50 text-green-600 border-green-200';
    if (s === 'SUBMITTED') return 'bg-green-50 text-green-600 border-green-200';
    if (s === 'IN REVIEW') return 'bg-orange-50 text-orange-600 border-orange-200';
    if (s === 'OVERDUE') return 'bg-red-50 text-red-600 border-red-200';
    return 'bg-slate-50 text-slate-600 border-slate-200'; // Default / Pending
  };

  const getProgressColor = (status) => {
    if (status === 'Overdue') return 'bg-red-500';
    if (status === 'Submitted') return 'bg-green-500';
    if (status === 'Needs Clarification') return 'bg-amber-500';
    return 'bg-blue-600';
  };

  const statusColorMap = {
    Overdue: 'bg-red-500',
    Submitted: 'bg-green-500',
    'Needs Clarification': 'bg-amber-500',
  };




  return (
    <div className="min-h-screen bg-[#f8fafc] font-poppins text-slate-900 pb-10">
      {/* HEADER SECTION (Same as yours) */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/clients" className="flex items-center text-slate-600 hover:text-slate-800 transition">
            <ChevronLeft size={20} className='hover:bg-slate-100 rounded-xl' />
            <span className="text-sm font-medium ml-2">Clients</span>
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="text-sm font-medium text-slate-800 tracking-tight">{client.name} Details</h1>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-6 mt-2 space-y-2">
        {/* PROFILE & SUMMARY CARDS (Keeping your exact UI) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ... Your Left Profile Card ... */}
          <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-slate-100 shadow-sm relative">
            <div className="flex items-start gap-8">
              <div className="relative">
                <div className="w-20 h-20 bg-[#eff6ff] rounded-xl flex items-center justify-center">
                  <User size={48} className="text-[#3b82f6]" strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">{client.company}</p>
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <div>
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-sm font-semibold text-slate-700">{client.email}</p>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">Direct Phone</p>
                    <p className="text-sm font-semibold text-slate-700">{client.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status</p>
                  <span className="bg-[#f0fdf4] text-[#16a34a] px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-[#dcfce7]">
                    Active Member
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ... Your Dark Summary Card ... */}
          <div className="bg-[#182136] rounded-xl p-6 text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-[10px] font-medium uppercase tracking-[2px] text-slate-400">Assignment Summary</h3>
                <FileText size={16} className="text-slate-500" />
              </div>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-bold tracking-tight">{assignments.length}</span>
                <span className="text-slate-400 text-sm">Total Jobs</span>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-[12px] font-medium uppercase mb-2">
                  <span className="text-slate-400 tracking-wider">Completed Progress</span>
                  <span className="text-white">{assignments.filter(a => a.status === 'COMPLETED').length} / {assignments.length}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full">
                  <div
                    className="bg-[#3b82f6] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    style={{ width: `${(assignments.filter(a => a.status === 'COMPLETED').length / assignments.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATS ROW (Keeping your exact UI) */}
        <div className="text-[12px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2">
          {[
            { label: 'Client ID', value: `CL-00000${id}`, icon: <User size={18} /> },
            { label: 'Invite Sent', value: 'Oct 01, 2023', icon: <Mail size={18} /> },
            { label: 'Verified', value: 'Oct 02, 2023', icon: <CheckCircle size={18} /> },
            { label: 'Last Login', value: 'Today, 10:45 AM', icon: <Clock size={18} /> },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 flex items-center gap-4 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">{stat.icon}</div>
              <div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* LEDGER TABLE SECTION */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-visible mt-4">
          {/* <div className="bg-slate-50/50 px-6 py-4 rounded-t-xl border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[12px]">Active Assignments Ledger</h3>
            <Link to="/clientassignment" className="text-[#2563eb] text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:underline">
              View All Assignments <MoveRight size={15} />
            </Link>
          </div> */}

          <div className="overflow-visible">
            <table className="w-full text-left">
              <thead>
                <tr className="border border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left first:rounded-tl-xl first:rounded-tr-xl">Document Name</th>
                  <th className="px-6 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Process</th>
                  <th className="px-6 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Due Date</th>
                  <th className="px-6 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center last:rounded-tr-xl last:rounded-br-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assignments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-6 py-2">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium tracking-wider">{doc.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      {doc.progress != null ? (
                        <div className="flex flex-col gap-1">

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(doc.status)}`}
                              style={{ width: `${doc.progress}%` }}
                            ></div>
                          </div>

                          {/* Bottom Row: % + Status */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600">
                              {doc.progress}%
                            </span>


                          </div>

                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">---</span>
                      )}
                    </td>
                    <td className={`px-6 py-2 text-center text-xs font-semibold ${doc.status === 'Overdue' ? 'text-red-500' : 'text-slate-600'}`}>
                      {doc.due || doc.dueDate}
                    </td>
                    <td className="px-6 py-2 text-center">
                      <span
                        className={`px-3 py-1 text-xs font-semibold border rounded-full ${getStatusStyles(doc.status)}`}
                      >
                        {doc.status || '---'}
                      </span>
                    </td>

                    <td className="px-6 py-2">
                      <div className="flex items-start justify-center gap-1">
                        {/* VIEW ICON */}
                        <button
                          onClick={() => handleView(doc.id)}
                          className="p-1.5 flex justify-center items-start text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>

                        {/* EDIT ICON */}
                        <button
                          onClick={() => handleEdit(doc)}
                          className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={16} />
                        </button>



                        {/* DELETE ICON */}
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {assignments.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">No assignments found for this client.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;