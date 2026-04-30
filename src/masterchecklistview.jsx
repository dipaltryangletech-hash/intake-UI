import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"; // useParams को जोड़ा
import { ChevronLeft, Info, Trash2, Copy, ChevronDown } from 'lucide-react';

const MasterChecklistView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams(); // URL से ID प्राप्त करें
    
    // इनिशियल स्टेट को खाली रखें ताकि डमी डेटा न दिखे
    const [checklist, setChecklist] = useState(null);

    useEffect(() => {
        // 1. सबसे पहले चेक करें कि क्या डेटा नेविगेशन स्टेट में है
        if (location.state && location.state.checklist) {
            setChecklist(location.state.checklist);
        } else {
            // 2. अगर स्टेट नहीं है (जैसे पेज रिफ्रेश), तो localStorage से फेच करें
            const allChecklists = JSON.parse(localStorage.getItem('all_checklists')) || [];
            const foundChecklist = allChecklists.find(item => item.id.toString() === id.toString());
            
            if (foundChecklist) {
                setChecklist(foundChecklist);
            } else {
                // अगर डेटा कहीं नहीं मिला
                console.error("Checklist not found");
            }
        }
    }, [id, location.state]);

    // जब तक डेटा लोड हो रहा हो, लोडिंग दिखाएं
    if (!checklist) {
        return <div className="flex h-screen items-center justify-center font-bold">Loading Checklist Data...</div>;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-10 font-poppins text-slate-900">
            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 shadow-sm">
                <div className="max-w-[1800px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/masterchecklist" className="flex items-center text-slate-500 hover:text-slate-800 transition">
                            <ChevronLeft size={20} />
                            <span className="text-sm font-medium ml-2">MasterChecklist</span>
                        </Link>
                        <span className="text-slate-300">|</span>
                        <h1 className="text-sm font-medium text-slate-800 tracking-tight">View Checklist: {checklist.name}</h1>
                    </div>

                    <button 
                        onClick={() => navigate("/masterchecklist")}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase shadow-lg hover:bg-blue-700 transition-all"
                    >
                         Close Viewer
                    </button>
                </div>
            </div>

            <div className="mt-4 max-w-5xl mx-auto p-2 space-y-3">
                {/* BLUE BASIC INFO CARD */}
                <section className="bg-[#1e3a8a] rounded-2xl border border-blue-700/50 shadow-2xl p-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex-1 w-full space-y-2">
                            <div className="space-y-1">
                                <label className="text-[10px] text-blue-100/70 font-black uppercase tracking-[0.2em] ml-1">Checklist Name</label>
                                <div className="w-full bg-[#0f172a]/40 text-white text-lg font-bold border border-blue-400/20 rounded-xl px-4 py-2">
                                    {checklist.name}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-blue-100/70 font-black uppercase tracking-[0.2em] ml-1">Description</label>
                                <div className="w-full bg-[#0f172a]/40 text-blue-50 text-sm border border-blue-400/20 rounded-2xl px-4 py-3 min-h-[60px]">
                                    {checklist.description || "No description provided."}
                                </div>
                            </div>
                        </div>

                        {/* STATUS SWITCH (READ ONLY) */}
                        <div className="w-full lg:w-auto lg:min-w-[240px]">
                            <div className="bg-[#0f172a]/30 p-4 rounded-2xl border border-blue-400/20 backdrop-blur-md">
                                <div className="relative w-full h-[54px] bg-[#0f172a] rounded-xl border border-blue-400/20 p-1.5 flex items-center pointer-events-none">
                                    <div className={`absolute h-[42px] w-[calc(50%-6px)] bg-[#1e293b] border border-blue-400/30 rounded-lg transition-all duration-300 ${checklist.status === 'Active' ? 'translate-x-0' : 'translate-x-full'}`} />
                                    <div className="relative flex-1 flex items-center justify-center gap-2 z-10">
                                        <div className={`w-2 h-2 rounded-full ${checklist.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                                        <span className={`text-[10px] font-black uppercase ${checklist.status === 'Active' ? 'text-white' : 'text-slate-500'}`}>Active</span>
                                    </div>
                                    <div className="relative flex-1 flex items-center justify-center gap-2 z-10">
                                        <div className={`w-2 h-2 rounded-full ${checklist.status === 'Archived' ? 'bg-slate-400' : 'bg-slate-700'}`} />
                                        <span className={`text-[10px] font-black uppercase ${checklist.status === 'Archived' ? 'text-white' : 'text-slate-500'}`}>Archived</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTIONS LIST */}
                <div className="space-y-6">
                    {(checklist.sections || []).map((section) => (
                        <div key={section.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between p-6 bg-slate-50/50 border-b border-slate-100">
                                <h2 className="font-bold text-slate-500 text-sm uppercase tracking-tight">
                                    {section.name || "UNNAMED SECTION"}
                                </h2>
                                <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1.5 rounded border border-slate-200">
                                    {(section.questions || []).length} Questions
                                </span>
                            </div>

                            <div className="p-6 space-y-6">
                                {(section.questions || []).map((q, idx) => (
                                    <div key={q.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                                        <div className="p-5 flex items-center justify-between bg-slate-50/30 border-b border-slate-50">
                                            <div className="flex items-center gap-4">
                                                <span className="w-8 h-8 rounded-xl bg-slate-100 text-[10px] font-black flex items-center justify-center text-slate-400">{idx + 1}</span>
                                                <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{q.title}</span>
                                            </div>
                                            {q.isMandatory && <span className="text-[9px] font-black bg-rose-50 text-rose-500 px-3 py-1 rounded border border-rose-100 uppercase">MANDATORY</span>}
                                        </div>

                                        <div className="p-6 space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block ml-1">Question Title</label>
                                                <div className="w-full font-medium text-slate-700 border border-slate-200 p-3 rounded-xl bg-slate-50/50">{q.title}</div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Guidance / Remarks</label>
                                                <div className="w-full text-sm text-slate-500 bg-slate-50/30 rounded-2xl p-4 border border-slate-100 min-h-[50px] whitespace-pre-wrap">{q.guidance || "No guidance provided."}</div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Answer Type</label>
                                                    <div className="w-full text-xs font-bold p-3 border border-slate-100 rounded-xl bg-slate-50 text-slate-700 uppercase">{q.answerType}</div>
                                                </div>
                                                <div className="flex items-center pb-4 opacity-60">
                                                    <input type="checkbox" checked={q.isMandatory} readOnly className="w-4 h-4 rounded text-blue-600" />
                                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-3">Mandatory</span>
                                                </div>
                                                <div className="flex items-center pb-4 opacity-60">
                                                    <input type="checkbox" checked={q.allowUpload} readOnly className="w-4 h-4 rounded text-blue-600" />
                                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-3">Upload Allowed</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MasterChecklistView;