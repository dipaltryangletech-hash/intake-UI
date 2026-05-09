import React, { useState, useEffect, useRef } from 'react';
import { X, Briefcase, ShieldCheck, User, Users, Search, Plus, Check } from 'lucide-react';
const USER_RIGHTS = ["Client Creation", "User Creation", "Master Checklist Creation", "Assignment Creation"];

const UserPopup = ({ isOpen, onClose, userData = null, onSave }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', rights: [] });
  const [activeTab, setActiveTab] = useState('basic');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClients, setSelectedClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const savedClients = localStorage.getItem("client");
      if (savedClients) {
        setAllClients(JSON.parse(savedClients));
      }

      if (userData) {
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          rights: userData.rights || []
        });
        setSelectedClients(userData.linkedClients || []);
      } else {
        setFormData({ name: '', email: '', phone: '', rights: [] });
        setSelectedClients([]);
      }
      setActiveTab('basic');
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  }, [userData, isOpen]);

  if (!isOpen) return null;

  const isEdit = !!userData;

  const handleUpdate = () => {
    onSave({ ...formData, linkedClients: selectedClients });
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (right) => {
    setFormData(prev => {
      const isSelected = prev.rights.includes(right);
      return { ...prev, rights: isSelected ? prev.rights.filter(r => r !== right) : [...prev.rights, right] };
    });
  };

  const handleSelectAll = () => {
    const allSelected = formData.rights.length === USER_RIGHTS.length;
    setFormData(prev => ({
      ...prev,
      rights: allSelected ? [] : [...USER_RIGHTS]
    }));
  };

  const filteredClients = allClients.filter(client => {
    const search = searchQuery.toLowerCase();
    const isMatch = client.name.toLowerCase().includes(search) || client.company.toLowerCase().includes(search);
    return searchQuery ? isMatch : true;
  });

  const toggleClient = (client) => {
    setSelectedClients(prev => {
      const isSelected = prev.find(sc => sc.id === client.id);
      if (isSelected) {
        return prev.filter(sc => sc.id !== client.id);
      } else {
        return [...prev, client];
      }
    });
    setHighlightedIndex(-1);
  };

  const removeClient = (clientId) => {
    setSelectedClients(prev => prev.filter(c => c.id !== clientId));
  };

  const handleKeyDown = (e) => {
    if (filteredClients.length === 0) return;

    if (e.key === "ArrowDown") {
      setHighlightedIndex(prev => (prev < filteredClients.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      toggleClient(filteredClients[highlightedIndex]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-white border-b px-6 py-5 border-slate-100 shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{isEdit ? 'Edit User' : 'Create New User'}</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium uppercase tracking-wider">Internal access management</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1.5 hover:bg-slate-50 rounded-full"><X size={20} /></button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 border-b border-slate-100 flex gap-8 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-3 text-[13px] font-bold transition-all border-b-2 relative ${activeTab === 'basic' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
          >
            <div className="flex items-center gap-2">
              <User size={16} />
              Basic Details
            </div>
          </button>
          <button
            onClick={() => setActiveTab('assign')}
            className={`py-3 text-[13px] font-bold transition-all border-b-2 relative ${activeTab === 'assign' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
          >
            <div className="flex items-center gap-2">
              <Users size={16} />
              Assign Client
            </div>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 p-6">
          {activeTab === 'basic' ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase size={16} className="text-blue-600" />
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[1.5px]">Basic Information</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1 pl-1">
                    <label className="ml-1 text-[10px] font-medium uppercase text-slate-500 tracking-wider">USER NAME<span className="text-red-500"> *</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter Full Name" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 pl-1">
                      <label className="ml-1 text-[10px] font-medium uppercase text-slate-500 tracking-wider">EMAIL ADDRESS<span className="text-red-500"> *</span></label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="eg. name@gmail.com"
                        readOnly={isEdit}
                        className={`w-full px-4 py-2.5 border border-slate-200 rounded-lg text-[13px] outline-none transition ${isEdit ? 'bg-slate-50 cursor-not-allowed text-slate-400' : 'bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'}`}
                      />
                    </div>

                    <div className="space-y-1 pl-1">
                      <label className=" ml-1 text-[10px] font-medium uppercase text-slate-500 tracking-wider">PHONE NUMBER<span className="text-red-500"> *</span></label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter Phone Number" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-blue-600" />
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[1.5px]">User Rights</span>
                  </div>
                  <button
                    onClick={handleSelectAll}
                    type="button"
                    className="px-3 py-1.5 border border-blue-100 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md hover:bg-blue-100 transition-colors uppercase tracking-wider"
                  >
                    {formData.rights.length === USER_RIGHTS.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 grid grid-cols-2 gap-4">
                  {USER_RIGHTS.map((right) => (
                    <label key={right} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`size-4 rounded border flex items-center justify-center transition-all ${formData.rights.includes(right) ? 'bg-blue-600 border-blue-600 shadow-sm shadow-blue-200' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
                        {formData.rights.includes(right) && <Check size={12} className="text-white" />}
                      </div>
                      <input type="checkbox" checked={formData.rights.includes(right)} onChange={() => handleCheckboxChange(right)} className="hidden" />
                      <span className={`text-sm font-medium transition ${formData.rights.includes(right) ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{right}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[1.5px]">Assign Clients</span>
                </div>



                {/* Search Input */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setHighlightedIndex(e.target.value ? 0 : -1);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search to link clients..."
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-[13px] focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition placeholder:text-slate-400"
                  />
                </div>

                {/* Compact Client List */}
                <div className="bg-white border border-slate-100 rounded-lg max-h-[285px] overflow-y-auto  custom-scrollbar">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client, index) => {
                      const isSelected = selectedClients.some(sc => sc.id === client.id);
                      return (
                        <button
                          key={client.id}
                          onClick={() => toggleClient(client)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={`w-full p-3 text-left flex items-center justify-between gap-2 group transition ${highlightedIndex === index ? 'bg-blue-50' : 'hover:bg-slate-50'
                            } ${isSelected ? 'bg-blue-50/50' : ''}`}
                        >
                          <span className={`text-[13px] truncate ${isSelected ? 'text-blue-700 font-medium' : 'text-slate-700'}`}>
                            {client.name}
                          </span>
                          <div className={`size-5 rounded border flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600 shadow-sm' : 'bg-white border-slate-300 group-hover:border-blue-400'
                            }`}>
                            {isSelected && <Check size={13} className="text-white" />}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-4 text-center text-slate-400">
                      <p className="text-[11px]">No matching clients.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f8fafc] border-t px-6 py-4 border-slate-100 flex justify-end items-center gap-4 shrink-0">
          <button onClick={onClose} className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 transition">
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {isEdit ? 'Update User' : 'Save & Invite User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPopup;
