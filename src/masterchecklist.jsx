import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

import { Link, useNavigate } from "react-router-dom";
import Pagination from './components/pagination';
import {
  Plus,
  Search,
  SlidersHorizontal,
  MoreVertical,
  Eye,
  SquarePen,
  Trash,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import MasterChecklistBuilder from './masterchecklistbuilder';

const MasterChecklist = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('list');
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;
  const handleBack = () => setView('list');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const filterRef = useRef(null);

  const [savedChecklists, setSavedChecklists] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('all_checklists')) || [];
    setSavedChecklists(data);

    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleDelete = (id) => {
    toast(
      ({ closeToast }) => (
        <div className="text-sm">
          <p className="font-semibold mb-2">
            Are you sure you want to delete this checklist?
          </p>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                const updatedList = savedChecklists.filter(item => item.id !== id);
                setSavedChecklists(updatedList);
                localStorage.setItem('all_checklists', JSON.stringify(updatedList));

                toast.success("Checklist deleted successfully!");
                closeToast();
              }}
              className="px-3 py-1 bg-red-500 text-white rounded-md text-xs"
            >
              Yes
            </button>

            <button
              onClick={closeToast}
              className="px-3 py-1 bg-gray-200 rounded-md text-xs"
            >
              No
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false, // ❗ important (so user can click)
        closeOnClick: false,
      }
    );
  };

  const handleEdit = (item) => {
    // Pass the checklist object into the state
    navigate("/builder", { state: { checklist: item } });
  };

  const handleStatusToggle = (status) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const initialChecklistData = [
    { id: 'm1', name: 'Annual IT Infrastructure & Security Audit', sections: '2 Sections', questions: '2 Questions', createdDate: '30/03/2026', lastUpdated: '30/03/2026', status: 'Active' },
    { id: 'm2', name: 'Financial Audit Q3 2024', sections: '8 Sections', questions: '16 Questions', createdDate: 'Oct 12, 2023', lastUpdated: '2h ago', status: 'Active' },
    { id: 'm3', name: 'Compliance ISO 27001', sections: '2 Sections', questions: '6 Questions', createdDate: 'Sep 05, 2023', lastUpdated: 'Yesterday', status: 'Active' },
    { id: 'm4', name: 'Asset Management Log', sections: '4 Sections', questions: '12 Questions', createdDate: 'Nov 20, 2023', lastUpdated: 'Nov 20, 2023', status: 'Archived' },
    { id: 'm5', name: 'Safety Protocol Survey', sections: '2 Sections', questions: '10 Questions', createdDate: 'Dec 01, 2023', lastUpdated: 'Dec 05, 2023', status: 'Active' },
  ];

  const combinedData = [...savedChecklists, ...initialChecklistData];

  // --- DYNAMIC STATS CALCULATION ---
  const dynamicStats = combinedData.reduce((acc, item) => {
    // 1. Calculate Section Count
    let sCount = Array.isArray(item.sections) ? item.sections.length : (parseInt(item.sections) || 0);

    // 2. Calculate Question Count
    let qCount = 0;
    if (Array.isArray(item.sections)) {
      qCount = item.sections.reduce((sum, sec) => sum + (sec.questions?.length || 0), 0);
    } else {
      qCount = parseInt(item.questions) || 0;
    }

    // 3. Aggregate based on status
    if (item.status === 'Archived') {
      acc.archivedSections += sCount;
    } else {
      acc.activeSections += sCount;
    }
    acc.globalQuestions += qCount;

    return acc;
  }, { archivedSections: 0, activeSections: 0, globalQuestions: 0 });

  const stats = [
    { label: 'ARCHIVED SECTIONS', value: dynamicStats.archivedSections.toLocaleString() },
    { label: 'ACTIVE SECTIONS', value: dynamicStats.activeSections.toLocaleString() },
    { label: 'GLOBAL QUESTIONS', value: dynamicStats.globalQuestions.toLocaleString() },
  ];

  // --- FILTER LOGIC ---
  const filteredData = combinedData.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const itemStatus = item.status || 'Active';
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(itemStatus);
    return matchesSearch && matchesStatus;
  });
  console.log("filteredData", filteredData)
  if (view === 'builder') {
    return <MasterChecklistBuilder onCancel={handleBack} />;
  }




  return (
    <div className=" bg-[#f8fafc] font-poppins text-slate-900 pb-10">
      <main className="max-w-[1900px] mx-auto px-6 py-2">
        <div className="max-w-[1800px] mx-auto flex justify-between items-center mb-4">
          <h1 className="text-xl font-black text-[10px] text-slate-800">Master Checklist</h1>
          <Link
            to="/builder"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-md transition-all"
          >
            <Plus size={16} strokeWidth={3} /> Create New Checklist
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-3">
          {stats.map((stat, idx) => (
            <div key={idx} className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${stat.highlighted ? 'border-blue-600' : 'border-transparent'}`}>
              <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">{stat.label}</p>
              <p className="text-4xl font-bold text-slate-700">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="py-2 flex flex-col md:flex-row justify-between items-center gap-1 mb-3">
          <div className="flex items-center gap-4 relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-3 px-4 py-2 border rounded-xl text-sm font-bold shadow-sm transition-all ${selectedStatuses.length > 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-blue-500 hover:bg-blue-50'}`}
            >
              <SlidersHorizontal size={16} />
              {selectedStatuses.length > 0 ? selectedStatuses.join(', ') : 'Filter by Status'}
              {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {selectedStatuses.length > 0 && (
              <button onClick={() => { setSelectedStatuses([]); setIsFilterOpen(false); }} className="text-[#ef4444] text-sm font-bold">Clear Filter</button>
            )}

            {isFilterOpen && (
              <div className="absolute top-full mt-2 left-0 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[100] p-2 animate-in fade-in zoom-in-95 duration-200">
                {['Active', 'Archived'].map((status) => (
                  <label key={status} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer group transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={selectedStatuses.includes(status)}
                      onChange={() => handleStatusToggle(status)}
                    />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-black">{status}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search Checklist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 ">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className='border border-slate-200'>
              <tr className="text-[10px] font-bold bg-slate-50 text-slate-400 uppercase tracking-widest">
                <th className="px-4 py-3 border-b border-slate-100 rounded-tl-xl  ">Checklist Name</th>
                <th className="px-4 py-3  border-b border-slate-100">Total Sections</th>
                <th className="px-4 py-3  border-b border-slate-100 text-center ">Total Questions</th>
                <th className="px-4 py-3  border-b border-slate-100">Status</th>
                <th className="px-4 py-3  border-b border-slate-100">Created Date</th>
                <th className="px-4 py-3  border-b border-slate-100">Last Updated</th>
                <th className="px-4 py-3 rounded-tr-xl border-b flex justify-center items-center border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item, idx) => {
                const sectionCount = Array.isArray(item.sections) ? `${item.sections.length} Sections` : item.sections;
                const questionCount = Array.isArray(item.sections)
                  ? item.sections.reduce((acc, sec) => acc + (sec.questions?.length || 0), 0) + ' Questions'
                  : item.questions;
                return (
                  <tr key={item.id || idx} onClick={() => navigate(`/masterchecklistview/${item.id}`, { state: { id: item.id } })} className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-4 py-1 text-[12px] font-bold text-slate-700 border-b border-slate-100">{item.name || "Untitled"}</td>
                    <td className="px-4 py-1 text-[12px] text-slate-500 border-b border-slate-100 ">
                      <span className="inline-block px-3 py-1 rounded-md text-slate-600 bg-slate-50 text-[10px] font-black uppercase border border-slate-100">
                        {sectionCount}
                      </span></td>
                    <td className="px-4 py-1 text-center border-b border-slate-100">
                      <span className="inline-block px-3 py-1 rounded-md text-blue-600 bg-blue-50 text-[10px] font-black uppercase border border-blue-100">
                        {questionCount}
                      </span>
                    </td>
                    <td className="px-4 py-1 border-b border-slate-100">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${(item.status || 'Active') === 'Active'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                        ● {item.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-1 text-[12px] text-slate-400 border-b border-slate-100">{item.createdDate}</td>
                    <td className="px-4 py-1 text-[12px] text-slate-400 border-b border-slate-100">{item.lastUpdated}</td>
                    <td className="px-4 py-1 border-b border-slate-100 justify-center items-center flex" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {/* View Button */}
                        <button
                          onClick={() => {
                            if (item && item.id) {
                              navigate(`/masterchecklistview/${item.id}`, { state: { checklist: item } });
                            } else {
                              console.error("Item ID is missing!");
                              navigate("/masterchecklistview/unknown", { state: { checklist: item } });
                            }
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                          className="p-1.5 text-slate-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <SquarePen size={16} />
                        </button>

                        {/* Delete Button */}
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
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="px-4 py-2 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Rows per page:</span>
                <div className="flex items-center gap-1 cursor-pointer text-slate-500">
                  <span>10</span>
                  <ChevronDown size={14} />
                </div>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                1 - {filteredData.length} of {filteredData.length}
              </span>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </main >
    </div >
  );
};

export default MasterChecklist;