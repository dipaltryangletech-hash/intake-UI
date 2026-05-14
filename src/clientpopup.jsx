import React, { useState, useEffect } from "react";
import { Briefcase, UserPlus } from 'lucide-react';

const ClientPopup = ({ isOpen, setIsOpen, editData, setEditData, client, setClient, handleCreate }) => {

  const emptyForm = { name: "", company: "", email: "", phone: "" };
  const [form, setForm] = useState(emptyForm);
  const [linkedClients, setLinkedClients] = useState([]);
  const [searchClient, setSearchClient] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm(editData);
      setLinkedClients(editData.linkedClients || []);
    } else {
      setForm(emptyForm);
      setLinkedClients([]);
    }
    setSearchClient("");
    setShowClientDropdown(false);
  }, [editData, isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const closePopup = () => {
    setIsOpen(false);
    setForm(emptyForm);
    setLinkedClients([]);
    setSearchClient("");
    setShowClientDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const generateInitials = (name) => {
      return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : "??";
    };

    const tailwindColors = [
      'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
      'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700', 'bg-cyan-100 text-cyan-700',
      'bg-indigo-100 text-indigo-700'
    ];
    const randomColor = tailwindColors[Math.floor(Math.random() * tailwindColors.length)];

    const clientId = editData ? editData.id : Date.now();

    if (editData) {
      setClient(client.map(c => c.id === clientId ?
        { ...c, ...form, linkedClients, initials: generateInitials(form.name) } : c
      ));
    } else {
      const newClient = {
        ...form,
        linkedClients,
        id: clientId,
        initials: generateInitials(form.name),
        color: randomColor,
        status: 'Active',
        inviteDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        lastLogin: null
      };
      setClient([newClient, ...client]);
    }
    closePopup();
  };

  return (
    <div className="flex items-center justify-end ">
      <button
        onClick={handleCreate}
        className="w-[30px] sm:w-auto justify-center bg-[#1e56d3] hover:bg-blue-700 text-white px-4 py-2.5 sm:px-3 sm:py-2 text-[13px] sm:text-sm rounded-lg font-medium flex items-center gap-2 shadow-md transition-all active:scale-95"
      >
        <UserPlus size={16} />
        Create Client
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closePopup}></div>

          {/* Modal Container: Added flex and max height controls for internal scrolling */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[35rem] z-10 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
            <button type="button" onClick={closePopup} className="absolute top-3 right-3 sm:right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg z-20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 rounded-t-xl shrink-0">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800 pr-8">
                {editData ? "Edit Client Details" : "Create New Client"}
              </h2>
              <p className="text-[13px] sm:text-sm text-slate-500 mt-1">Please enter the basic details into the system</p>
            </div>

            <div className="flex items-center px-4 sm:px-6 py-2 sm:py-1 mt-1 sm:mt-3 gap-2 shrink-0">
              <Briefcase size={16} className="text-blue-600 shrink-0" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[1.5px]">Basic Information</span>
            </div>

            {/* Form: Configured to handle vertical overflow internally */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto custom-scrollbar pt-2 pb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 sm:gap-y-4 md:gap-x-0">

                  {/* 1. Client Name */}
                  <div className="space-y-1 px-4 sm:px-6 md:pr-3 md:pl-6">
                    <label className="text-[10px] font-medium uppercase text-slate-500 tracking-wider">Client Name<span className="text-red-500"> *</span></label>
                    <input name="name" required value={form.name} onChange={handleChange} placeholder="Enter Full Name" className="text-[12px] sm:text-[13px] w-full px-3 sm:px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                  </div>

                  {/* 2. Company */}
                  <div className="space-y-1 px-4 sm:px-6 md:pl-3 md:pr-6">
                    <label className="text-[10px] font-medium uppercase text-slate-500 tracking-wider">Company</label>
                    <input name="company" value={form.company} onChange={handleChange} placeholder="Enter Company Name" className="text-[12px] sm:text-[13px] w-full px-3 sm:px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                  </div>

                  {/* 3. Email Address */}
                  <div className="space-y-1 px-4 sm:px-6 md:pr-3 md:pl-6">
                    <label className="text-[10px] font-medium uppercase text-slate-500 tracking-wider">Email Address<span className="text-red-500"> *</span></label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@companyname.com"
                      required
                      readOnly={!!editData}
                      className={`text-[12px] sm:text-[13px] w-full px-3 sm:px-4 py-2.5 border border-slate-200 rounded-md focus:ring-1 outline-none transition-all ${editData ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'bg-slate-50 focus:ring-indigo-500'}`}
                    />
                  </div>

                  {/* 4. Phone Number */}
                  <div className="space-y-1 px-4 sm:px-6 md:pl-3 md:pr-6">
                    <label className="text-[10px] font-medium uppercase text-slate-500 tracking-wider">Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 000 000-0000" className="text-[12px] sm:text-[13px] w-full px-3 sm:px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                  </div>
                </div>

                {/* 5. Link Clients */}
                <div className="px-4 sm:px-6 relative">
                  <label className="text-[10px] font-medium uppercase text-slate-500 tracking-[1px]">Link Clients</label>

                  {/* Selected Tags */}
                  {linkedClients.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-2 pb-1 mt-1">
                      {linkedClients.map((c) => (
                        <span key={c.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f4f8ff] text-blue-600 text-[11px] sm:text-[12px] font-medium rounded-md border border-slate-200 shadow-sm">
                          {c.name}
                          <button type="button" onClick={() => setLinkedClients(prev => prev.filter(lc => lc.id !== c.id))} className="text-red-500 hover:text-red-700 transition-colors ml-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search to link clients..."
                      value={searchClient}
                      onChange={(e) => setSearchClient(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const matchingClients = client.filter(c =>
                            (!editData || c.id !== editData.id) &&
                            !linkedClients.some(lc => lc.id === c.id) &&
                            c.name.toLowerCase().includes(searchClient.toLowerCase())
                          );
                          if (matchingClients.length > 0) {
                            setLinkedClients(prev => [...prev, { id: matchingClients[0].id, name: matchingClients[0].name }]);
                            setSearchClient("");
                          }
                        }
                      }}
                      onFocus={() => setShowClientDropdown(true)}
                      onMouseDown={(e) => {
                        if (document.activeElement === e.target) {
                          setShowClientDropdown(prev => !prev);
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none text-[12px] sm:text-[13px] px-3 sm:px-4 py-2.5 shadow-sm transition-all"
                    />

                    {showClientDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 max-h-40 sm:max-h-48 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-md z-50">
                        {client
                          .filter(c =>
                            (!editData || c.id !== editData.id) &&
                            !linkedClients.some(lc => lc.id === c.id) &&
                            c.name.toLowerCase().includes(searchClient.toLowerCase())
                          )
                          .map(c => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setLinkedClients(prev => [...prev, { id: c.id, name: c.name }]);
                                setSearchClient("");
                              }}
                              className="px-3 py-2.5 sm:py-2 text-[12px] sm:text-[13px] text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                            >
                              <span className="font-medium">{c.name}</span>
                              {c.company && <span className="text-slate-400 ml-1">({c.company})</span>}
                            </div>
                          ))}
                        {client.filter(c =>
                          (!editData || c.id !== editData.id) &&
                          !linkedClients.some(lc => lc.id === c.id) &&
                          c.name.toLowerCase().includes(searchClient.toLowerCase())
                        ).length === 0 && (
                            <div className="px-3 py-3 text-[12px] sm:text-[13px] text-center text-slate-400">No clients found</div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer: Stack buttons on mobile, align horizontal on sm+ */}
              <div className="bg-slate-50 border-t border-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 rounded-b-xl shrink-0">
                <button type="button" onClick={closePopup} className="w-full sm:w-auto px-4 sm:px-3 py-2.5 sm:py-2 text-slate-600 hover:text-slate-800 text-[13px] sm:text-sm font-medium hover:bg-slate-100 rounded-md transition-colors border sm:border-transparent border-slate-200">
                  Cancel
                </button>

                <button type="submit" className="w-full sm:w-auto px-4 sm:px-3 py-2.5 sm:py-2 text-[13px] sm:text-sm bg-blue-600 text-white font-medium rounded-md shadow-lg hover:bg-blue-700 transition-colors">
                  {editData ? "Save Changes" : "Create & Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPopup;