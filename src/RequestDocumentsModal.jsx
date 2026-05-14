import React from 'react';
import { X, Search, ChevronDown, ChevronRight, Plus, CheckCircle, FileText, Trash2 } from 'lucide-react';

const RequestDocumentsModal = ({
  isOpen,
  onClose,
  modalSearch,
  setModalSearch,
  groups,
  selectedItems,
  handleToggleSelect,
  customDocInput,
  setCustomDocInput,
  handleAddCustomDoc,
  handleRemoveItem,
  handleRequestDocuments,
  expandedGroups,
  toggleExpand,
  isSelected
}) => {
  if (!isOpen) return null;

  // Filter groups based on search
  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
    (g.subgroups && g.subgroups.some(sg => sg.name.toLowerCase().includes(modalSearch.toLowerCase())))
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 scale-in-center">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Request Documents</h2>
            <p className="text-sm text-slate-500 mt-1">Select documents from groups or add a custom request.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content: Document Selection */}
          <div className="flex-[1.5] overflow-y-auto p-6 space-y-6 border-r border-slate-100 scrollbar-hide">

            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search document groups..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
              />
            </div>

            {/* Custom Request Input */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Custom Document Request</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., Driver's License Copy"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={customDocInput}
                  onChange={(e) => setCustomDocInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomDoc()}
                />
                <button
                  onClick={handleAddCustomDoc}
                  disabled={!customDocInput.trim()}
                  className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-100"
                >
                  <Plus size={18} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Document Groups */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Predefined Groups</label>
              <div className="space-y-3">
                {filteredGroups.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No matching groups found.</p>
                  </div>
                ) : (
                  filteredGroups.map(group => {
                    const isExp = expandedGroups[group.id];
                    const allSubSelected = group.subgroups && group.subgroups.length > 0 &&
                      group.subgroups.every(sg => isSelected(sg.id));

                    return (
                      <div key={group.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-md">
                        <div
                          className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => toggleExpand(group.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`transition-transform duration-300 ${isExp ? 'rotate-180' : ''}`}>
                              <ChevronDown size={18} className="text-slate-400" />
                            </div>
                            <span className="font-bold text-slate-700 text-sm">{group.name}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSelect({ id: group.id, name: group.name, type: 'group' }, group.subgroups);
                            }}
                            className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all ${allSubSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600'
                              }`}
                          >
                            {allSubSelected ? 'Deselect Group' : 'Select Group'}
                          </button>
                        </div>

                        {isExp && (
                          <div className="p-2 bg-slate-50/50 border-t border-slate-100 space-y-1">
                            {group.subgroups.map(sg => {
                              const sel = isSelected(sg.id);
                              return (
                                <div
                                  key={sg.id}
                                  onClick={() => handleToggleSelect({ id: sg.id, name: sg.name, type: 'subgroup' })}
                                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${sel ? 'bg-blue-50/50 border border-blue-100 shadow-sm' : 'hover:bg-white'
                                    }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${sel ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200'
                                      }`}>
                                      {sel && <CheckCircle size={14} />}
                                    </div>
                                    <span className={`text-sm font-medium ${sel ? 'text-blue-700' : 'text-slate-600'}`}>{sg.name}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Selection Summary */}
          <div className="flex-1 bg-slate-50 p-6 flex flex-col overflow-hidden">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Request Summary ({selectedItems.length})</h3>

            <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-1 scrollbar-hide">
              {selectedItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                  <FileText size={40} className="mb-2" />
                  <p className="text-xs font-medium">No items selected</p>
                </div>
              ) : (
                selectedItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm animate-in slide-in-from-right-2 duration-200">
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.1em]">
                        {item.id.toString().startsWith('custom-') ? 'Custom' : 'Document'}
                      </span>
                      <span className="text-sm font-semibold text-slate-700 truncate" title={item.name}>{item.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200">
              <button
                onClick={handleRequestDocuments}
                disabled={selectedItems.length === 0}
                className="w-full bg-gradient-to-br from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 hover:from-blue-700 hover:to-blue-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
              >
                Send Request {selectedItems.length > 0 && `(${selectedItems.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDocumentsModal;
