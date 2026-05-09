import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText, Circle, Paperclip, SquarePen, FileSignature, RotateCcw, CheckCircle2, Eye, Info, SendHorizontalIcon, MessageSquare
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

    const [isEditingAnswers, setIsEditingAnswers] = useState(false);

    // Chat state
    const [chats, setChats] = useState({});
    const [chatInputs, setChatInputs] = useState({});
    const [openChats, setOpenChats] = useState({});

    const toggleChat = (qId) => {
        setOpenChats(prev => ({ ...prev, [qId]: !prev[qId] }));
    };

    const handleSendMessage = (qId) => {
        const text = chatInputs[qId];
        if (!text || !text.trim()) return;

        const newMessage = {
            id: Date.now().toString(),
            text: text.trim(),
            sender: 'Admin',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChats(prev => {
            const updated = { ...prev, [qId]: [...(prev[qId] || []), newMessage] };
            const cleanId = assignment?.id?.replace('#', '');
            localStorage.setItem(`chat_${cleanId}`, JSON.stringify(updated));
            return updated;
        });

        setChatInputs(prev => ({ ...prev, [qId]: '' }));
    };

    const handleAnswerChange = (qId, value) => {
        setClientAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const handleSaveAnswers = () => {
        const submissionKey = `submission_${assignment.id}`;
        const existing = JSON.parse(localStorage.getItem(submissionKey)) || {};
        const updated = { ...existing, answers: clientAnswers };
        localStorage.setItem(submissionKey, JSON.stringify(updated));
        setIsEditingAnswers(false);
    };

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
                setClientFiles(parsed.files || {});
            }

            // 2. Load the uploaded files (Make sure the key is correct)
            // If ClientAssignmentFill saves it as 'uploadedFiles', this will work:
            setFiles(found.uploadedFiles || {});

            // 3. Load chats
            const cleanId = found.id.replace('#', '');
            const chatKey = `chat_${cleanId}`;
            const storedChats = localStorage.getItem(chatKey);
            if (storedChats) {
                setChats(JSON.parse(storedChats));
            }
        }
    }, [id]);

    // Sync chats across tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            const cleanId = assignment?.id?.replace('#', '');
            if (e.key === `chat_${cleanId}`) {
                setChats(JSON.parse(e.newValue || '{}'));
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [assignment?.id]);



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
            rootMargin: '-150px 0px -40% 0px',
            threshold: 0,
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
            setActiveSection(index);
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

    // 3. Check for rejected answers and handler
    const hasRejectedAnswers = assignment?.sections?.some(section =>
        section.questions?.some(q => reviewState[q.id] === 'REJECTED')
    );

    const handleOpenForResubmission = () => {
        setReviewState(prev => {
            const newState = { ...prev };
            Object.keys(newState).forEach(key => {
                if (newState[key] === 'REJECTED') {
                    delete newState[key];
                }
            });
            return newState;
        });

        // Update overall assignment status
        const allAssignments = JSON.parse(localStorage.getItem('all_assignments')) || [];
        const index = allAssignments.findIndex(a => a.id === assignment.id);
        if (index !== -1) {
            allAssignments[index].status = 'Open for Resubmission';
            localStorage.setItem('all_assignments', JSON.stringify(allAssignments));
            setAssignment(prev => ({ ...prev, status: 'Open for Resubmission' }));
        }
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
        if (status !== 'CLARIFY') {
            setOpenChats(prev => ({ ...prev, [qId]: false }));
        }
    };

    const revertStatus = (qId) => {
        setReviewState(prev => {
            const newState = { ...prev };
            delete newState[qId];
            return newState;
        });
        setOpenChats(prev => ({ ...prev, [qId]: false }));
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
                        <div className="p-3 border-t border-slate-100 flex flex-col gap-2">
                            {hasRejectedAnswers && (
                                <button
                                    onClick={handleOpenForResubmission}
                                    className="w-full bg-blue-500 text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-blue-600 transition-all"
                                >
                                    Open for Resubmission
                                </button>
                            )}

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
                            onClick={isEditingAnswers ? handleSaveAnswers : () => setIsEditingAnswers(true)}
                            className={`text-[10px] font-bold uppercase border-2 px-4 py-2 rounded-lg tracking-widest flex items-center gap-2 transition-all ${isEditingAnswers ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-sm' : 'text-blue-700 border-blue-100 hover:bg-slate-100'}`}
                        >
                            {isEditingAnswers ? <CheckCircle2 size={14} /> : <FileSignature size={14} />}
                            {isEditingAnswers ? 'Save Answers' : 'Edit Answers'}
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
                                                            onClick={() => { updateStatus(q.id, 'CLARIFY'); setOpenChats(prev => ({ ...prev, [q.id]: true })); }}
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
                                                {isEditingAnswers ? (
                                                    <div className="space-y-2">
                                                        {q.answerType === 'TABLE' ? (
                                                            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-sm p-2">
                                                                <table className="w-full text-left border-collapse">
                                                                    <thead className="bg-slate-50 border-b border-slate-200">
                                                                        <tr>
                                                                            <th className="px-3 py-2 text-[10px] font-black uppercase text-slate-400">No.</th>
                                                                            {q.tableColumns?.map(col => (
                                                                                <th key={col.id} className="px-3 py-2 text-[10px] font-black uppercase text-slate-400">{col.name}</th>
                                                                            ))}
                                                                            <th className="px-3 py-2 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-100">
                                                                        {(clientAnswers[q.id] && Array.isArray(clientAnswers[q.id]) && clientAnswers[q.id].length > 0 ? clientAnswers[q.id] : [{}]).map((row, rIdx) => (
                                                                            <tr key={rIdx}>
                                                                                <td className="px-3 py-2 text-[11px] font-bold text-slate-400">{rIdx + 1}</td>
                                                                                {q.tableColumns?.map(col => (
                                                                                    <td key={col.id} className="px-1 py-1">
                                                                                        <input
                                                                                            type="text"
                                                                                            className="w-full border border-slate-200 rounded p-1.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                                                                                            value={row[col.name] || ''}
                                                                                            onChange={(e) => {
                                                                                                const newAnswers = [...(Array.isArray(clientAnswers[q.id]) && clientAnswers[q.id].length > 0 ? clientAnswers[q.id] : [{}])];
                                                                                                newAnswers[rIdx] = { ...newAnswers[rIdx], [col.name]: e.target.value };
                                                                                                handleAnswerChange(q.id, newAnswers);
                                                                                            }}
                                                                                        />
                                                                                    </td>
                                                                                ))}
                                                                                <td className="px-3 py-2 text-right">
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            const currentRows = Array.isArray(clientAnswers[q.id]) && clientAnswers[q.id].length > 0 ? clientAnswers[q.id] : [{}];
                                                                                            if (currentRows.length > 1) {
                                                                                                const newAnswers = [...currentRows];
                                                                                                newAnswers.splice(rIdx, 1);
                                                                                                handleAnswerChange(q.id, newAnswers);
                                                                                            }
                                                                                        }}
                                                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                                                    >
                                                                                        &times;
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                                <button
                                                                    onClick={() => {
                                                                        const currentRows = Array.isArray(clientAnswers[q.id]) && clientAnswers[q.id].length > 0 ? clientAnswers[q.id] : [{}];
                                                                        const newAnswers = [...currentRows, {}];
                                                                        handleAnswerChange(q.id, newAnswers);
                                                                    }}
                                                                    className="mt-2 text-[10px] text-blue-600 font-bold hover:underline"
                                                                >
                                                                    + Add Row
                                                                </button>
                                                            </div>
                                                        ) : (q.answerType === 'CHECKBOX' || q.answerType === 'MULTIPLE_CHOICE') ? (
                                                            <div className="space-y-3">
                                                                {(q.options || []).map((opt) => {
                                                                    const selectedValues = Array.isArray(clientAnswers[q.id]) ? clientAnswers[q.id].map(a => a.value || a) : [];
                                                                    return (
                                                                        <label
                                                                            key={opt.id}
                                                                            className={`flex items-center gap-4 p-2 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-all ${selectedValues.includes(opt.text) ? "bg-slate-50 border-slate-100" : "bg-white border-slate-100"}`}
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                name={`q-${q.id}`}
                                                                                checked={selectedValues.includes(opt.text)}
                                                                                onChange={(e) => {
                                                                                    if (q.answerType === 'MULTIPLE_CHOICE') {
                                                                                        // For multiple choice, maybe we only allow one selection, or behave like checkbox?
                                                                                        // The original form behaves like a multi-checkbox for both.
                                                                                        let newVals = [...selectedValues];
                                                                                        if (e.target.checked) newVals.push(opt.text);
                                                                                        else newVals = newVals.filter(v => v !== opt.text);
                                                                                        handleAnswerChange(q.id, newVals);
                                                                                    } else {
                                                                                        let newVals = [...selectedValues];
                                                                                        if (e.target.checked) newVals.push(opt.text);
                                                                                        else newVals = newVals.filter(v => v !== opt.text);
                                                                                        handleAnswerChange(q.id, newVals);
                                                                                    }
                                                                                }}
                                                                                className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                                                                            />
                                                                            <span className="text-sm font-semibold text-slate-700">{opt.text}</span>
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : q.answerType === 'YES_NO' ? (
                                                            <div className="flex gap-10 mt-2 pb-2">
                                                                {['Yes', 'No', 'NA#'].map(opt => (
                                                                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            name={`q-${q.id}`}
                                                                            checked={clientAnswers[q.id] === opt}
                                                                            onChange={() => handleAnswerChange(q.id, opt)}
                                                                            className="w-4 h-4 accent-blue-600"
                                                                        />
                                                                        <span className="text-sm font-bold text-[#1e293b]">{opt}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        ) : q.answerType === 'LONG_TEXT' ? (
                                                            <textarea
                                                                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:border-blue-500 min-h-[100px] resize-y"
                                                                value={clientAnswers[q.id] || ''}
                                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                                placeholder="Type your answer here..."
                                                            />
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
                                                                value={clientAnswers[q.id] || ''}
                                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                                placeholder="Type your answer here..."
                                                            />
                                                        )}
                                                    </div>
                                                ) : clientAnswers[q.id] ? (
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
                                            {q.allowUpload && clientFiles[q.id] && clientFiles[q.id].length > 0 && (
                                                <div className="mt-4 space-y-2">
                                                    <div className="flex items-center justify-center w-full h-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 cursor-not-allowed mb-2 opacity-70">
                                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                            <Paperclip size={16} className="text-slate-400" />
                                                            Uploaded Documentation
                                                        </p>
                                                    </div>
                                                    {clientFiles[q.id].map(file => (
                                                        <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                            <div className="flex items-center gap-3">
                                                                <FileText size={16} className="text-blue-500" />
                                                                <span className="text-[11px] font-bold text-slate-700">{file.name} ({file.size})</span>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    if (file.url || file.data) {
                                                                        window.open(file.url || file.data, '_blank');
                                                                    } else {
                                                                        const htmlContent = `
                                                                        <html>
                                                                            <head><title>Viewing ${file.name}</title></head>
                                                                            <body style="display:flex; justify-content:center; align-items:center; height:100vh; background:#f1f5f9; font-family:sans-serif; margin:0;">
                                                                                <div style="background:white; padding:40px; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.1); text-align:center;">
                                                                                    <h2 style="color:#334155; margin-bottom:10px;">Document Viewer (Demo Mode)</h2>
                                                                                    <p style="color:#64748b;">Filename: <strong>${file.name}</strong></p>
                                                                                    <p style="color:#64748b;">Size: <strong>${file.size}</strong></p>
                                                                                    <p style="color:#94a3b8; font-size:12px; margin-top:20px;">Actual file contents are not saved in this frontend demo to prevent local storage quota limits.</p>
                                                                                </div>
                                                                            </body>
                                                                        </html>`;
                                                                        const blob = new Blob([htmlContent], { type: 'text/html' });
                                                                        const blobUrl = URL.createObjectURL(blob);
                                                                        window.open(blobUrl, '_blank');
                                                                    }
                                                                }}
                                                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                                                title="View Document"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* CLARIFICATION SECTION (Only shows if status is CLARIFY) */}
                                            {reviewState[q.id] === 'CLARIFY' && (
                                                <div className="mt-1 pt-1 border-t border-slate-50">
                                                    {!openChats[q.id] && (
                                                        <button
                                                            onClick={() => toggleChat(q.id)}
                                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                                                        >
                                                            <MessageSquare size={14} /> Clarification Chat
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* CHAT SECTION */}
                                            {openChats[q.id] && (
                                                <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
                                                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Clarification Chat</span>
                                                        <button onClick={() => setOpenChats(prev => ({ ...prev, [q.id]: false }))} className="text-slate-400 hover:text-slate-600 text-lg leading-none">&times;</button>
                                                    </div>

                                                    {/* Messages Area */}
                                                    <div className="p-3 h-32 overflow-y-auto space-y-3 bg-slate-50/50">
                                                        {(chats[q.id] || []).map((msg, idx) => (
                                                            <div key={idx} className={`flex items-start gap-2 ${msg.sender === 'Admin' ? 'flex-row-reverse' : ''}`}>
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 ${msg.sender === 'Admin' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                                                                    {msg.sender.charAt(0)}
                                                                </div>
                                                                <div className={`flex flex-col ${msg.sender === 'Admin' ? 'items-end' : 'items-start'}`}>
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className="text-[10px] font-medium text-slate-400">{msg.sender}</span>
                                                                        <span className="text-[9px] font-medium text-slate-400">{msg.time}</span>
                                                                    </div>
                                                                    <div className={`text-[11px] p-1 rounded-lg border inline-block max-w-[250px] ${msg.sender === 'Admin' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-white border-slate-200 text-slate-700'}`}>
                                                                        {msg.text}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(!chats[q.id] || chats[q.id].length === 0) && (
                                                            <div className="text-center text-[11px] text-slate-400 italic mt-8">No messages yet. Send a message to start clarifying.</div>
                                                        )}
                                                    </div>

                                                    {/* Input Area */}
                                                    <div className="p-2 bg-white border-t border-slate-200">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="text"
                                                                placeholder="Type a message..."
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-10 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                                value={chatInputs[q.id] || ''}
                                                                onChange={(e) => setChatInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleSendMessage(q.id);
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => handleSendMessage(q.id)}
                                                                className={`absolute right-1 p-1.5 rounded-full transition-all ${!chatInputs[q.id] || !chatInputs[q.id].trim() ? 'text-slate-300' : 'bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700'}`}
                                                                disabled={!chatInputs[q.id] || !chatInputs[q.id].trim()}
                                                            >
                                                                <SendHorizontalIcon size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
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