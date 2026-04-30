import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText, Circle, Paperclip, SquarePen, FileSignature, RotateCcw, CheckCircle2, Info
} from 'lucide-react';

const AdminAssignmentReview = () => {
    const { id } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [activeSection, setActiveSection] = useState(0);
    const [reviewState, setReviewState] = useState({}); // { qId: 'APPROVED' | 'REJECTED' | 'CLARIFY' }
    const [comments, setComments] = useState({});
    const [files, setFiles] = useState({}); // <--- ADD THIS LINE
    const [reviewStatuses, setReviewStatuses] = useState({});
    const [clientAnswers, setClientAnswers] = useState({});
    const [clientFiles, setClientFiles] = useState({});
    const navigate = useNavigate();

    const sectionRefs = useRef([]);

    // Load Assignment Data
    useEffect(() => {
        const allAssignments = JSON.parse(localStorage.getItem('all_assignments')) || [];
        const found = allAssignments.find(a => a.id === id || a.id === `#${id}`);

        if (found) {
            setAssignment(found);

            // 1. Load the text answers
            const submissionKey = `submission_${found.id}`;
            const storedSubmission = localStorage.getItem(submissionKey);
            if (storedSubmission) {
                const parsed = JSON.parse(storedSubmission);
                setClientAnswers(parsed.answers || {});
            }

            // 2. Load the uploaded files (Make sure the key is correct)
            // If ClientAssignmentFill saves it as 'uploadedFiles', this will work:
            setFiles(found.uploadedFiles || {});
        }
    }, [id]);



    const handleSetStatus = (key, status) => {
        const newStatuses = { ...reviewStatuses, [key]: status };
        setReviewStatuses(newStatuses);

        // Save back to local storage so it persists
        const allAssignments = JSON.parse(localStorage.getItem('all_assignments')) || [];
        const index = allAssignments.findIndex(a => a.id === assignment.id);
        if (index !== -1) {
            allAssignments[index].reviewStatuses = newStatuses;
            localStorage.setItem('all_assignments', JSON.stringify(allAssignments));
        }
    };
    // Sidebar Observer Logic
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3, // Trigger when 30% of the section is visible
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = sectionRefs.current.findIndex((ref) => ref === entry.target);
                    if (index !== -1) {
                        setActiveSection(index);
                    }
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        sectionRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [assignment]);

    // Logic: Scroll to section on sidebar click
    const scrollToSection = (index) => {
        const offset = 150; // Adjust this value based on your header height
        const element = sectionRefs.current[index];
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    // 1. Check karne ke liye ki kya saare questions already approved hain?
    const isAllApproved = assignment?.sections?.every(section =>
        section.questions?.every(q => reviewState[q.id] === 'APPROVED')
    );

    // 2. REVERT ALL Logic: Sabko Disapprove karne ke liye
    const handleRevertAll = () => {
        // Clear all statuses in the reviewState
        setReviewState({});
    };



    // Actions
    const handleApproveAll = () => {
        const newState = {};
        assignment.sections.forEach(sec => {
            sec.questions.forEach(q => newState[q.id] = 'APPROVED');
        });
        setReviewState(newState);
    };

    const updateStatus = (qId, status) => {
        setReviewState(prev => ({ ...prev, [qId]: status }));
    };

    const revertStatus = (qId) => {
        setReviewState(prev => {
            const newState = { ...prev };
            delete newState[qId];
            return newState;
        });
    };

    if (!assignment) return <div className="p-20 text-center">Loading for Review...</div>;

    return (
        <div className=" bg-[#F8FAFC] font-poppins pb-32">
            {/* 1. TOP MAIN NAV (Simplified Sapphire Logic Header) */}


            {/* 2. STICKY CLIENT DETAILS HEADER (Full Width) */}
            <div className="sticky top-10 z-50 w-full bg-white border-b border-t border-slate-200 px-6 py-2 shadow-sm">
                <div className="max-w-[1800px] mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-black text-slate-800">{assignment.name}</h1>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Review the core organizational details provided by the client.</p>
                    </div>
                    <div className="grid grid-cols-5 gap-12">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Client</p>
                            <p className="text-xs font-bold text-slate-700">{assignment.client}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Email</p>
                            <p className="text-xs font-bold text-slate-700">john@example.com</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Priority</p>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <p className="text-xs font-bold text-slate-700">High</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</p>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black rounded uppercase">Submitted</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Created Date</p>
                            <p className="text-xs font-bold text-slate-700">{assignment.created}</p>
                        </div>
                    </div>

                </div>
            </div>

            <main className="max-w-[1800px] mx-auto grid grid-cols-10 gap-6 p-6">
                {/* LEFT SIDEBAR NAVIGATION */}
                <aside className="col-span-3">
                    <div className="sticky top-40 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400">Assignment Sections</h3>
                        </div>
                        <div className="p-3 space-y-1">
                            {assignment.sections.map((sec, idx) => (
                                <button
                                    key={sec.id}
                                    onClick={() => scrollToSection(idx)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${activeSection === idx ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
                                >
                                    {activeSection === idx ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold uppercase tracking-tight leading-none truncate w-48">
                                            {sec.name}
                                        </span>
                                        <span className="text-[9px] mt-1 font-medium opacity-60">Section {idx + 1}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-3 border-t border-slate-100">
                            <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all">
                                Request for Review
                            </button>
                        </div>
                    </div>
                </aside>

                {/* REVIEW CONTENT */}
                <div className="col-span-7 space-y-4">
                    <div className='flex justify-end items-center gap-3'>
                        {/* Edit Questions Button */}
                        <button
                            onClick={() => navigate(`/assignments/edit/${id}`)}
                            className='text-[10px] font-bold text-blue-700 border-blue-100 uppercase border-2 px-4 py-2 rounded-lg tracking-widest hover:bg-slate-100 flex items-center gap-2'
                        >
                            <SquarePen size={14} /> Edit Questions
                        </button>

                        {/* Edit Answers Button */}
                        <button
                            onClick={() => navigate(`/assignment-fill/${id}`)}
                            className='text-[10px] font-bold text-blue-700 border-blue-100 uppercase border-2 px-4 py-2 rounded-lg tracking-widest hover:bg-slate-100 flex items-center gap-2'
                        >
                            <FileSignature size={14} /> Edit Answers
                        </button>

                        {/* Approve/Disapprove Toggle Button */}
                        <button
                            onClick={isAllApproved ? handleRevertAll : handleApproveAll}
                            className={`text-[10px] font-black uppercase tracking-[0.2em] border-2 px-4 py-2 rounded-lg transition-all flex items-center gap-2
                ${isAllApproved
                                    ? 'text-rose-600 border-rose-100 bg-white hover:bg-rose-50 shadow-sm'
                                    : 'text-blue-700 border-blue-100 bg-white hover:bg-blue-50 shadow-sm'
                                }`}
                        >
                            {isAllApproved ? (
                                <>
                                    <RotateCcw size={14} strokeWidth={3} />
                                    Disapprove All Questions
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={14} strokeWidth={3} />
                                    Approve All Questions
                                </>
                            )}
                        </button>
                    </div>


                    {assignment.sections.map((section, sIdx) => (
                        <div key={section.id} ref={el => sectionRefs.current[sIdx] = el} className="space-y-4 scroll-mt-32">
                            <div className="bg-blue-50/50 border-l-4 border-blue-600 px-4 py-2">
                                <h2 className="text-[11px] font-black uppercase text-blue-800 tracking-widest">Section {sIdx + 1}: {section.name}</h2>
                            </div>
                            {section.questions.map((q, qIdx) => {
                                const currentStatus = reviewState[q.id];
                                return (

                                    <div key={q.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">

                                        <div className="p-4 space-y-2">
                                            {/* Question Header & Action Buttons */}
                                            <div className="flex justify-between items-start">
                                                <div className="max-w-2xl">
                                                    <h3 className="text-sm font-bold text-slate-800">Q{qIdx + 1} : {q.title}</h3>
                                                    <p className="text-[11px] text-slate-400 mt-1 font-medium">Guidance: {q.guidance}</p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* REVERT ICON: Always shows if any status is set */}
                                                    {currentStatus && (
                                                        <button
                                                            onClick={() => revertStatus(q.id)}
                                                            className="px-1.5 py-1.5 text-slate-500 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
                                                            title="Revert Status"
                                                        >
                                                            <RotateCcw size={14} />
                                                        </button>
                                                    )}

                                                    {/* APPROVE BUTTON: Show if no status is set OR if it's the APPROVED status */}
                                                    {(!currentStatus || currentStatus === 'APPROVED') && (
                                                        <button
                                                            onClick={() => updateStatus(q.id, 'APPROVED')}
                                                            className={`min-w-[80px] px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${currentStatus === 'APPROVED'
                                                                ? 'bg-emerald-50 border-emerald-500 rounded-2xl text-emerald-600'
                                                                : 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 rounded-lg'
                                                                }`}
                                                            title="Approve Question"
                                                        >
                                                            {currentStatus === 'APPROVED' ? 'Approved' : 'Approve'}
                                                        </button>
                                                    )}



                                                    {/* REJECT BUTTON: Show if no status is set OR if it's the REJECTED status */}
                                                    {(!currentStatus || currentStatus === 'REJECTED') && (
                                                        <button
                                                            onClick={() => updateStatus(q.id, 'REJECTED')}
                                                            className={`min-w-[80px] px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${currentStatus === 'REJECTED'
                                                                ? 'bg-red-50 border-red-500 text-red-600 rounded-2xl'
                                                                : 'bg-red-500 border-red-500 text-white hover:bg-red-600 rounded-lg'
                                                                }`}
                                                            title="Reject Question"
                                                        >
                                                            {currentStatus === 'REJECTED' ? 'Rejected' : 'Reject'}
                                                        </button>
                                                    )}
                                                    {/* CLARIFY BUTTON: Show if no status is set OR if it's the CLARIFY status */}
                                                    {(!currentStatus || currentStatus === 'CLARIFY') && (
                                                        <button
                                                            onClick={() => updateStatus(q.id, 'CLARIFY')}
                                                            className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${currentStatus === 'CLARIFY'
                                                                ? 'bg-amber-50 border-amber-500 rounded-2xl text-amber-600'
                                                                : 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600 rounded-lg'
                                                                }`}
                                                            title="Request Clarification"
                                                        >
                                                            Need Clarification
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* CLIENT RESPONSE DISPLAY */}
                                            <div className="bg-slate-50/50 rounded-xl p-2 border border-slate-100 min-h-[60px]">
                                                {clientAnswers[q.id] ? (
                                                    <div className="space-y-2">

                                                        {/* 1. TABLE DATA RENDERER */}
                                                        {q.answerType === 'TABLE' && Array.isArray(clientAnswers[q.id]) ? (
                                                            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-sm">
                                                                <table className="w-full text-left border-collapse">
                                                                    <thead className="bg-slate-50 border-b border-slate-200">
                                                                        <tr>
                                                                            <th className="px-3 py-2 text-[10px] font-black uppercase text-slate-400">No.</th>
                                                                            {q.tableColumns?.map(col => (
                                                                                <th key={col.id} className="px-3 py-2 text-[10px] font-black uppercase text-slate-400">{col.name}</th>
                                                                            ))}
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-100">
                                                                        {clientAnswers[q.id].map((row, rIdx) => (
                                                                            <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                                                                                <td className="px-3 py-2 text-[11px] font-bold text-slate-400 bg-slate-50/30 text-left">{rIdx + 1}</td>
                                                                                {q.tableColumns?.map(col => (
                                                                                    <td key={col.id} className="px-3 py-2 text-xs font-bold text-slate-700">
                                                                                        {row[col.name] || <span className="text-slate-300 italic">Not entered</span>}
                                                                                    </td>
                                                                                ))}
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) :

                                                            /* 2. MULTIPLE CHOICE / CHECKBOX RENDERER (Arrays) */
                                                            Array.isArray(clientAnswers[q.id]) && clientAnswers[q.id].length > 0 ? (
                                                                <div className="space-y-3">
                                                                    {(q.options || []).map((opt) => {
                                                                        const selectedValues = clientAnswers[q.id]?.map(a => a.value || a) || [];
                                                                        return (
                                                                            <label
                                                                                key={opt.id}
                                                                                className={`flex items-center gap-4 p-2 border border-slate-100 rounded-xl cursor-default hover:bg-slate-50 transition-all
                                ${selectedValues.includes(opt.text) ? "bg-slate-50 border-slate-100" : "bg-white border-slate-100"}`}
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={selectedValues.includes(opt.text)}
                                                                                    readOnly
                                                                                    className="w-3.5 h-3.5 accent-blue-600 cursor-default"
                                                                                />
                                                                                <span className="text-sm font-semibold text-slate-700">
                                                                                    {opt.text}
                                                                                </span>
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) :

                                                                /* 3. YES/NO SPECIFIC RENDERER */
                                                                q.answerType === 'YES_NO' ? (
                                                                    <div className="flex gap-10 mt-2 pb-2">
                                                                        {['Yes', 'No', 'NA#'].map(opt => {
                                                                            const isSelected = clientAnswers[q.id] === opt;
                                                                            return (
                                                                                <label key={opt} className="flex items-center gap-2 cursor-default">
                                                                                    <input
                                                                                        type="radio"
                                                                                        checked={isSelected}
                                                                                        readOnly
                                                                                        className={`w-4 h-4 border-slate-300 ${isSelected ? 'accent-blue-600' : 'opacity-30'
                                                                                            }`}
                                                                                    />
                                                                                    <span className={` text-sm font-bold ${isSelected ? 'text-[#1e293b]' : 'text-slate-400'
                                                                                        }`}>
                                                                                        {opt}
                                                                                    </span>
                                                                                </label>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (

                                                                    /* 4. SHORT TEXT, LONG TEXT, DATE RENDERER (Fallback) */
                                                                    <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                                        {clientAnswers[q.id]}
                                                                    </p>

                                                                )}

                                                    </div>

                                                ) : (
                                                    /* NO DATA PLACEHOLDER */
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Info size={14} />
                                                        <p className="text-xs italic font-medium">No response provided by client for this item.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* FILE SECTION */}
                                            {/* ADMIN FILE REVIEW SECTION */}
                                            {q.allowUpload && clientFiles[q.id] && clientFiles[q.id].length > 0 && (
                                                <div className="mt-6 space-y-4">
                                                    {clientFiles[q.id].map((file) => (
                                                        <div key={file.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                                                            {/* Header: Question & Status Badge */}
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div>
                                                                    <h3 className="text-sm font-bold text-slate-800">Q{q.order}: {q.questionText}</h3>
                                                                    <p className="text-xs text-slate-400 italic mt-1">
                                                                        Guidance: {q.description || "Review the uploaded document below."}
                                                                    </p>
                                                                </div>

                                                            </div>

                                                            {/* File Info Row */}
                                                            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-white">
                                                                <div className="flex items-center gap-4">
                                                                    {/* PDF/File Icon Wrapper */}
                                                                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                                                                        <FileText size={24} className="text-rose-500" />
                                                                    </div>

                                                                    {/* Name & Meta */}
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                                                                            {file.name}
                                                                        </p>
                                                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                                                            {file.size} • Uploaded on {file.uploadedAt || 'Recently'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Action Buttons */}
                                                                <div className="flex items-center gap-3">
                                                                    {/* View Icon Button */}
                                                                    <button
                                                                        onClick={() => window.open(file.url, '_blank')}
                                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                        title="View Document"
                                                                    >
                                                                        <Eye size={20} />
                                                                    </button>

                                                                    <button className="bg-[#10b981] hover:bg-[#059669] text-white text-[11px] font-black uppercase px-6 py-2.5 rounded-lg transition-all tracking-widest shadow-sm shadow-emerald-100">
                                                                        Approve
                                                                    </button>
                                                                    <button className="border border-rose-200 text-rose-500 hover:bg-rose-50 text-[11px] font-black uppercase px-6 py-2.5 rounded-lg transition-all tracking-widest">
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Comment Field (Only shown for admin) */}
                                                            <div className="mt-4">
                                                                <textarea
                                                                    rows={2}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                                                    placeholder="Add a comment if rejecting..."
                                                                ></textarea>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* LOG MESSAGE STYLE AS PER SCREENSHOT */}
                                            {/* <div className="flex items-start gap-3 mt-4">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">A</div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-black text-slate-800">Admin</span>
                                                        <span className="text-[9px] font-medium text-slate-400">10:45 AM</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 inline-block">Please provide a clearer copy of the shareholder agreement.</p>
                                                </div>
                                            </div> */}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </main>

            {/* 3. STICKY BOTTOM ACTION BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-[70]">
                <div className="max-w-[1800px] mx-auto flex justify-between items-center">
                    <div className=" flex items-center gap-3">
                        {/* <AlertCircle size={14} className="text-red-500" />
                        <span className="text-[10px] font-black uppercase text-red-600 tracking-widest">Open Required Items (4)</span> */}
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="px-6 py-2.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200">Ready for Review</button>
                        <button className="px-6 py-2.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">Ready for Final Approval</button>
                        <button className="px-6 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-200">Final Approve</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAssignmentReview;