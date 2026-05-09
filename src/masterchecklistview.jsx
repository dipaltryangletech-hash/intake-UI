import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Info, ChevronDown, ChevronUp, GripHorizontal, Table, Paperclip } from 'lucide-react';

const MasterChecklistView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    const [checklist, setChecklist] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});
    const [expandedQuestions, setExpandedQuestions] = useState({});

    useEffect(() => {
        if (location.state && location.state.checklist) {
            setChecklist(location.state.checklist);
            initializeExpansion(location.state.checklist);
        } else {
            const allChecklists = JSON.parse(localStorage.getItem('all_checklists')) || [];
            const foundChecklist = allChecklists.find(item => item.id.toString() === id.toString());

            if (foundChecklist) {
                setChecklist(foundChecklist);
                initializeExpansion(foundChecklist);
            } else {
                console.error("Checklist not found");
            }
        }
    }, [id, location.state]);

    const initializeExpansion = (data) => {
        const secExp = {};
        const qExp = {};
        data.sections?.forEach(sec => {
            secExp[sec.id] = true;
            sec.questions?.forEach(q => {
                qExp[q.id] = true;
            });
        });
        setExpandedSections(secExp);
        setExpandedQuestions(qExp);
    };

    const toggleSection = (id) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleQuestion = (id) => {
        setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (!checklist) {
        return <div className="flex h-screen items-center justify-center font-bold">Loading Checklist Data...</div>;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 font-poppins text-slate-900">
            {/* HEADER */}
            <div className="sticky top-11 z-50 bg-white border-b border-t border-slate-200 px-2 md:px-3 py-2">
                <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/masterchecklist" className="flex items-center text-slate-600 hover:text-slate-600 transition">
                            <ChevronLeft size={20} className='hover:bg-slate-100 rounded-xl ml-3' />
                            <span className="text-sm font-medium ml-2 text-slate-500 hover:text-slate-800">MasterChecklist</span>
                        </Link>
                        <span className="text-slate-300">|</span>
                        <h1 className="text-sm font-medium text-slate-800 tracking-tight">
                            View Checklist: {checklist.name}
                        </h1>
                    </div>

                    <button
                        onClick={() => navigate("/masterchecklist")}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase shadow-lg hover:bg-blue-700 transition-all"
                    >
                        Close Viewer
                    </button>
                </div>
            </div>

            {/* MAIN AREA */}
            <div className="mt-5 max-w-5xl mx-auto p-2 space-y-8">
                {/* BASIC INFO */}
                <section className="relative overflow-visible bg-[#eff6ff] rounded-xl border border-blue-700/50 transition-all duration-500 group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400/20 blur-[100px] rounded-full group-hover:bg-blue-400/30 transition-all duration-700"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>

                    <div className="relative p-2 md:p-3 flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex-1 w-full space-y-3">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] text-gray-700 font-black uppercase tracking-[0.2em] ml-1">Checklist Name</label>
                                <div className="w-full bg-white text-gray-700 text-sm font-medium border border-blue-400/20 rounded-lg px-2 py-2">
                                    {checklist.name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em] ml-1 block">Description</label>
                                <div className="w-full bg-white text-gray-700 text-sm border border-blue-400/20 rounded-xl px-2 py-2 min-h-[60px]">
                                    {checklist.description || "No description provided."}
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-auto lg:min-w-[240px]">
                            <div className="flex p-1 bg-[#fafafa63] rounded-xl border border-[#c7d4f9]">
                                {['Active', 'Archived'].map((statusOption) => {
                                    const isActive = checklist.status === statusOption;
                                    return (
                                        <div
                                            key={statusOption}
                                            className={`flex-1 flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? 'bg-[#000000e0] border border-blue-400/30 text-white shadow-inner' : 'text-slate-400 opacity-50'}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${statusOption === 'Active' ? (isActive ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-emerald-500/40') : (isActive ? 'bg-slate-400 shadow-[0_0_10px_#94a3b8]' : 'bg-white/50 ')}`}></div>
                                            {statusOption}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTIONS */}
                <div className="space-y-6">
                    {checklist.sections?.map((section) => (
                        <div key={section.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible transition-all duration-300 relative">
                            <div className="relative flex justify-center py-2 bg-slate-50 border-b rounded-t-xl border-slate-100 px-4">
                                <div className="text-slate-300 p-1">
                                    <GripHorizontal size={20} />
                                </div>
                            </div>

                            <div className={`p-2 rounded-b-xl border-b border-slate-100 flex items-center justify-between transition-colors ${expandedSections[section.id] ? 'bg-slate-50 border-b border-slate-100' : 'bg-white'}`}>
                                <div className="bg-slate-50 font-bold text-slate-500 text-sm border border-slate-100 ml-2 p-4 rounded-lg uppercase tracking-tight w-full">
                                    {section.name || "Untitled Section"}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="ml-5 text-[10px] w-[90px] font-bold text-slate-400 bg-white text-center px-1 py-1 rounded border border-slate-200">{section.questions?.length || 0} Questions</span>
                                    <button onClick={() => toggleSection(section.id)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
                                        {expandedSections[section.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                </div>
                            </div>

                            {expandedSections[section.id] && (
                                <div className="p-4 space-y-4">
                                    {section.questions?.map((q, qIdx) => (
                                        <div key={q.id} className="group border border-slate-200 rounded-xl overflow-visible bg-white mb-4 shadow-sm">
                                            <div
                                                className={`p-2 flex items-center justify-between cursor-pointer transition-colors ${expandedQuestions[q.id] ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'}`}
                                                onClick={() => toggleQuestion(q.id)}
                                            >
                                                <div className="flex items-center justify-between gap-4 flex-1">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-slate-300 p-1">
                                                            <GripHorizontal size={18} />
                                                        </div>
                                                        <span className="w-7 h-7 rounded-xl bg-slate-100 text-[10px] font-black flex items-center justify-center text-slate-400">{qIdx + 1}</span>
                                                        <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{q.title || "Untitled Question"}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 ml-4">
                                                    <div className="flex items-center gap-2">
                                                        {q.isMandatory && <span className="text-[9px] font-black bg-rose-50 text-rose-500 px-2 py-0.5 rounded border border-rose-100 uppercase tracking-tighter">MANDATORY</span>}
                                                        {q.answerType === 'TABLE' && <Table size={14} className="text-blue-500" />}
                                                    </div>
                                                    <ChevronDown size={18} className={`text-slate-300 transition-transform duration-300 ${expandedQuestions[q.id] ? 'rotate-180 text-blue-500' : ''}`} />
                                                </div>
                                            </div>

                                            {expandedQuestions[q.id] && (
                                                <div className="px-4 pb-4 pt-1 space-y-4">
                                                    <div className="space-y-6">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block ml-1">Question Title</label>
                                                            <div className="w-full font-medium text-slate-700 border border-slate-200 py-2 px-3 rounded-lg bg-slate-50/50">{q.title}</div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Guidance / Remarks</label>
                                                            <div className="w-full text-sm text-slate-500 bg-slate-50/30 rounded-xl p-3 border border-slate-100 min-h-[40px] whitespace-pre-wrap">{q.guidance || "No guidance provided."}</div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Answer Type</label>
                                                            <div className="w-full text-xs font-semibold p-2.5 border-2 border-slate-100 rounded-xl bg-white text-slate-700 uppercase">
                                                                {q.answerType?.replace('_', ' ')}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center pb-2 opacity-60">
                                                            <div className="flex items-center gap-4">
                                                                <input type="checkbox" checked={q.isMandatory} readOnly className="w-4 h-4 rounded-lg border-slate-300 text-blue-600" />
                                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Mandatory</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center pb-2 opacity-60">
                                                            <div className="flex items-center gap-4">
                                                                <input type="checkbox" checked={q.allowUpload} readOnly className="w-4 h-4 rounded text-blue-600" />
                                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Allow Document Upload</span>
                                                            </div>
                                                        </div>

                                                        {q.attachedFileName && (
                                                            <div className="pb-1">
                                                                <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2 max-w-[200px]">
                                                                    <Paperclip size={14} className="text-blue-500" />
                                                                    <span className="text-[10px] font-black text-blue-600 truncate uppercase">{q.attachedFileName}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* MULTIPLE CHOICE OPTIONS */}
                                                    {q.answerType === 'MULTIPLE_CHOICE' && q.options && (
                                                        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Choice Options</label>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {q.options.map((opt, oIdx) => (
                                                                    <div key={opt.id || oIdx} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200">
                                                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">{oIdx + 1}</div>
                                                                        <span className="text-xs font-medium text-slate-600">{opt.text}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* TABLE CONFIGURATION */}
                                                    {q.answerType === 'TABLE' && q.tableColumns && (
                                                        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Table Columns</label>
                                                            <div className="space-y-1">
                                                                {q.tableColumns.map((col, cIdx) => (
                                                                    <div key={col.id || cIdx} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100">
                                                                        <span className="text-[10px] font-bold text-slate-300 px-2 min-w-[24px]">{cIdx + 1}</span>
                                                                        <span className="flex-1 text-xs font-bold text-slate-700">{col.name}</span>
                                                                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">{col.type}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MasterChecklistView;