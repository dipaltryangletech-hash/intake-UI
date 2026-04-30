import React, { useState, useEffect, useRef } from 'react';
import Header from './header';
import Pagination from './pagination';
import { useNavigate } from "react-router-dom";
import { EllipsisVertical, Eye, SquarePen, MessageCircle, Trash, Search, ChevronDown, Check } from 'lucide-react';
import ClientPopup from './clientpopup';

const STATUS_OPTIONS = ["Active", "Invited", "Inactive", "Archived"];

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  // Initialize Navigate
  const navigate = useNavigate();


  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const [client, setClient] = useState(() => {
    const savedData = localStorage.getItem("client");
    return savedData ? JSON.parse(savedData) : [
      { id: 1, name: 'John Smith', company: 'Smith Global Logistics', email: 'john.smith@example.com', phone: '+1 (555) 123-4567', status: 'Active', inviteDate: '01 Oct, 2026', color: 'bg-slate-200' },
      { id: 2, name: 'Sarah Jenkins', company: 'Jenkins Creative Co.', email: 's.jenkins@jcreative.net', phone: '+1 (555) 987-6543', status: 'Invited', color: 'bg-amber-100 text-amber-700' },
      { id: 3, name: 'Emily Davis', company: 'Davis Architecture', email: 'emily@davis-arch.com', phone: '+1 (555) 234-5678', status: 'Inactive', color: 'bg-slate-100 text-slate-500' },
    ];
  });



  const toggleStatus = (status) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredClients = client.filter((item) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(search) ||
      item.company.toLowerCase().includes(search) ||
      item.email.toLowerCase().includes(search);
    const matchesStatus = selectedStatuses.length > 0 ? selectedStatuses.includes(item.status) : true;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    localStorage.setItem("client", JSON.stringify(client));
  }, [client]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      const remainingClients = client.filter(c => c.id !== id);
      const cleanedClients = remainingClients.map(c => ({
        ...c,
        linkedClients: (c.linkedClients || []).filter(lc => lc.id !== id)
      }));
      setClient(cleanedClients);
    }
  };

  const handleEdit = (clientData) => { setEditData(clientData); setIsOpen(true); };
  const handleCreate = () => { setEditData(null); setIsOpen(true); };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-700';
      case 'Invited': return 'bg-amber-100 text-amber-700';
      case 'Archived': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (

    <div className="flex bg-background text-on-background font-poppins">
      <main className=" flex-1 flex flex-col ">
        <div className="flex-1 px-6 py-2 space-y-5 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col justify-start">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Clients</h2>
              <p className="text-sm text-slate-500 mt-0.5">Manage and monitor client access and status.</p>
            </div>
            <div className="flex justify-end">
              <ClientPopup isOpen={isOpen} setIsOpen={setIsOpen} editData={editData} client={client} setClient={setClient} handleCreate={handleCreate} />
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-2 font-medium text-sm px-3 py-1.5 rounded-md transition-colors ${selectedStatuses.length > 0 ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'}`}
                >
                  {selectedStatuses.length === 0 ? "Filter by Status" :
                    selectedStatuses.length === 1 ? selectedStatuses[0] :
                      `${selectedStatuses.length} Statuses Selected`}
                  <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] overflow-hidden">
                    <div className="py-2">
                      {STATUS_OPTIONS.map((status) => (
                        <div
                          key={status}
                          onClick={() => toggleStatus(status)}
                          className="flex items-center gap-3 w-full px-4 py-2 text-[12px] text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className={`size-4 rounded border flex items-center justify-center transition-colors ${selectedStatuses.includes(status) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
                            {selectedStatuses.includes(status) && <Check size={12} className="text-white" />}
                          </div>
                          <span className={selectedStatuses.includes(status) ? "font-semibold text-slate-900" : ""}>{status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {selectedStatuses.length > 0 && (
                <button onClick={() => setSelectedStatuses([])} className="text-[14px] font-medium text-red-500 transition-colors">Clear Filter</button>
              )}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border-slate-200 border rounded-xl shadow-sm ">
            <div className="">
              <table className="w-full text-left table-fixed">
                <colgroup>
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[8%]" />
                  <col className="w-[8%]" />
                  <col className="w-[9%]" />
                  <col className="w-[7%]" />
                  <col className="w-[8%]" />
                  <col className="w-[8%]" />
                </colgroup>
                <thead className="bg-slate-50 border-b border-slate-200 overflow-hidden">
                  <tr>
                    <th className="px-6 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase first:rounded-tl-xl  ">Client Name</th>
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">Company Name</th>
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">Email</th>
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">Phone</th>
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">Status</th>
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">Last Login</th>
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">Invite Sent</th>
                    <th className="px-3 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">Linked Clients</th>
                    <th className="px-2 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase flex items-center justify-center border-slate-200  last:rounded-tr-xl">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredClients.map((item) => (
                    <tr
                      key={item.id}
                      // Yahan path ko '/client-details' karein
                      onClick={() => navigate('/client-details', { state: { id: item.id } })}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group/row"
                    >
                      <td className="px-6 py-1"><div className="flex items-center gap-2 truncate"><div className={`size-6 shrink-0 rounded-full flex items-center justify-center text-[12px] font-bold ${item.color}`}>{item.initials || item.name.substring(0, 2).toUpperCase()}</div><span className="text-[12px] font-semibold text-slate-900 truncate">{item.name}</span></div></td>
                      <td className="px-2 py-2 text-[12px] text-slate-600 truncate">{item.company}</td>
                      <td className="px-2 py-2 text-[12px] text-slate-600 truncate">{item.email}</td>
                      <td className="px-2 py-2 text-[12px] text-slate-600 truncate">{item.phone}</td>
                      <td className="px-2 py-2"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyles(item.status)}`}><span className="size-1 rounded-full bg-current mr-1.5"></span>{item.status}</span></td>
                      <td className="px-2 py-2 text-[12px] text-slate-500">{item.lastLogin || <span className="italic text-slate-400">—</span>}</td>
                      <td className="px-2 py-2 text-[12px] text-slate-500">{item.inviteDate}</td>
                      <td className="px-3 py-2">
                        <div className="group/avatars relative flex items-center -space-x-2 cursor-default">
                          {item.linkedClients?.slice().sort((a, b) => a.name.localeCompare(b.name)).slice(0, 3).map((lc, index) => {
                            const colors = ['bg-indigo-100 text-indigo-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];
                            const colorClass = colors[index % colors.length];
                            return (
                              <div key={lc.id} className={`size-7 rounded-full ${colorClass} flex items-center justify-center text-[11px] font-bold border-2 border-white shadow-sm ring-1 ring-slate-100/50 relative`} style={{ zIndex: 10 - index }}>
                                {lc.name.charAt(0).toUpperCase()}
                              </div>
                            );
                          })}
                          {item.linkedClients?.length > 3 && (
                            <div className="size-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-bold border-2 border-white shadow-sm ring-1 ring-slate-100/50 relative" style={{ zIndex: 10 }}>
                              +{item.linkedClients.length - 3}
                            </div>
                          )}
                          {(!item.linkedClients || item.linkedClients.length === 0) && (
                            <span className="text-slate-300 text-xs italic">—</span>
                          )}

                          {/* Custom Tooltip */}
                          {item.linkedClients?.length > 0 && (
                            <div className="absolute top-full right-0 mt-2 w-max px-3 py-2 bg-slate-50 text-slate-400 text-[11px] font-medium rounded-lg shadow-xl border border-slate-100 opacity-0 pointer-events-none group-hover/avatars:opacity-100 transition-opacity z-50">
                              <div className="flex flex-col gap-1 text-left">
                                {item.linkedClients.slice().sort((a, b) => a.name.localeCompare(b.name)).map(lc => (
                                  <span key={lc.id}>{lc.name}</span>
                                ))}
                              </div>
                              {/* Upward pointing arrow on the right side */}
                              <div className="absolute bottom-full right-4 border-4 border-transparent border-b-slate-50"></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 text-[12px] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 mt-2">
                          {/* View Icon */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/client-details', { state: { id: item.id } });
                            }}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Message Icon */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/chatbot', { state: { clientId: item.id, name: item.name } });
                            }}
                            className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Message"
                          >
                            <MessageCircle size={16} />
                          </button>

                          {/* Edit Icon */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(item);
                            }}
                            className="p-1 text-slate-500 text-center hover:text-slate-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <SquarePen size={16} />
                          </button>

                          {/* Delete Icon */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between overflow-hidden rounded-b-xl">
              <div className="flex items-center gap-4"><span className="text-[11px] text-slate-500 font-medium tracking-tight whitespace-nowrap">Showing {filteredClients.length} of {client.length} clients</span></div>
              <div className="flex items-center gap-1.5"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Clients;