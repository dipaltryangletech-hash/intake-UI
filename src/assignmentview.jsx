import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Layout, ChevronDown, ChevronUp, Clock, User, Hash,
    GripHorizontal, Paperclip, FileText, Flag, Table, List, ChevronLeft
} from 'lucide-react';

const AssignmentView = () => {
    const { id: urlId } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);

    // Fetch data on load
    useEffect(() => {
        const existingEntries = JSON.parse(localStorage.getItem('all_assignments')) || [];
        // Support both ID formats (#411668 or 411668)
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
            <header className="sticky top-0 z-[50] bg-white border-b border-slate-200 px-8 py-3 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <Link to="/assignments" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all">
                        <ChevronLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-500 shadow-sm">
                            <Layout size={18} />
                        </div>
                        <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Assignment Viewer (Read Only)
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                    <Clock size={14} /> Viewing archived snapshot
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 space-y-8 mt-6">
                {/* ID STATS BAR */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 grid grid-cols-4 gap-8 mb-6">
                    <div><p className="text-[9px] font-black text-slate-400 uppercase"><Hash size={10} className="inline mr-1" /> ID</p><p className="text-sm font-bold text-blue-600 mt-2">{assignment.id}</p></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase"><User size={10} className="inline mr-1" /> Creator</p><p className="text-sm font-bold text-slate-800 mt-2">{assignment.createdBy || 'Admin'}</p></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase"><Clock size={10} className="inline mr-1" /> Created</p><p className="text-sm font-bold text-slate-600 mt-2">{assignment.created || assignment.createdOn}</p></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase"><Flag size={10} className="inline mr-1" /> Priority</p><p className="text-sm font-bold text-blue-500 mt-2">{assignment.priority || 'Medium'}</p></div>
                </div>

                {/* BLUE INFO CARD */}
                <div className="bg-[#2563EB] rounded-xl p-6 shadow-2xl text-white border border-[#2d4a9b]">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-8 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-[#bfdbfe] uppercase tracking-widest block mb-2">Client Name</label>
                                    <div className="w-full bg-[#1B52C9]/50 border border-[#2d4a9b] rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
                                        {assignment.client}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-[#bfdbfe] uppercase tracking-widest block mb-2">Assignment Name</label>
                                    <div className="w-full bg-[#1B52C9]/50 border border-[#2d4a9b] rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
                                        {assignment.name}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-[#bfdbfe] uppercase tracking-widest block mb-2">Description</label>
                                <div className="w-full bg-[#1B52C9]/50 border border-[#2d4a9b] rounded-xl px-4 py-3 text-sm font-semibold text-white min-h-[60px]">
                                    {assignment.description || 'No description provided for this assignment.'}
                                </div>
                            </div>
                        </div>
                        <div className="col-span-4 flex flex-col justify-center border-l border-white/10 pl-6">
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest">Assignment Status</p>
                                <div className="mt-2 inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-full font-black text-xs uppercase shadow-lg">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    {assignment.status}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTIONS & QUESTIONS */}
                <div className="space-y-10">
                    {assignment.sections?.map((section, sIdx) => (
                        <div key={section.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50/50 border-b border-slate-100 p-4 flex items-center justify-between">
                                <h3 className="font-bold text-slate-600 text-sm uppercase tracking-tight ml-2">
                                    {section.name || `Section ${sIdx + 1}`}
                                </h3>
                                <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap">
                                    {section.questions.length} Requirements
                                </span>
                            </div>

                            <div className="p-4 space-y-6">
                                {section.questions.map((q, qIdx) => (
                                    <div key={q.id} className="border border-slate-100 rounded-xl bg-white shadow-sm overflow-hidden transition-all">
                                        <div className="p-3 bg-slate-50/30 flex items-center gap-3 border-b border-slate-50">
                                            <span className="w-7 h-7 rounded-full bg-blue-50 text-[10px] font-black flex items-center justify-center text-blue-400 border border-blue-100">
                                                {qIdx + 1}
                                            </span>
                                            <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                                                {q.title || "Untitled Question"}
                                            </span>
                                        </div>

                                        <div className="p-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Guidance</label>
                                                    <div className="text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                                                        {q.guidance || 'No specific guidance provided.'}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Type</label>
                                                    <div className="p-2 rounded-lg border bg-white text-[11px] font-black text-slate-500 uppercase">
                                                        {q.answerType?.replace('_', ' ')}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 pb-1">
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" disabled checked={q.isMandatory} className="w-4 h-4 rounded text-blue-600" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">Mandatory</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" disabled checked={q.allowUpload} className="w-4 h-4 rounded text-blue-600" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">File Upload</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Options Display */}
                                            {(q.answerType === 'MULTIPLE_CHOICE' || q.answerType === 'CHECKBOX') && q.options?.length > 0 && (
                                                <div className="mt-4 grid grid-cols-2 gap-2">
                                                    {q.options.map((opt, i) => (
                                                        <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-500">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-300" /> {opt.text}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Table Columns Display */}
                                            {q.answerType === 'TABLE' && q.tableColumns?.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {q.tableColumns.map((col, i) => (
                                                        <div key={i} className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-black text-blue-600 uppercase">
                                                            <Table size={10} className="inline mr-1" /> {col.name} ({col.type})
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {q.attachedFileName && (
                                                <div className="mt-2 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
                                                    <Paperclip size={14} className="text-emerald-600" />
                                                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Reference: {q.attachedFileName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* STATS SUMMARY BOX */}
                <div className="bg-[#0f172a] rounded-2xl p-8 text-white shadow-2xl flex justify-between items-center border border-slate-700/50 mt-12">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-8 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                            <div className="w-6 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-widest">Snapshot Summary</h4>
                            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Non-modifiable document</p>
                        </div>
                    </div>
                    <div className="flex gap-12 pr-8">
                        <div className="text-center">
                            <p className="text-2xl font-black text-blue-400 leading-none">{assignment.sections?.length || 0}</p>
                            <p className="text-[9px] font-black text-slate-500 uppercase mt-1">Blocks</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-black text-blue-400 leading-none">
                                {assignment.sections?.reduce((acc, s) => acc + s.questions.length, 0) || 0}
                            </p>
                            <p className="text-[9px] font-black text-slate-500 uppercase mt-1">Requirements</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AssignmentView;