import React, { useState, useEffect, useRef } from 'react';
import { X, ClipboardList, Search, Check, ChevronDown } from 'lucide-react';

const MasterChecklistPopup = ({ isOpen, onClose, onCopyData }) => {
  const [masterChecklists, setMasterChecklists] = useState([]);
  const [checklistSearch, setChecklistSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isListOpen, setIsListOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedChecklists = JSON.parse(localStorage.getItem('all_checklists') || '[]');
    setMasterChecklists(storedChecklists);
    if (isOpen) {
      setSelectedIds([]);
      setChecklistSearch("");
      setIsListOpen(false);
    }
  }, [isOpen]);

  // Handle click outside to close the list field
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsListOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredChecklists = masterChecklists.filter(m =>
    m.name.toLowerCase().includes(checklistSearch.toLowerCase())
  );

  const toggleChecklist = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCopyAllData = () => {
    if (selectedIds.length === 0) return;
    const selectedObjects = masterChecklists.filter(m => selectedIds.includes(m.id));
    let mergedSections = [];
    selectedObjects.forEach(checklist => {
      if (checklist.sections) {
        // Deep copy sections to avoid reference issues
        const sectionsCopy = JSON.parse(JSON.stringify(checklist.sections));
        mergedSections = [...mergedSections, ...sectionsCopy];
      }
    });
    onCopyData({ sections: mergedSections });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-visible animate-in zoom-in-95 duration-200">

        {/* HEADER */}
        <div className="bg-slate-50 border-b border-slate-100 rounded-t-2xl">
          <div className="px-5 py-4 flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-slate-800 tracking-tight">Copy from Checklist</h3>
              <p className="text-slate-500 text-sms mt-1 font-normal">Select checklists to import data</p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X size={22} className="text-slate-400 hover:text-slate-700" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-6">
          {/* INFO BADGE */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <ClipboardList size={14} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Checklist Information</span>
          </div>

          {/* SELECT FIELD BOX */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest">
              Select Checklist <span className="text-red-500">*</span>
            </label>

            <div
              onClick={() => setIsListOpen(!isListOpen)}
              className={`w-full bg-slate-50 border-2 rounded-xl px-5 py-3 flex justify-between items-center cursor-pointer transition-all shadow-sm
                ${isListOpen ? 'border-blue-400 ring-4 ring-blue-50 bg-white' : 'border-slate-200 hover:border-slate-200'}`}
            >
              <span className={`text-xs font-bold ${selectedIds.length > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                {selectedIds.length > 0
                  ? `${selectedIds.length} Checklist${selectedIds.length > 1 ? 's' : ''} Selected`
                  : "Click to select checklists..."}
              </span>
              <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isListOpen ? 'rotate-180 text-blue-500' : ''}`} size={18} />
            </div>

            {/* DROPDOWN CONTAINER (Search + List) */}
            {isListOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl animate-in slide-in-from-top-2 overflow-hidden">

                {/* SEARCH BOX INSIDE LIST */}
                <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-[11px] font-semibold outline-none focus:border-blue-400 transition-all"
                      placeholder="Search checklists..."
                      value={checklistSearch}
                      onChange={(e) => setChecklistSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
                    />
                  </div>
                </div>

                {/* SCROLLABLE LIST */}
                <div className="max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
                  {filteredChecklists.length > 0 ? (
                    filteredChecklists.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleChecklist(item.id);
                          }}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all mb-0.5 last:mb-0
                            ${isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all 
                            ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-400 bg-white'}`}>
                            {isSelected && <Check size={10} className="text-white" strokeWidth={4} />}
                          </div>
                          <span className="font-bold text-[11px]">{item.name}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-[10px] font-medium italic">No matching checklists found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 py-3 bg-slate-50 flex justify-end items-center gap-6 border-t border-slate-100 rounded-b-2xl">
          <button
            onClick={onClose}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>

          <button
            onClick={handleCopyAllData}
            disabled={selectedIds.length === 0}
            className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
              ${selectedIds.length > 0
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Copy Data ({selectedIds.length})
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MasterChecklistPopup;