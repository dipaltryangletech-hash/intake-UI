import React, { useState, useEffect } from 'react';
import { X, Briefcase, ShieldCheck } from 'lucide-react';
const USER_RIGHTS = ["Client Creation", "User Creation", "Master Checklist Creation", "Assignment Creation"];

const UserPopup = ({ isOpen, onClose, userData = null, onSave }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', rights: [] });

  useEffect(() => {
    if (isOpen) {
      if (userData) {
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          rights: userData.rights || []
        });
      } else {
        setFormData({ name: '', email: '', phone: '', rights: [] });
      }
    }
  }, [userData, isOpen]);

  if (!isOpen) return null;

  const isEdit = !!userData;

  const handleUpdate = () => {
    onSave(formData);
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-white border-b px-6 py-4 border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{isEdit ? 'Edit User' : 'Create New User'}</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Manage internal user permissions and access.</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1"><X size={20} /></button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={16} className="text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[1.5px]">Basic Information</span>
            </div>

            <div className="space-y-1 pl-1">
              <label className="ml-1 text-[10px] font-medium uppercase text-slate-500 tracking-wider">USER NAME<span className="text-red-500"> *</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter Full Name" className="w-full px-2 py-2.5 bg-white border border-slate-200 rounded-lg text-[12px] focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition" />
            </div>

            {/* Layout stays as grid-cols-2 to keep UI consistent */}
            <div className="grid grid-cols-2 gap-4 mt-2">

              {/* Email field is now always visible */}
              <div className="space-y-1 pl-1">
                <label className="ml-1 text-[10px] font-medium uppercase text-slate-500 tracking-wider">EMAIL ADDRESS<span className="text-red-500"> *</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="eg. name@gmail.com"
                  readOnly={isEdit} // Email cannot be edited if in Edit mode
                  className={`w-full px-2 py-2.5 border border-slate-200 rounded-lg text-[12px] outline-none transition ${isEdit ? 'bg-slate-50 cursor-not-allowed text-slate-400' : 'bg-white'}`}
                />
              </div>

              <div className="space-y-1 pl-1">
                <label className=" ml-1 text-[10px] font-medium uppercase text-slate-500 tracking-wider">PHONE NUMBER<span className="text-red-500"> *</span></label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter Phone Number" className="w-full px-2 py-2.5 bg-white border border-slate-200 rounded-lg text-[12px] outline-none" />
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

            <div className="bg-slate-50 border-t border-slate-100 rounded-xl p-5 grid grid-cols-2 gap-4">
              {USER_RIGHTS.map((right) => (
                <label key={right} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={formData.rights.includes(right)} onChange={() => handleCheckboxChange(right)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer" />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition">{right}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-[#f8fafc] border-t  px-6 py-4 border-slate-100 flex justify-end items-center gap-4">
          <button onClick={onClose} className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 transition">
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="bg-[#1e56d3] hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {isEdit ? 'Update User' : 'Save & Invite User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPopup;