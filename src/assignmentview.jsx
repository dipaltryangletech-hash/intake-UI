import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Layout, ChevronDown, ChevronUp, Clock, User, Hash,
    Paperclip, FileText, Flag, Table, List, ChevronLeft,
    Search, Copy, Save, GripHorizontal, Check
} from 'lucide-react';

// --- SUB-COMPONENT: READ-ONLY QUESTION ---
const ReadOnlyQuestion = ({ q, qIdx }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const answerOptions = [
        { value: "SHORT_TEXT", label: "Short Text" },
        { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
        { value: "LONG_TEXT", label: "Long text" },
        { value: "YES_NO", label: "Yes / No" },
        { value: "TABLE", label: "Table" },
    ];

    // Custom checkbox to ensure color matches screenshot
    const ReadOnlyCheckbox = ({ checked, label }) => (
        <div className="flex items-center gap-4 whitespace-nowrap">
            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${checked ? 'bg-blue-600 border-blue-600 shadow-sm' : 'bg-white border-slate-300'}`}>
                {checked && <Check size={12} strokeWidth={4} className="text-white" />}
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
    );

    return (
        <div className="border border-slate-200 rounded-xl bg-white shadow-sm hover:border-blue-200 transition-all">
            <div
                className={`p-2 flex rounded-t-2xl items-center justify-between cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <div className="text-blue-400 p-1">
                        <GripHorizontal size={16} />
                    </div>
                    <span className="w-7 h-7 rounded-full bg-blue-50 text-[10px] font-black flex items-center justify-center text-blue-400 border border-blue-100">
                        {qIdx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                        {q.title || "QUESTION TITLE REQUIRED..."}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <ChevronDown size={18} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180 text-blue-500' : ''}`} />
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 py-4 space-y-[10px] animate-in fade-in slide-in-from-top-1">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block ml-1">Question Title</label>
                        <div className="w-full text-sm font-medium text-slate-600 border border-slate-200 py-2 px-2 rounded-xl bg-white">
                            {q.title}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Guidance / Remarks</label>
                        <div className="w-full text-sm text-slate-500 bg-slate-50/50 rounded-xl p-2 border border-slate-200 min-h-[60px]">
                            {q.guidance || "No guidance provided."}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                        {/* 1. ANSWER TYPE */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Answer Type</label>
                            <div className="w-full p-2 rounded-md border border-slate-200 bg-white text-[11px] font-bold text-slate-600 flex justify-between items-center uppercase">
                                <span>{answerOptions.find(o => o.value === q.answerType)?.label || q.answerType}</span>
                            </div>
                        </div>

                        {/* 2. MANDATORY */}
                        <ReadOnlyCheckbox checked={q.isMandatory} label="Mandatory" className="rounded-lg" />

                        {/* 3. ALLOW DOCUMENT UPLOAD */}
                        <ReadOnlyCheckbox checked={q.allowUpload} label="Allow Document Upload" />

                        {/* 4. ATTACHED FILE */}
                        <div className="pb-1 flex flex-end max-w-[300px] w-full">
                            {q.attachedFileName && (
                                <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 px-2 py-2 -mb-1 rounded-md">
                                    <FileText size={14} className="text-blue-600" />
                                    <span className="text-[10px] font-bold text-blue-700 truncate max-w-[180px]">
                                        {q.attachedFileName}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DYNAMIC DATA SECTION */}
                    {(q.answerType !== 'SHORT_TEXT' && q.answerType !== 'LONG_TEXT' && q.answerType !== 'YES_NO') && (
                        <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-4 mt-6">
                            {/* OPTIONS LIST */}
                            {(q.answerType === 'MULTIPLE_CHOICE' || q.answerType === 'CHECKBOX') && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <List size={18} className="text-blue-600" />
                                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Options List</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {(q.options || []).map((opt, index) => (
                                            <div key={opt.id} className="flex items-center gap-3">
                                                <div className="flex-1 text-sm font-bold text-slate-700 border border-slate-200 p-2 rounded-xl bg-white shadow-sm">
                                                    {opt.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TABLE CONFIG */}
                            {q.answerType === 'TABLE' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Table size={18} className="text-blue-500" />
                                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Table Columns</span>
                                    </div>
                                    <div className="space-y-1">
                                        {(q.tableColumns || []).map((col, index) => (
                                            <div key={col.id} className="flex flex-col md:flex-row items-center gap-3 bg-white p-2 border border-slate-100 rounded-xl">
                                                <span className="text-[10px] font-bold text-slate-300 px-2 min-w-[24px]">
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1 w-full text-xs font-bold text-slate-700 border border-slate-100 p-2 rounded-xl bg-slate-50/50">
                                                    {col.name}
                                                </div>
                                                <div className="w-full md:w-40 text-[11px] font-black text-slate-500 border border-slate-100 p-2.5 rounded-xl bg-slate-50 flex justify-between items-center">
                                                    <span className="uppercase">{col.type}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- SUB-COMPONENT: READ-ONLY SECTION ---
const ReadOnlySection = ({ section, sIdx }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible relative">
            <div className="relative flex justify-center py-1 bg-slate-50/50 border-b rounded-t-xl border-slate-100 px-2">
                <div className="text-blue-400">
                    <GripHorizontal size={20} />
                </div>
            </div>

            <div className={`p-2 flex items-center justify-between gap-4 ${isExpanded ? 'bg-slate-50/30' : ''}`}>
                <div className="bg-slate-50/50 font-bold text-sm border border-slate-200 ml-2 p-3 rounded-lg uppercase tracking-tight w-full text-slate-600">
                    {section.name || "PLEASE ENTER SECTION NAME..."}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-2 rounded-lg whitespace-nowrap">
                        {section.questions.length} Questions
                    </span>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 space-y-4">
                    <div className="space-y-4">
                        {section.questions.map((q, qIdx) => (
                            <ReadOnlyQuestion
                                key={q.id}
                                q={q}
                                qIdx={qIdx}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const AssignmentView = () => {
    const { id: urlId } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);

    useEffect(() => {
        const existingEntries = JSON.parse(localStorage.getItem('all_assignments')) || [];
        const cleanId = urlId.startsWith('23') ? `#${urlId.substring(2)}` : urlId.includes('%23') ? urlId.replace('%23', '#') : urlId.startsWith('#') ? urlId : `#${urlId}`;
        const itemToView = existingEntries.find(item => item.id === cleanId || item.id === urlId);

        if (itemToView) {
            setAssignment(itemToView);
        }
    }, [urlId]);

    if (!assignment) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-600">Assignment Not Found</h2>
                    <Link to="/assignments" className="text-blue-500 mt-4 inline-block font-bold uppercase text-xs">Go Back</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-poppins pb-24 text-slate-900">
            {/* HEADER */}
            <header className="bg-white border-b border-slate-200 px-8 py-2 flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    <Link to="/assignments" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all mr-2">
                        <ChevronLeft size={20} />
                    </Link>
                    <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200">
                        <Layout size={18} />
                    </div>
                    <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Edit Assignment
                    </h1>
                </div>

                <div className="flex items-center gap-5">
                    <button className="bg-blue-50 text-blue-600 border-2 border-blue-300 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-50 cursor-not-allowed">
                        <Save size={14} /> Save & Draft
                    </button>
                    <button className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center gap-2 opacity-50 cursor-not-allowed">
                        <Save size={14} /> Update Assignment
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 space-y-8">
                {/* STATS BAR */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 grid grid-cols-4 gap-8 mb-6 animate-in fade-in slide-in-from-top-4">
                    <div><p className="text-[9px] font-black text-slate-400 uppercase"><Hash size={10} className="inline mr-1" /> ID</p><p className="text-sm font-bold text-blue-600 mt-2">{assignment.id}</p></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase"><User size={10} className="inline mr-1" /> Creator</p><p className="text-sm font-bold text-slate-800 mt-2">{assignment.createdBy || 'Admin User'}</p></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase"><Clock size={10} className="inline mr-1" /> Created</p><p className="text-sm font-bold text-slate-600 mt-2">{assignment.createdOn || assignment.created}</p></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase"><Flag size={10} className="inline mr-1" /> Priority</p><p className="text-sm font-bold text-blue-500 mt-2">{assignment.priority}</p></div>
                </div>

                {/* INFO CARD (Exact Builder Layout) */}
                <div className="bg-[#eff6ff] transition-colors duration-300 rounded-xl p-3 mb-12 text-black border border-[#c7d4f9]">
                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-8 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-gray-700 uppercase mb-2 ml-1 block tracking-[0.2em]">Client Name</label>
                                    <div className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold text-blue-600 flex justify-between items-center">
                                        {assignment.client || "Not Selected"}
                                        <ChevronDown size={16} className="text-blue-600" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-700 uppercase mb-2 ml-1 block tracking-[0.2em]">Assignment Name</label>
                                    <div className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold text-blue-600">
                                        {assignment.name || "Not Provided"}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-700 uppercase mb-2 ml-1 block tracking-[0.2em]">1st Reviewer</label>
                                    <div className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold text-blue-600 flex justify-between items-center">
                                        {assignment.reviewer1 || "Select 1st Reviewer..."}
                                        <ChevronDown size={16} className="text-blue-600" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-700 uppercase mb-2 ml-1 block tracking-[0.2em]">2nd Reviewer</label>
                                    <div className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold text-blue-600 flex justify-between items-center">
                                        {assignment.reviewer2 || "Select 2nd Reviewer..."}
                                        <ChevronDown size={16} className="text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] ml-1 text-gray-700 font-black uppercase mb-2 block tracking-[0.2em]">Description (Optional)</label>
                                <div className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs font-semibold text-blue-600 min-h-[140px]">
                                    {assignment.description || "Describe scope..."}
                                </div>
                            </div>
                        </div>

                        <div className="col-span-4 flex flex-col">
                            <label className="text-[10px] ml-1 font-black text-gray-700 uppercase block tracking-[0.2em]">Set Priority</label>
                            <div className="w-full mt-2 flex justify-between items-center bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-semibold uppercase text-slate-700">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${assignment.priority === 'High' ? 'bg-red-400' : 'bg-emerald-400'}`} />
                                    {assignment.priority || "Medium"}
                                </div>
                                <ChevronDown size={16} className="text-blue-600" />
                            </div>

                            <div className="mt-3">
                                <label className="text-[10px] font-black text-gray-700 uppercase mb-2 ml-1 block tracking-[0.2em]">Final Approver</label>
                                <div className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold text-blue-600 flex justify-between items-center">
                                    {assignment.finalApprover || "Select Final Reviewer..."}
                                    <ChevronDown size={16} className="text-blue-600" />
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className="text-[10px] font-black text-gray-700 uppercase mb-2 ml-1 block tracking-[0.2em]">Select Due Date</label>
                                <div className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 h-[40px] text-xs font-semibold text-blue-600 flex justify-between items-center">
                                    {assignment.date || "dd-mm-yyyy"}
                                    <Clock size={16} className="text-blue-600 opacity-50" />
                                </div>
                            </div>

                            <label className="text-[10px] ml-1 mt-2 font-black text-gray-700 uppercase block tracking-[0.2em]">Select Checklist</label>
                            <button className="mt-2 w-full h-[40px] bg-[#011e5c] text-white rounded-xl font-black text-[11px] uppercase flex items-center justify-center gap-3 opacity-50 cursor-not-allowed">
                                <Copy size={18} /> Copy From Master Checklist
                            </button>
                        </div>
                    </div>
                </div>

                {/* SECTIONS & QUESTIONS */}
                <div className="space-y-10">
                    {assignment.sections?.map((section, sIdx) => (
                        <ReadOnlySection
                            key={section.id}
                            section={section}
                            sIdx={sIdx}
                        />
                    ))}
                </div>

                {/* ADD SECTION PLACEHOLDER */}
                <div className="w-full py-8 border-2 border-dashed border-slate-200 rounded-xl bg-white flex flex-col items-center justify-center gap-3 opacity-50">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300"><FileText size={20} /></div>
                    <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Add Section Block</span>
                </div>
            </main>

            {/* FOOTER STATS */}
            <div className="w-full max-w-5xl mx-auto px-6 mt-12 mb-20">
                <div className="bg-[#0f172a] rounded-2xl p-8 text-white shadow-2xl flex justify-between items-center border border-slate-700/50">
                    <div className="flex items-center gap-4 pl-4">
                        <div className="w-10 h-8 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700"><div className="w-6 h-1 bg-blue-500 rounded-full"></div></div>
                        <div><h4 className="text-xs font-black uppercase tracking-widest">Snapshot Stats</h4><p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Read-only view</p></div>
                    </div>
                    <div className="flex gap-12 pr-8">
                        <div className="text-center"><p className="text-2xl font-black text-blue-400 leading-none">{assignment.sections?.length || 0}</p><p className="text-[9px] font-black text-slate-500 uppercase mt-1">Sections</p></div>
                        <div className="text-center"><p className="text-2xl font-black text-blue-400 leading-none">{assignment.sections?.reduce((acc, s) => acc + s.questions.length, 0) || 0}</p><p className="text-[9px] font-black text-slate-500 uppercase mt-1">Questions</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentView;