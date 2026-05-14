import React, { useState, useEffect, useRef } from 'react';
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./Context/Auth/AuthContext";
import {
  Plus, Search, MoreVertical, ChevronLeft, CircleAlert,
  ChevronRight, ChevronDown, CircleCheckBig, AlertCircle, Eye, Edit2, Trash, MessageCircle, CheckCircle2, ArrowRightCircle,
  ClipboardCheck, FileText,
  SquarePen,
  FolderPlus
} from 'lucide-react';
import Pagination from './components/pagination';

const Assignments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const canManageAssignments = isAdmin || user?.rights?.includes("Assignment Creation");
  const [activeTab, setActiveTab] = useState('All Assignments');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const menuRef = useRef(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 1. DATA STATE
  // 1. DATA STATE
  const [assignments, setAssignments] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('all_assignments')) || [];

    const initialData = [

      // --- PURANA DATA ---
      { id: '#M-4055', name: 'Rental Application', client: 'Anand Vadaliya', initials: 'AV', status: 'Completed', progress: 100, created: 'May 9, 2026', due: 'Dec 15, 2026', color: 'bg-green-200 text-green-600', sections: [] },
      { id: '#M-9021', name: 'Mortgage Application', client: 'John Smith', initials: 'JS', status: 'Sent', progress: 45, created: 'Mar 10, 2026', due: 'Dec 15, 2023', color: 'bg-slate-100 text-slate-600', sections: [] },
      { id: '#E-3392', name: 'Employment Verification', client: 'Amanda Lee', initials: 'AL', status: 'Needs Clarification', progress: 80, created: 'Mar 08, 2026', due: 'Dec 18, 2023', color: 'bg-blue-50 text-blue-600', sections: [] },
      { id: '#L-1102', name: 'Loan Renewal Pack', client: 'Sarah Jenkins', initials: 'SJ', status: 'Draft', progress: 0, created: 'Mar 12, 2026', due: 'Dec 20, 2023', color: 'bg-indigo-50 text-indigo-600', sections: [] },
      { id: '#K-4431', name: 'KYC Verification', client: 'Global Corp', initials: 'GC', status: 'Submitted', progress: 100, created: 'Mar 01, 2026', due: 'Nov 30, 2023', color: 'bg-slate-200 text-slate-700', sections: [] },
      { id: '#T-0098', name: 'Tax Audit Docs', client: 'Michael Brown', initials: 'MB', status: 'Overdue', progress: 25, created: 'Feb 25, 2026', due: 'Nov 10, 2023', color: 'bg-blue-50 text-blue-600', sections: [] },
      { id: '#P-5521', name: 'Identity Check', client: 'Emily Davis', initials: 'ED', status: 'Ready for Review', progress: 90, created: 'Mar 15, 2026', due: 'Dec 22, 2023', color: 'bg-purple-50 text-purple-600', sections: [] },
    ];

    const combined = [...saved, ...initialData];
    const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    return unique;
  });


  useEffect(() => {
    try {
      localStorage.setItem('all_assignments', JSON.stringify(assignments.filter(a => !a.id.startsWith('#M-') && !a.id.startsWith('#E-'))));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn("Assignments storage quota exceeded.");
      }
    }
  }, [assignments]);

  // 2. FILTER LOGIC
  const filteredAssignments = assignments.filter(item => {
    let matchesTab = false;
    if (activeTab === 'All Assignments') {
      matchesTab = true;
    } else if (activeTab === 'My Assignments') {
      matchesTab = (
        item.reviewer1 === user?.name ||
        item.reviewer2 === user?.name ||
        item.finalApprover === user?.name
      );
    } else {
      matchesTab = item.status === activeTab;
    }

    const matchesSearch = (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.client || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Calculate pagination
  const currentRowsPerPage = rowsPerPage === "" ? 1 : Number(rowsPerPage);
  const totalPages = Math.ceil(filteredAssignments.length / currentRowsPerPage) || 1;
  const startIdx = (currentPage - 1) * currentRowsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIdx, startIdx + currentRowsPerPage);

  // Reset to page 1 if current page exceeds total pages after filtering
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredAssignments.length, totalPages, currentPage]);

  const stats = [
    { label: 'TOTAL ACTIVE', value: assignments.length.toString(), subValue: '+12%', subColor: 'text-green-500' },
    { label: 'PENDING REVIEW', value: assignments.filter(a => a.status === 'Ready for Review').length.toString(), subValue: 'Action Req.', subColor: 'text-blue-600' },
    { label: 'NEEDS CLARIFICATION', value: assignments.filter(a => a.status === 'Needs Clarification').length.toString(), subValue: 'Waiting', subColor: 'text-amber-500' },
    { label: 'COMPLETED', value: assignments.filter(a => a.status === 'Completed').length.toString(), subValue: 'Last 30d', subColor: 'text-slate-400' },
    { label: 'OVERDUE', value: assignments.filter(a => a.status === 'Overdue').length.toString(), isAlert: true, subColor: 'text-red-500' },
  ];

  const tabs = ['My Assignments', 'All Assignments', 'Draft', 'Sent', 'Needs Clarification', 'Submitted', 'Overdue', 'Archived'];


  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('all_assignments')) || [];
    setAssignments(data);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleAction = (type, item) => {
    const cleanId = item.id.replace('#', '');

    if (type === 'view') {
      navigate(`/assignments/view/${cleanId}`);
    }
    else if (type === 'edit') {
      navigate(`/assignments/edit/${cleanId}`);
    }

    setOpenMenuId(null);
  };



  const handleDelete = (id) => {
    setDeleteConfirmId(id);
    setOpenMenuId(null);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    const updated = assignments.filter(item => item.id !== deleteConfirmId);
    setAssignments(updated);
    setDeleteConfirmId(null);
    toast.success("Assignment deleted successfully!", {
      icon: <CheckCircle2 className="text-blue-500" />,
      className: "border-l-4 border-l-blue-500 rounded-xl shadow-lg"
    });
  };

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Sent': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Needs Clarification': return 'bg-amber-50 text-amber-600 border-amber-100 ';
      case 'Draft': return 'bg-slate-50 text-slate-500 border-slate-200';
      case 'Submitted': return 'bg-green-50 text-green-600 border-green-100';
      case 'Ready for Review': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Completed': return 'bg-slate-900 text-white border-slate-900';
      case 'Overdue': return 'bg-red-50 text-red-600 border-red-100';
      case 'Archived': return 'bg-slate-100 text-slate-400 border-slate-200';
      case 'Open for Resubmission': return 'bg-orange-50 text-orange-600 border-orange-200';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const handleArchive = () => {
    if (selectedIds.length === 0) {
      toast.info("Please select assignments to archive.");
      return;
    }
    const updated = assignments.map(a =>
      selectedIds.includes(a.id) ? { ...a, status: 'Archived' } : a
    );
    setAssignments(updated);
    setSelectedIds([]);
    toast.success(`${selectedIds.length} assignments archived successfully!`, {
      icon: <ClipboardCheck className="text-blue-500" />
    });
  };

  const toggleSelectAll = () => {
    const archivableAssignments = filteredAssignments.filter(a =>
      a.status === 'Submitted' || a.status === 'Completed'
    );
    if (selectedIds.length === archivableAssignments.length && archivableAssignments.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(archivableAssignments.map(a => a.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getProgressColor = (status) => {
    if (status === 'Overdue') return 'bg-red-500';
    if (status === 'Submitted') return 'bg-green-500';
    if (status === 'Needs Clarification') return 'bg-amber-500';
    if (status === 'Open for Resubmission') return 'bg-orange-500';
    return 'bg-blue-600';
  };

  return (
    <div className="bg-[#f8fafc] px-6 py-2 font-poppins text-slate-900">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track your document collection pipelines.</p>
        </div>
        {canManageAssignments && (
          <Link to="/create-assignment" className="bg-[#1e56d3] text-white px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-md transition-all hover:bg-blue-700">
            <Plus size={18} strokeWidth={3} /> Create New Assignment
          </Link>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stat.value}</span>
              {stat.isAlert ? <AlertCircle size={16} className="text-red-500 mb-0.5" /> : <span className={`text-[11px] font-bold ${stat.subColor}`}>{stat.subValue}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200 mb-4 gap-4">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-sm font-medium whitespace-nowrap transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
            </button>
          ))}
          {selectedIds.length > 0 && (
            <button
              onClick={handleArchive}
              className="mb-4 px-3 py-1.5 bg-blue-50 text-blue-500 text-[11px] font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-all flex items-center gap-1.5 shadow-sm animate-in fade-in zoom-in-95 duration-200"
            >
              <ClipboardCheck size={14} /> Archived Assignments
            </button>
          )}
        </div>
        <div className="relative mb-4 lg:mb-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search assignments..."
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-full lg:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Assignments Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-visible">
        <div className="overflow-visible overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px] table-fixed">
            {/* table-fixed lagane se colgroup perfect kaam karta hai */}

            <colgroup>
              {[2, 16, 15, 12, 12, 10, 9, 9, 16].map((width, idx) => (
                <col key={idx} style={{ width: `${width}%` }} />
              ))}
            </colgroup>

            <thead>
              <tr className="bg-slate-100/50 border-b border-slate-200">
                <th className="px-2 py-2 pl-3 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                    checked={selectedIds.length === filteredAssignments.filter(a => a.status === 'Submitted' || a.status === 'Completed').length && filteredAssignments.filter(a => a.status === 'Submitted' || a.status === 'Completed').length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 -ml-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assignment Name</th>
                <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase ">Total Sections & Questions</th>
                <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client</th>
                <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</th>
                <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Created Date</th>
                <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Due Date</th>
                <th className="px-6 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center pr-6">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedAssignments.length > 0 ? paginatedAssignments.map((item) => (
                <tr
                  key={item?.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (user?.role === 'client') {
                      navigate(`/assignment-fill/${item.id.replace('#', '')}`);
                    } else {
                      navigate(`/adminassignmentreview/${item.id.replace('#', '')}`);
                    }
                  }}
                  className={`hover:bg-slate-50 transition-colors group cursor-pointer ${selectedIds.includes(item.id) ? 'bg-blue-50/50' : ''}`}
                >
                  <td className="px-4 py-1 text-center" onClick={(e) => e.stopPropagation()}>
                    {(item.status === 'Submitted' || item.status === 'Completed') && (
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    )}
                  </td>
                  <td className="px-6 py-1"> {/* Padding adjust kiya hai taaki text chipke nahi */}
                    <p className="text-[12px] font-semibold text-slate-700 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">ID: {item.id}</p>
                  </td>
                  <td className="px-6 py-1">
                    <div className="flex items-center gap-2">

                      {/* Sections */}
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-semibold">
                        <span className="opacity-70 text-[14px]">S</span>
                        <span className="opacity-70 text-[12px]">{item.sections?.length || 0}</span>
                      </div>

                      {/* Questions */}
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 text-purple-600 text-[11px] font-semibold">
                        <span className="opacity-70 text-[14px]">Q</span>
                        <span className="opacity-70 text-[12px]">
                          {item.sections?.reduce(
                            (total, sec) => total + (sec.questions?.length || 0),
                            0
                          ) || 0}
                        </span>
                      </div>

                    </div>
                  </td>
                  <td className="px-6 py-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${item.color}`}>{item.initials}</div>
                      <span className="text-[12px] font-medium text-slate-600 truncate">{item.client}</span>
                    </div>
                  </td>
                  <td className="px-6 py-1">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${getStatusStyles(item.status)}`}>• {item.status}</span>
                  </td>
                  <td className="px-6 py-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${getProgressColor(item.status)} transition-all duration-500`} style={{ width: `${item.progress}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">{item.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-1 text-xs text-center font-medium text-slate-500">{item.created}</td>
                  <td className={`px-6 py-1 text-xs text-center font-medium ${item.status === 'Overdue' ? 'text-red-500' : 'text-slate-500'}`}>{item.due}</td>


                  {/* ... Menu code remains same ... */}
                  <td className="px-6 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      {/* View Button */}
                      <button
                        // onClick={(e) => {
                        //   e.stopPropagation();
                        //   navigate(`/assignments/view/${item.id.replace('#', '')}`);
                        // }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Review PDF"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Message Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/chatbot', { state: { clientId: item.id, name: item.client, view: 'chat' } });
                        }}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Message"
                      >
                        <MessageCircle size={16} />
                      </button>

                      {/* Tasks Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/chatbot', { state: { clientId: item.id, name: item.client, view: 'tasks' } });
                        }}
                        className="p-1.5 text-[#1c90bb] hover:bg-[#b1e1f3]/20 rounded-lg transition-colors"
                        title="Tasks"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 12 A 9 9 0 1 0 12 21" />
                          <path d="M9 12 l 2.5 2.5 L 16 9" />
                          <path d="M19 15 v6 M16 18 h6" />
                        </svg>
                      </button>

                      {/* Documents Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/chatbot', { state: { clientId: item.id, name: item.client, view: 'documents' } });
                        }}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Documents"
                      >
                        <FolderPlus size={16} />
                      </button>



                      {/* Edit Button */}
                      {canManageAssignments && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('edit', item);
                          }}
                          className="p-1.5 text-slate-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={16} />
                        </button>
                      )}

                      {/* Delete Button */}
                      {canManageAssignments && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="px-6 py-20 text-center text-slate-400 font-medium text-sm">No assignments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 bg-slate-50 border-t rounded-b-2xl border-slate-200 overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={filteredAssignments.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop Blur Overlay */}
          <div
            className="absolute inset-0 bg-slate-400/10 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteConfirmId(null)}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-4">
              <div className="flex flex-col items-center text-center">
                <CircleAlert className="text-red-600 rounded-full mb-2" />
                <h3 className="text-xl font-extrabold text-slate-800">Delete Assignment?</h3>
                <p className="text-sm text-slate-500  leading-relaxed">
                  Are you sure you want to delete this assignment?
                </p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-all border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red- 700 shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
                >
                  Delete
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;