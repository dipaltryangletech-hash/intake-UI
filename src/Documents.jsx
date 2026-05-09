import React, { useState, useEffect } from 'react';
import {
    ChevronRight, ChevronDown, Plus, FolderPlus,
    FileText, CheckCircle, XCircle, RefreshCcw,
    Search, Layers, X, Trash2, Briefcase, Pencil,
    SquarePen
} from 'lucide-react';

const Documents = () => {
    // State for Groups and Documents
    const [groups, setGroups] = useState(() => {
        const saved = localStorage.getItem('document_groups');
        if (saved) {
            return JSON.parse(saved);
        }
        return [
            {
                id: '1',
                name: 'Financial Records',
                isOpen: true,
                selected: false,
                subgroups: [
                    { id: '1-1', name: 'Tax Returns', selected: false, docs: [] }
                ],
                docs: [
                    { id: 'd1', name: 'Income Statement.pdf', status: 'Pending', user: 'John Doe', date: 'Jan 20, 2025' }
                ]
            }
        ];
    });

    useEffect(() => {
        localStorage.setItem('document_groups', JSON.stringify(groups));
    }, [groups]);

    // Modal States
    const [searchQuery, setSearchQuery] = useState('');
    const [activeModal, setActiveModal] = useState(null);
    const [nameInput, setNameInput] = useState('');
    const [editingGroupId, setEditingGroupId] = useState(null);

    // New States for Subgroup Management in Popup
    const [subgroupInput, setSubgroupInput] = useState('');
    const [explanationInput, setExplanationInput] = useState('');
    const [tempSubgroups, setTempSubgroups] = useState([]);
    const [editingSubgroupIndex, setEditingSubgroupIndex] = useState(null);
    const [editingSubgroupText, setEditingSubgroupText] = useState('');
    const [editingSubgroupExplanationText, setEditingSubgroupExplanationText] = useState('');

    const subgroupInputRef = React.useRef(null);

    const [editingMainSubgroupId, setEditingMainSubgroupId] = useState(null);
    const [mainSubgroupEditName, setMainSubgroupEditName] = useState('');
    const [mainSubgroupEditExplanation, setMainSubgroupEditExplanation] = useState('');

    // --- Logic Functions ---

    const handleAddSubgroupToTemp = () => {
        if (subgroupInput.trim()) {
            setTempSubgroups([...tempSubgroups, {
                name: subgroupInput.trim(),
                explanation: explanationInput.trim()
            }]);
            setSubgroupInput('');
            setExplanationInput('');
            setTimeout(() => {
                subgroupInputRef.current?.focus();
            }, 10);
        }
    };

    const handleRemoveSubgroupFromTemp = (index) => {
        setTempSubgroups(tempSubgroups.filter((_, i) => i !== index));
        if (editingSubgroupIndex === index) {
            setEditingSubgroupIndex(null);
            setEditingSubgroupText('');
            setEditingSubgroupExplanationText('');
        }
    };

    const handleSaveEditTempSubgroup = () => {
        if (editingSubgroupIndex !== null) {
            const updated = [...tempSubgroups];
            if (editingSubgroupText.trim() === '') {
                updated.splice(editingSubgroupIndex, 1);
            } else {
                updated[editingSubgroupIndex] = {
                    name: editingSubgroupText.trim(),
                    explanation: editingSubgroupExplanationText.trim()
                };
            }
            setTempSubgroups(updated);
            setEditingSubgroupIndex(null);
            setEditingSubgroupText('');
            setEditingSubgroupExplanationText('');
        }
    };

    const handleEditGroup = (group) => {
        setEditingGroupId(group.id);
        setNameInput(group.name);
        setTempSubgroups(group.subgroups.map(sg => ({ name: sg.name, explanation: sg.explanation || '' })));
        setActiveModal('group');
    };

    const handleDeleteGroup = (id) => {
        if (window.confirm("Are you sure you want to delete this group?")) {
            setGroups(groups.filter(g => g.id !== id));
        }
    };

    const handleDeleteMainSubgroup = (groupId, subId) => {
        if (window.confirm("Are you sure you want to delete this subgroup?")) {
            setGroups(groups.map(g => {
                if (g.id === groupId) {
                    return { ...g, subgroups: g.subgroups.filter(s => s.id !== subId) };
                }
                return g;
            }));
        }
    };

    const handleStartEditMainSubgroup = (sub) => {
        setEditingMainSubgroupId(sub.id);
        setMainSubgroupEditName(sub.name);
        setMainSubgroupEditExplanation(sub.explanation || '');
    };

    const handleSaveMainSubgroupEdit = (groupId) => {
        if (!mainSubgroupEditName.trim()) return;
        setGroups(groups.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    subgroups: g.subgroups.map(s => s.id === editingMainSubgroupId ? {
                        ...s,
                        name: mainSubgroupEditName.trim(),
                        explanation: mainSubgroupEditExplanation.trim()
                    } : s)
                };
            }
            return g;
        }));
        setEditingMainSubgroupId(null);
    };

    const handleSaveGroup = () => {
        if (!nameInput) return;

        if (editingGroupId) {
            setGroups(groups.map(g => {
                if (g.id === editingGroupId) {
                    const formattedSubgroups = tempSubgroups.map(tempSg => {
                        const existing = g.subgroups.find(sg => sg.name === tempSg.name);
                        return existing ? { ...existing, explanation: tempSg.explanation } : {
                            id: Math.random().toString(36).substr(2, 9),
                            name: tempSg.name,
                            explanation: tempSg.explanation,
                            selected: false,
                            docs: []
                        };
                    });
                    return { ...g, name: nameInput, subgroups: formattedSubgroups };
                }
                return g;
            }));
        } else {
            const formattedSubgroups = tempSubgroups.map(tempSg => ({
                id: Math.random().toString(36).substr(2, 9),
                name: tempSg.name,
                explanation: tempSg.explanation,
                selected: false,
                docs: []
            }));

            const newGroup = {
                id: Math.random().toString(36).substr(2, 9),
                name: nameInput,
                isOpen: true,
                selected: false,
                subgroups: formattedSubgroups,
                docs: []
            };
            setGroups([...groups, newGroup]);
        }
        closeModals();
    };

    const closeModals = () => {
        setActiveModal(null);
        setNameInput('');
        setSubgroupInput('');
        setExplanationInput('');
        setTempSubgroups([]);
        setEditingSubgroupIndex(null);
        setEditingSubgroupText('');
        setEditingSubgroupExplanationText('');
        setEditingGroupId(null);
    };

    const handleToggleAllGroups = () => {
        const areAllExpanded = groups.length > 0 && groups.every(g => g.isOpen);
        setGroups(groups.map(g => ({ ...g, isOpen: !areAllExpanded })));
    };

    return (
        <div className="px-6 py-3 font-poppins text-slate-700">

            {/* 1. TOP NAV BAR */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-3">
                <div className="flex flex-col justify-start w-full md:w-auto">
                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Manage Documents</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage and monitor documents.</p>
                    <button
                        onClick={handleToggleAllGroups}
                        className="mt-3 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 text-xs rounded-lg font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 w-max"
                    >
                        {groups.length > 0 && groups.every(g => g.isOpen) ? (
                            <><ChevronDown size={14} /> Collapse All Groups</>
                        ) : (
                            <><ChevronRight size={14} /> Expand All Groups</>
                        )}
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    {/* Button */}
                    <button
                        onClick={() => setActiveModal('group')}
                        className="bg-[#1e56d3] hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-lg font-medium flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Create Group
                    </button>

                    {/* Search */}
                    <div className="relative flex-1 sm:w-80">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none w-full"
                        />
                    </div>
                </div>
            </div>

            {/* 2. MAIN DOCUMENT TABLE (UNTOUCHED UI) */}
            <div className="bg-white rounded-xl  border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-3 py-2 bg-slate-50 border-b border-slate-200 font-semibold text-slate-400 text-xs uppercase tracking-wider">
                    <div className="col-span-6 flex items-center gap-3">
                        <span className='text-[10px] font-bold'>All Groups</span>
                    </div>
                    <div className="col-span-6 flex justify-end pr-3 items-center">
                        <span className='text-[10px] font-bold'>Actions</span>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {groups
                        .map(group => {
                            if (!searchQuery.trim()) return group;

                            const query = searchQuery.toLowerCase();
                            const groupMatches = group.name.toLowerCase().includes(query);
                            const matchingSubgroups = group.subgroups.filter(sub =>
                                sub.name.toLowerCase().includes(query) ||
                                (sub.explanation && sub.explanation.toLowerCase().includes(query))
                            );

                            if (groupMatches) return group;
                            if (matchingSubgroups.length > 0) return { ...group, subgroups: matchingSubgroups };
                            return null;
                        })
                        .filter(Boolean)
                        .map(group => {
                            const isSearching = searchQuery.trim().length > 0;
                            const isExpanded = isSearching || group.isOpen;
                            return (
                                <div key={group.id} className="group-container">
                                    <div onClick={() => setGroups(groups.map(g => g.id === group.id ? { ...g, isOpen: !g.isOpen } : g))} className="grid grid-cols-12 gap-4 py-1 px-2 hover:bg-slate-50 items-center transition-colors">
                                        <div className="col-span-6 flex items-center gap-1">
                                            <button
                                                className=""
                                                onClick={() => setGroups(groups.map(g => g.id === group.id ? { ...g, isOpen: !g.isOpen } : g))}
                                            >
                                                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                                            </button>
                                            <span className=" font-semibold text-slate-800 text-[12px]">{group.name}</span>
                                        </div>
                                        <div className="col-span-6 flex justify-end gap-2 pr-3">
                                            <button
                                                onClick={() => handleEditGroup(group)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg "
                                                title="Edit Group"
                                            >
                                                <SquarePen size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGroup(group.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg "
                                                title="Delete Group"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="bg-slate-50 ">
                                            {group.subgroups.slice().sort((a, b) => a.name.localeCompare(b.name)).map(sub => (
                                                <div key={sub.id} className="grid grid-cols-12 gap-4 py-1 pl-10 border-t border-slate-100 items-center hover:bg-slate-50  transition group">
                                                    {editingMainSubgroupId === sub.id ? (
                                                        <>
                                                            <div className="col-span-10 flex flex-1 gap-3 items-center">
                                                                <input
                                                                    autoFocus
                                                                    className="flex-1 ml-6 text-sm font-semibold text-slate-800 outline-none border-b border-blue-400 bg-blue-50/50 px-1 py-0.5"
                                                                    value={mainSubgroupEditName}
                                                                    onChange={(e) => setMainSubgroupEditName(e.target.value)}
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveMainSubgroupEdit(group.id)}
                                                                    placeholder="Subgroup Name"
                                                                />
                                                                <input
                                                                    className="flex-1 text-sm font-semibold text-slate-800 outline-none border-b border-blue-400 bg-blue-50/50 px-1 py-0.5"
                                                                    value={mainSubgroupEditExplanation}
                                                                    onChange={(e) => setMainSubgroupEditExplanation(e.target.value)}
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveMainSubgroupEdit(group.id)}
                                                                    placeholder="Explanation (Optional)"
                                                                />
                                                            </div>
                                                            <div className="col-span-2 flex justify-end gap-2 pr-5">
                                                                <button onClick={() => handleSaveMainSubgroupEdit(group.id)} className="text-blue-600 hover:text-blue-700 p-1.5">
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                                <button onClick={() => setEditingMainSubgroupId(null)} className="text-red-500 hover:text-red-700  p-1.5">
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div
                                                                className="col-span-10 flex items-center gap-3 cursor-text"
                                                                onDoubleClick={() => handleStartEditMainSubgroup(sub)}
                                                            >
                                                                <span className="ml-4 text-[12px] font-medium text-slate-600 w-1/2 break-words">{sub.name}</span>
                                                                {sub.explanation && (
                                                                    <span className="text-xs text-slate-500 italic py-1 w-1/2 break-words">Explanation : {sub.explanation}</span>
                                                                )}
                                                            </div>
                                                            <div className="col-span-2 flex justify-end gap-2 pr-5 ">
                                                                <button
                                                                    onClick={() => handleStartEditMainSubgroup(sub)}
                                                                    className="p-1.5  text-blue-600 hover:bg-blue-50 rounded-lg "
                                                                    title="Edit Subgroup"
                                                                >
                                                                    <SquarePen size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteMainSubgroup(group.id, sub.id)}
                                                                    className="p-1.5  text-red-600 hover:bg-red-50 rounded-lg "
                                                                    title="Delete Subgroup"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* 3. UPDATED ADD GROUP MODAL */}
            {activeModal === 'group' && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden">

                        {/* Header */}
                        <div className=" bg-slate-50 flex justify-between items-center px-4 py-4 border-b border-slate-200">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">{editingGroupId ? "Edit Group" : "Create New Group"}</h2>
                                <p className="text-sm text-slate-500 mt-1">Manage internal group and subgroup access.</p>
                            </div>
                            <button onClick={closeModals} className="p-2 -mt-3 hover:text-slate-900 rounded-full text-slate-400 transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4 space-y-4">
                            {/* Group Name Section */}
                            <div>

                                <label className="block text-[10px] font-medium text-slate-600 uppercase mb-1 ml-1 tracking-widest">Group <span className="text-red-500">*</span></label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="text-[12px] w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                                    placeholder="Enter Group Name"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                />
                            </div>

                            {/* Subgroup Section */}
                            <div>
                                <div className="grid grid-cols-[1fr_1fr_auto] gap-3 mb-1 ml-1">
                                    <label className="flex items-center gap-2 text-[10px] font-medium text-slate-600 uppercase tracking-widest">
                                        Subgroup<span className="text-red-500 -ml-1">*</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-[10px] font-medium text-slate-600 uppercase tracking-widest">
                                        Explanation
                                    </label>
                                    <div className="w-10"></div>
                                </div>
                                <div className="grid grid-cols-[1fr_1fr_auto] gap-3 mb-3 items-center">
                                    <input
                                        ref={subgroupInputRef}
                                        type="text"
                                        className="text-[12px] w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                                        placeholder="Add Subgroup Name"
                                        value={subgroupInput}
                                        onChange={(e) => setSubgroupInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubgroupToTemp()}
                                    />
                                    <input
                                        type="text"
                                        className="text-[12px] w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none"
                                        placeholder="Explanation"
                                        value={explanationInput}
                                        onChange={(e) => setExplanationInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubgroupToTemp()}
                                    />
                                    <button
                                        disabled={!subgroupInput.trim()}
                                        className="p-1 text-white/100 bg-blue-500 rounded-md flex items-center justify-center w-8 h-8 "
                                        title="Add Subgroup"
                                    >
                                        <Plus size={20} className='cursor-pointer' />
                                    </button>
                                </div>

                                {/* List of Temp Subgroups */}
                                <div className="flex flex-col gap-2 p-2 bg-slate-50 rounded-lg border border-dashed border-slate-200 min-h-[80px] max-h-[320px] overflow-y-auto hide-scrollbar">
                                    {tempSubgroups.length === 0 && (
                                        <div className="m-auto text-[11px] text-slate-400 italic py-4">No subgroups added yet.</div>
                                    )}
                                    {tempSubgroups.map((sg, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 p-1 rounded-lg shadow-sm animate-in fade-in duration-150 group">
                                            {editingSubgroupIndex === idx ? (
                                                <div className="flex flex-1 gap-3">
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        className="flex-1 text-sm font-semibold text-slate-800 outline-none border-b border-blue-400 bg-blue-50/50 px-1 py-0.5"
                                                        value={editingSubgroupText}
                                                        onChange={(e) => setEditingSubgroupText(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEditTempSubgroup()}
                                                        placeholder="Subgroup Name"
                                                    />
                                                    <input
                                                        type="text"
                                                        className="flex-1 text-sm font-semibold text-slate-800 outline-none border-b border-blue-400 bg-blue-50/50 px-1 py-0.5"
                                                        value={editingSubgroupExplanationText}
                                                        onChange={(e) => setEditingSubgroupExplanationText(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEditTempSubgroup()}
                                                        placeholder="Explanation (Optional)"
                                                    />
                                                    <div className="flex gap-1">
                                                        <button onClick={handleSaveEditTempSubgroup} className="text-blue-600 hover:text-blue-700 p-1">
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button onClick={() => setEditingSubgroupIndex(null)} className="text-slate-400 hover:text-slate-600 p-1">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex-1 flex gap-3 cursor-text hover:bg-slate-50 transition rounded"
                                                    onDoubleClick={() => {
                                                        setEditingSubgroupIndex(idx);
                                                        setEditingSubgroupText(sg.name);
                                                        setEditingSubgroupExplanationText(sg.explanation || '');
                                                    }}
                                                >
                                                    <span className="text-sm font-semibold text-slate-600 w-1/2 break-words">{sg.name}</span>
                                                    <span className="text-sm text-slate-400 w-1/2 italic break-words">{sg.explanation || 'No explanation'}</span>
                                                </div>
                                            )}
                                            <button onClick={() => handleRemoveSubgroupFromTemp(idx)} className="text-slate-300 hover:text-red-500 transition-colors ml-4 opacity-0 group-hover:opacity-100 focus:opacity-100">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 px-4 py-4 flex justify-end gap-3 border-t border-slate-100">
                            <button onClick={closeModals} className="px-6 py-2.5 text-slate-500 hover:bg-slate-100 rounded-md transition font-medium text-sm hover:text-slate-700 rounded-xl transition">
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveGroup}
                                disabled={!nameInput}
                                className="px-3 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-100 transition disabled:opacity-50"
                            >
                                {editingGroupId ? "Save Changes" : "Save & Create Group"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;