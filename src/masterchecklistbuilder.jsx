import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link, useLocation } from "react-router-dom"; // Added useLocation
import {
    Plus, GripHorizontal, CircleX, ChevronDown, ChevronLeft, ChevronUp, Trash2,
    FileText, Upload, Save, Paperclip, Rocket, Info, Table, List, Copy
} from 'lucide-react';

// DND Kit Imports
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- SORTABLE WRAPPER COMPONENT ---
const SortableSection = ({ section, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.6 : 1,
    };
    return (
        <div ref={setNodeRef} style={style} className="relative">
            <div className="hidden" {...attributes} {...listeners}></div>
            {children(listeners, attributes)}
        </div>
    );
};

const MasterChecklistBuilder = () => {
    const [openColTypeDropdownId, setOpenColTypeDropdownId] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const dropdownRef = useRef(null);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const statusRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation(); // To detect if we are editing

    const tableColumnTypes = ["Text", "Number", "Currency", "Date", "Email", "Phone"];
    const answerOptions = [
        { value: "SHORT_TEXT", label: "Short Text" },
        { value: "LONG_TEXT", label: "Long Text" },
        { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
        { value: "YES_NO_NA", label: "Yes / No / NA#" },
        { value: "TABLE", label: "Table" },
    ];

    const handleQuestionReorder = (sectionId, dragIdx, hoverIdx) => {
        const newSections = checklist.sections.map(sec => {
            if (sec.id !== sectionId) return sec;

            const newQuestions = [...sec.questions];
            // Move the item in the array
            const draggedItem = newQuestions[dragIdx];
            newQuestions.splice(dragIdx, 1);
            newQuestions.splice(hoverIdx, 0, draggedItem);

            return { ...sec, questions: newQuestions };
        });

        setChecklist({ ...checklist, sections: newSections });
    };

    // --- INITIAL STATE LOGIC (Create vs Edit) ---
    const defaultChecklist = {
        name: '',
        description: '',
        status: 'Active',
        sections: [
            {
                id: 'initial-sec',
                isExpanded: true,
                questions: [
                    {
                        id: 'initial-q',
                        title: '',
                        guidance: '',
                        answerType: 'SHORT_TEXT',
                        shortText: '',
                        isMandatory: false,
                        allowUpload: false,
                        tableColumns: [{ id: Date.now(), name: '', type: 'Text' }],
                        options: [{ id: Date.now(), text: '' }],
                        selectedValue: null,
                        isExpanded: true
                    }
                ]
            }
        ]
    };

    const [checklist, setChecklist] = useState(defaultChecklist);

    // --- LOAD DATA FOR EDITING ---
    // --- UPDATE THIS SECTION IN MasterChecklistBuilder ---

    useEffect(() => {
        if (location.state && location.state.checklist) {
            const incomingData = location.state.checklist;

            // SAFETY CHECK: 
            // If 'sections' is a string (like in your dummy data), 
            // we convert it to an empty array so the map function doesn't crash.
            if (!Array.isArray(incomingData.sections)) {
                console.warn("Fixed non-array sections for editing");
                incomingData.sections = [];
            }

            setChecklist(incomingData);
        } else {
            const draft = localStorage.getItem('builder_draft');
            if (draft && !location.state) {
                setChecklist(JSON.parse(draft));
            }
        }
    }, [location.state]);

    // Save to draft for "New" items (Optional, keeps work safe)
    useEffect(() => {
        if (!checklist.id) {
            localStorage.setItem('builder_draft', JSON.stringify(checklist));
        }
    }, [checklist]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpenDropdownId(null);
            if (statusRef.current && !statusRef.current.contains(event.target)) setIsStatusOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- IMPROVED SAVE LOGIC ---
    const handleSaveChecklist = () => {
        if (!checklist.name.trim()) {
            toast.error("Please enter a Checklist Name");
            return;
        }
        const existingData = JSON.parse(localStorage.getItem('all_checklists')) || [];

        // Prepare the new entry
        const newEntry = {
            ...checklist,
            id: checklist.id || Date.now(), // Keep existing ID or create new
            totalSections: checklist.sections.length,
            totalQuestions: checklist.sections.reduce((acc, sec) => acc + (sec.questions?.length || 0), 0),
            lastUpdated: new Date().toLocaleDateString(),
            createdDate: checklist.createdDate || new Date().toLocaleDateString()
        };

        let updatedList;
        const index = existingData.findIndex(item => item.id === newEntry.id);

        if (index > -1) {
            // Update existing
            updatedList = existingData.map((item) => item.id === newEntry.id ? newEntry : item);
            toast.success("Checklist updated successfully!");
        } else {
            // Add new
            updatedList = [newEntry, ...existingData];
            toast.success("Checklist saved successfully!", {
                className: "bg-green-600 text-white font-semibold rounded-xl"
            });
        }

        localStorage.setItem('all_checklists', JSON.stringify(updatedList));

        // Clear draft if it was a new checklist
        if (!checklist.id) localStorage.removeItem('builder_draft');

        navigate("/masterchecklist");
    };

    // --- (DRAG AND DROP HANDLERS - NO CHANGE) ---
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setChecklist((prev) => {
                const oldIndex = prev.sections.findIndex((s) => s.id === active.id);
                const newIndex = prev.sections.findIndex((s) => s.id === over.id);
                return { ...prev, sections: arrayMove(prev.sections, oldIndex, newIndex) };
            });
        }
    };

    // --- (HELPER FUNCTIONS - NO CHANGE) ---
    const deleteSection = (sectionId) => setChecklist(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== sectionId) }));
    const deleteQuestion = (sectionId, qId) => setChecklist(prev => ({ ...prev, sections: prev.sections.map(sec => sec.id === sectionId ? { ...sec, questions: sec.questions.filter(q => q.id !== qId) } : sec) }));
    const addQuestion = (sectionId) => {
        const newSections = checklist.sections.map(sec => {
            if (sec.id === sectionId) {
                return { ...sec, isExpanded: true, questions: [...sec.questions, { id: `q-${Date.now()}`, title: '', guidance: '', answerType: 'SHORT_TEXT', isMandatory: false, allowUpload: false, tableColumns: [{ id: Date.now(), name: '', type: 'Text' }], options: [{ id: Date.now(), text: '' }], selectedValue: null, isExpanded: true }] };
            }
            return sec;
        });
        setChecklist({ ...checklist, sections: newSections });
    };

    const updateQuestion = (sectionId, qId, field, value) => {
        const newSections = checklist.sections.map(sec => {
            if (sec.id === sectionId) return { ...sec, questions: sec.questions.map(q => q.id === qId ? { ...q, [field]: value } : q) };
            return sec;
        });
        setChecklist({ ...checklist, sections: newSections });
    };

    const addTableColumn = (sectionId, qId, columns) => updateQuestion(sectionId, qId, 'tableColumns', [...(columns || []), { id: Date.now(), name: '', type: 'Text' }]);
    const updateTableColumn = (sectionId, qId, colId, field, value, columns) => updateQuestion(sectionId, qId, 'tableColumns', columns.map(c => c.id === colId ? { ...c, [field]: value } : c));
    const deleteTableColumn = (sectionId, qId, colId, columns) => columns.length > 1 && updateQuestion(sectionId, qId, 'tableColumns', columns.filter(c => c.id !== colId));
    const addOption = (sectionId, qId, options) => updateQuestion(sectionId, qId, 'options', [...(options || []), { id: Date.now(), text: '' }]);
    const updateOption = (sectionId, qId, optId, value, options) => updateQuestion(sectionId, qId, 'options', options.map(o => o.id === optId ? { ...o, text: value } : o));
    const deleteOption = (sectionId, qId, optId, options) => options.length > 1 && updateQuestion(sectionId, qId, 'options', options.filter(o => o.id !== optId));

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
                            {checklist.id ? 'Edit Checklist' : 'Master-Checklist Builder'}
                        </h1>
                    </div>

                    <div className="flex gap-3">
                        {/* --- ONLY SHOW IMPORT CSV IF IT IS A NEW CHECKLIST (No ID) --- */}
                        {!checklist.id && (
                            <button className="flex-1 md:flex-none px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs uppercase hover:bg-slate-50 transition-all flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
                                <Upload size={16} /> Import CSV
                            </button>
                        )}

                        <button

                            onClick={handleSaveChecklist}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                            <Rocket size={16} />
                            Publish Master
                        </button>
                    </div>
                </div>
            </div>

            {/* MAIN FORM AREA (UI UNCHANGED) */}
            <div className=" mt-5 max-w-5xl mx-auto p-2 md:p-2 space-y-8">
                {/* BASIC INFO */}
                <section className="relative overflow-visible bg-[#2563EB] rounded-xl border border-blue-700/50 shadow-2xl transition-all duration-500 group">
                    {/* Decorative Ambient Glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400/20 blur-[100px] rounded-full group-hover:bg-blue-400/30 transition-all duration-700"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>

                    <div className="relative p-2 md:p-3 flex flex-col lg:flex-row justify-between items-start gap-4">

                        {/* LEFT SIDE: Name and Description */}
                        <div className="flex-1 w-full space-y-3">
                            {/* Checklist Name Input */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] text-[#bfdbfe] font-black uppercase tracking-[0.2em] ml-1">
                                    Checklist Name <span className="text-rose-400 font-bold">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Annual Compliance Audit 2024"
                                    className="pl-2 w-full bg-[#1B52C9] text-white text-lg font-medium border border-blue-400/20 rounded-lg px-2 outline-none transition-all duration-300 placeholder:text-white/30 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10  shadow-inner"
                                    value={checklist.name}
                                    onChange={(e) => setChecklist({ ...checklist, name: e.target.value })}
                                />
                            </div>

                            {/* Description Textarea */}
                            <div className="space-y-2 ">
                                <label className="text-[10px] font-black text-[#bfdbfe] uppercase tracking-[0.2em] ml-1 block">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Describe the purpose and scope of this master checklist..."
                                    className=" w-full bg-[#1B52C9] text-blue-50 text-sm border border-blue-400/20 rounded-xl px-2 py-2 outline-none transition-all duration-300 placeholder:text-white/30 resize-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 shadow-inner 
                                    /* --- TAILWIND SCROLLBAR CLASSES --- */
                                    [&::-webkit-scrollbar]:w-1.5
                                    [&::-webkit-scrollbar-track]:bg-transparent
                                    [&::-webkit-scrollbar-thumb]:bg-blue-500/20
                                    [&::-webkit-scrollbar-thumb]:rounded-full
                                    hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/40"

                                    value={checklist.description}
                                    onChange={(e) => setChecklist({ ...checklist, description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* RIGHT SIDE: Status Dropdown Card */}
                        <div className="w-full lg:w-auto lg:min-w-[240px]">
                            <div className="bg-[#0f172a]/30 p-3 rounded-2xl border border-blue-400/20 backdrop-blur-md">


                                {/* --- SEGMENTED SWITCH --- */}
                                <div className="flex p-1 bg-[#011e5c] rounded-2xl border border-blue-800/30 shadow-xl">
                                    {['Active', 'Archived'].map((statusOption) => {
                                        const isActive = checklist.status === statusOption;

                                        return (
                                            <button
                                                key={statusOption}
                                                type="button"
                                                onClick={() => setChecklist({ ...checklist, status: statusOption })}
                                                className={`
              flex-1 flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl
              text-[11px] font-black uppercase tracking-widest transition-all duration-300
              ${isActive
                                                        ? 'bg-[#1e293b]/50 border border-blue-400/30 text-white shadow-inner'
                                                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                                                    }
            `}
                                            >
                                                {/* Status Indicator Dot */}
                                                <div className={`
              w-2 h-2 rounded-full transition-all duration-500
              ${statusOption === 'Active'
                                                        ? (isActive ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-emerald-500/40')
                                                        : (isActive ? 'bg-slate-400 shadow-[0_0_10px_#94a3b8]' : 'bg-white/50 ')
                                                    }
            `}></div>

                                                {statusOption}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* DND CONTEXT AREA (UI UNCHANGED) */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={checklist.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-6">
                            {checklist.sections.map((section) => (
                                <SortableSection key={section.id} section={section}>
                                    {(listeners, attributes) => (
                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible transition-all duration-300 relative">

                                            {/* --- UPDATED TOP BAR WITH CENTERED GRIP & RIGHT-SIDE TRASH --- */}
                                            <div className="relative flex justify-center py-2 bg-slate-50 border-b rounded-t-xl border-slate-100 px-4">
                                                <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing text-blue-500 hover:text-blue-600 transition-colors p-1 rounded-md hover:shadow-sm">
                                                    <GripHorizontal size={20} />
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        if (window.confirm("Delete this entire section?")) {
                                                            const updated = checklist.sections.filter(s => s.id !== section.id);
                                                            setChecklist({ ...checklist, sections: updated });
                                                        }
                                                    }}
                                                    className="absolute right-4 p-1 text-red-500 hover:text-red-500 hover:bg-white rounded-md transition-all  hover:shadow-sm"
                                                    title="Delete Section"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            <div className={`p-2 rounded-b-xl border-b border-slate-100 flex items-center justify-between transition-colors ${section.isExpanded ? 'bg-slate-50 border-b border-slate-100' : 'bg-white'}`}>
                                                <input type="text" value={section.name} onChange={(e) => { const updated = checklist.sections.map(s => s.id === section.id ? { ...s, name: e.target.value } : s); setChecklist({ ...checklist, sections: updated }); }} className="bg-slate-50 font-bold text-slate-500 text-sm border border-slate-100 ml-2 p-4 rounded-lg outline-none uppercase tracking-tight w-full max-w-[6500px] hover:border-indigo-200 focus:ring-1 focus:ring-indigo-500 transition-all duration-200" placeholder="Please Enter Section Name... " />
                                                <div className="flex items-center gap-3">
                                                    <span className="ml-5 text-[10px] w-[90px] font-bold text-slate-400 bg-white text-center px-1 py-1 rounded border border-slate-200">{section.questions.length}  Questions</span>

                                                    <button onClick={() => { const updated = checklist.sections.map(s => s.id === section.id ? { ...s, isExpanded: !s.isExpanded } : s); setChecklist({ ...checklist, sections: updated }); }} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">{section.isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button></div>
                                            </div>
                                            {section.isExpanded && (
                                                <div className="p-4 md:p-4 space-y-4">
                                                    {section.questions.map((q, qIdx) => (
                                                        <div
                                                            key={q.id}
                                                            draggable
                                                            onDragStart={(e) => {
                                                                e.dataTransfer.setData("qIdx", qIdx);
                                                                e.currentTarget.style.opacity = '0.4';
                                                            }}
                                                            onDragEnd={(e) => {
                                                                e.currentTarget.style.opacity = '1';
                                                            }}
                                                            onDragOver={(e) => e.preventDefault()}
                                                            onDrop={(e) => {
                                                                e.preventDefault();
                                                                const sourceIdx = parseInt(e.dataTransfer.getData("qIdx"));
                                                                handleQuestionReorder(section.id, sourceIdx, qIdx);
                                                            }}
                                                            className="group border border-slate-200 rounded-xl overflow-visible hover:border-blue-300 transition-all bg-white mb-4 shadow-sm"
                                                        >
                                                            {/* --- HEADER PART --- */}
                                                            <div
                                                                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${q.isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'}`}
                                                                onClick={() => updateQuestion(section.id, q.id, 'isExpanded', !q.isExpanded)}
                                                            >
                                                                <div className="flex items-center justify-between gap-4 flex-1">
                                                                    {/* LEFT SIDE */}
                                                                    <div className="flex items-center gap-4">
                                                                        {/* DRAG HANDLE */}
                                                                        <div className="cursor-grab active:cursor-grabbing p-1 text-blue-500 hover:text-blue-500 transition-colors">
                                                                            <GripHorizontal size={18} />
                                                                        </div>

                                                                        <span className="w-7 h-7 rounded-xl bg-slate-100 text-[10px] font-black flex items-center justify-center text-slate-400">
                                                                            {qIdx + 1}
                                                                        </span>

                                                                        <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                                                                            {q.title || "Question Title Required..."}
                                                                        </span>
                                                                    </div>

                                                                    {/* RIGHT SIDE (Copy/Trash) */}
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const newQ = {
                                                                                    ...JSON.parse(JSON.stringify(q)),
                                                                                    id: `copy-${Date.now()}`,
                                                                                    isExpanded: true
                                                                                };
                                                                                const ns = checklist.sections.map(sec =>
                                                                                    sec.id === section.id
                                                                                        ? { ...sec, questions: [...sec.questions, newQ] }
                                                                                        : sec
                                                                                );
                                                                                setChecklist({ ...checklist, sections: ns });
                                                                                toast.success("Question Cloned Successfully");
                                                                            }}
                                                                            className="flex items-center justify-center p-2 bg-slate-50 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100"
                                                                        >
                                                                            <Copy size={16} />
                                                                        </button>

                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                deleteQuestion(section.id, q.id);
                                                                            }}
                                                                            className="flex items-center justify-center p-2 bg-slate-50 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-4 ml-4">
                                                                    <div className="flex items-center gap-2">
                                                                        {q.isMandatory && (
                                                                            <span className="text-[9px] font-black bg-rose-50 text-rose-500 px-2 py-0.5 rounded border border-rose-100 uppercase tracking-tighter">
                                                                                MANDATORY
                                                                            </span>
                                                                        )}
                                                                        {q.answerType === 'TABLE' && <Table size={14} className="text-blue-500" />}
                                                                    </div>
                                                                    <ChevronDown size={18} className={`text-slate-300 transition-transform duration-300 ${q.isExpanded ? 'rotate-180 text-blue-500' : ''}`} />
                                                                </div>
                                                            </div>

                                                            {q.isExpanded && (
                                                                <div className="px-4 pb-4 pt-1 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">


                                                                    {/* 1. FULL WIDTH: TITLE & GUIDANCE */}
                                                                    <div className="space-y-6">
                                                                        <div className="space-y-2">
                                                                            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block ml-1">Question Title <span className='text-red-500'>*</span></label>
                                                                            <input
                                                                                type="text"
                                                                                className="w-full font-medium placeholder:text-[14px] text-slate-700 border border-slate-200 py-1 px-2 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                                                                                value={q.title}
                                                                                onChange={(e) => updateQuestion(section.id, q.id, 'title', e.target.value)}
                                                                                placeholder="e.g. Current Operational Status"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Guidance / Remarks <span className='text-red-500'>*</span></label>
                                                                            <textarea
                                                                                rows="2"
                                                                                className="w-full text-[14px] text-slate-500 bg-slate-50 rounded-xl p-2 border border-slate-00 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 outline-none resize-none transition-all"
                                                                                value={q.guidance}
                                                                                onChange={(e) => updateQuestion(section.id, q.id, 'guidance', e.target.value)}
                                                                                placeholder="Provide additional instructions here..."
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* 2. POWER ROW: ANSWER TYPE + CHECKBOXES (All in one line) */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">

                                                                        {/* Answer Type */}
                                                                        <div className="space-y-2 text-left">
                                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">
                                                                                Answer Type
                                                                            </label>

                                                                            <div className="relative" ref={openDropdownId === q.id ? dropdownRef : null}>

                                                                                {/* Trigger */}
                                                                                <div
                                                                                    onClick={() => setOpenDropdownId(openDropdownId === q.id ? null : q.id)}
                                                                                    className={`w-full text-xs font-semibold p-2 border-2 rounded-xl bg-white flex justify-between items-center cursor-pointer transition-all
                                                                                                ${openDropdownId === q.id
                                                                                            ? "border-blue-500"
                                                                                            : "border-slate-100 hover:border-slate-200"
                                                                                        }`}
                                                                                >
                                                                                    <span className="uppercase text-slate-700">
                                                                                        {answerOptions.find((o) => o.value === q.answerType)?.label}
                                                                                    </span>

                                                                                    <ChevronDown
                                                                                        size={16}
                                                                                        className={`text-slate-400 transition-transform ${openDropdownId === q.id ? "rotate-180 text-blue-500" : ""
                                                                                            }`}
                                                                                    />
                                                                                </div>

                                                                                {/* Dropdown */}
                                                                                {openDropdownId === q.id && (
                                                                                    <div className="absolute left-0 top-full mt-2 w-full bg-white border-2 border-slate-100 rounded-xl shadow-md p-2 z-50">

                                                                                        {answerOptions.map((opt) => (
                                                                                            <div
                                                                                                key={opt.value}
                                                                                                onClick={() => {
                                                                                                    updateQuestion(section.id, q.id, "answerType", opt.value);
                                                                                                    setOpenDropdownId(null);
                                                                                                }}
                                                                                                className={`px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition
                                                                                                ${q.answerType === opt.value
                                                                                                        ? "bg-blue-50 text-blue-600"
                                                                                                        : "text-slate-600 hover:bg-slate-50"
                                                                                                    }`}
                                                                                            >
                                                                                                {opt.label}
                                                                                            </div>
                                                                                        ))}

                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Mandatory Checkbox */}
                                                                        <div className="flex items-center pb-2">
                                                                            <label className="flex items-center gap-4 cursor-pointer group">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="w-4 h-4 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                                                                                    checked={q.isMandatory}
                                                                                    onChange={(e) => updateQuestion(section.id, q.id, 'isMandatory', e.target.checked)}
                                                                                />
                                                                                <span className="text-[11px] font-black text-slate-500 uppercase group-hover:text-slate-800 transition-colors tracking-widest">Mandatory</span>
                                                                            </label>
                                                                        </div>

                                                                        {/* Allow Upload Checkbox */}
                                                                        <div className="flex items-center pb-2">
                                                                            <label className="flex items-center gap-4 cursor-pointer group">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                                                                                    checked={q.allowUpload}
                                                                                    onChange={(e) =>
                                                                                        updateQuestion(section.id, q.id, 'allowUpload', e.target.checked)
                                                                                    }
                                                                                />
                                                                                <span className="text-[11px] font-black text-slate-500 uppercase group-hover:text-slate-800 transition-colors tracking-widest">Allow Document Upload</span>
                                                                            </label>
                                                                        </div>

                                                                        <div className="pb-1 flex flex-end max-w-[300px] w-full">
                                                                            {!q.attachedFileName ? (
                                                                                <label className="text-slate-500 hover:text-blue-500 border -mb-1 hover:border-blue-400 hover:bg-blue-50 p-1 rounded-lg cursor-pointer transition-all">
                                                                                    <div className="p-1 hover:bg-blue-50 flex items-center gap-2 max-w-[170px]">
                                                                                        <Paperclip size={16} className="flex-shrink-0" />
                                                                                        <span className="text-[11px] font-black text-slate-500 truncate uppercase tracking-widest">
                                                                                            Attach Sample File
                                                                                        </span>
                                                                                    </div>
                                                                                    <input
                                                                                        type="file"
                                                                                        className="hidden"
                                                                                        onChange={(e) => {
                                                                                            const file = e.target.files[0];
                                                                                            // SOLUTION: Use section.id and q.id instead of sIdx and qIdx
                                                                                            if (file) updateQuestion(section.id, q.id, 'attachedFileName', file.name);
                                                                                        }}
                                                                                    />
                                                                                </label>
                                                                            ) : (
                                                                                <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 px-2 py-2 -mb-1 rounded-md animate-in fade-in zoom-in-95">
                                                                                    <FileText size={14} className="text-blue-600" />
                                                                                    <span className="text-[10px] font-bold text-blue-700 truncate max-w-[180px]">
                                                                                        {q.attachedFileName}
                                                                                    </span>
                                                                                    {/* Optional: Add a button to remove the file */}
                                                                                    <button
                                                                                        onClick={() => updateQuestion(section.id, q.id, 'attachedFileName', null)}
                                                                                        className="ml-1 text-blue-400 hover:text-red-500 transition-colors"
                                                                                    >
                                                                                        <CircleX size={12} />
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* 3. DYNAMIC DATA SECTION (Options/Table) */}
                                                                    {(q.answerType !== 'SHORT_TEXT' && q.answerType !== 'LONG_TEXT' && q.answerType !== 'YES_NO') && (
                                                                        <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-4 animate-in fade-in duration-300">

                                                                            {/* OPTIONS LIST */}
                                                                            {(q.answerType === 'MULTIPLE_CHOICE' || q.answerType === 'CHECKBOX') && (
                                                                                <div className="space-y-4">
                                                                                    <div className="flex justify-between items-center mb-4">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <List size={18} className="text-blue-600" />
                                                                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Configure Options List</span>
                                                                                        </div>

                                                                                        {/* Top button only shows if there are NO options yet */}
                                                                                        {(!q.options || q.options.length === 0) && (
                                                                                            <button
                                                                                                onClick={() => addOption(section.id, q.id, q.options)}
                                                                                                className="bg-white px-5 py-2.5 border border-slate-200 rounded-xl text-blue-600 font-bold text-[10px] uppercase flex items-center gap-2 hover:bg-blue-50 transition-all shadow-sm"
                                                                                            >
                                                                                                <Plus size={14} /> Add First Option
                                                                                            </button>
                                                                                        )}
                                                                                    </div>

                                                                                    <div className="grid grid-cols-1 gap-3">
                                                                                        {(q.options || []).map((opt, index) => {
                                                                                            // LOGIC: Check if this is the last item in the array
                                                                                            const isLastItem = index === q.options.length - 1;

                                                                                            return (
                                                                                                <div key={opt.id} className="flex items-center gap-3 animate-in zoom-in-95">
                                                                                                    <input
                                                                                                        type="text"
                                                                                                        className="flex-1 text-sm font-bold text-slate-700 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-white shadow-sm"
                                                                                                        placeholder={`Option ${index + 1}...`}
                                                                                                        value={opt.text}
                                                                                                        onChange={(e) => updateOption(section.id, q.id, opt.id, e.target.value, q.options)}
                                                                                                    />

                                                                                                    <div className="flex items-center gap-2">
                                                                                                        {/* DELETE BUTTON: Always shown */}
                                                                                                        <button
                                                                                                            onClick={() => deleteOption(section.id, q.id, opt.id, q.options)}
                                                                                                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl border border-slate-100 transition-colors shadow-sm"
                                                                                                            title="Remove Option"
                                                                                                        >
                                                                                                            <CircleX size={18} />
                                                                                                        </button>

                                                                                                        {/* PLUS BUTTON: Only visible on the LAST item */}
                                                                                                        {isLastItem ? (
                                                                                                            <button
                                                                                                                onClick={() => addOption(section.id, q.id, q.options)}
                                                                                                                className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 transition-all shadow-sm animate-in zoom-in-50 duration-300"
                                                                                                                title="Add Next Option"
                                                                                                            >
                                                                                                                <Plus size={18} />
                                                                                                            </button>
                                                                                                        ) : (
                                                                                                            /* Spacer to maintain alignment when Plus is hidden */
                                                                                                            <div className="w-[46px]"></div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* TABLE CONFIG */}
                                                                            {q.answerType === 'TABLE' && (
                                                                                <div className="space-y-4 animate-in fade-in duration-300">
                                                                                    {/* HEADER */}
                                                                                    <div className="flex justify-between items-center mb-4">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <Table size={18} className="text-blue-500" />
                                                                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                                                                                                Configure Table Columns
                                                                                            </span>
                                                                                        </div>

                                                                                        {/* Top Add Button: Only shows if the list is empty */}
                                                                                        {(!q.tableColumns || q.tableColumns.length === 0) && (
                                                                                            <button
                                                                                                onClick={() => addTableColumn(section.id, q.id, q.tableColumns)}
                                                                                                className="bg-white px-5 py-2.5 border border-slate-200 rounded-xl text-blue-600 font-bold text-[10px] uppercase flex items-center gap-2 hover:bg-blue-50 transition-all shadow-sm"
                                                                                            >
                                                                                                <Plus size={14} /> Add First Column
                                                                                            </button>
                                                                                        )}
                                                                                    </div>

                                                                                    {/* COLUMN ROWS */}
                                                                                    <div className="space-y-1">
                                                                                        {(q.tableColumns || []).map((col, index) => {
                                                                                            // LOGIC: Check if this is the last item in the list
                                                                                            const isLastItem = index === q.tableColumns.length - 1;

                                                                                            return (
                                                                                                <div
                                                                                                    key={col.id}
                                                                                                    className="flex flex-col md:flex-row items-center gap-3 bg-white p-2  transition-all hover:border-slate-200"
                                                                                                >
                                                                                                    {/* Row Number */}
                                                                                                    <span className="text-[10px] font-bold text-slate-300 px-2 min-w-[24px]">
                                                                                                        {index + 1}
                                                                                                    </span>

                                                                                                    {/* Column Label Input */}
                                                                                                    <input
                                                                                                        type="text"
                                                                                                        className="flex-1 w-full text-xs font-bold text-slate-700 border border-slate-100 p-2 rounded-xl outline-none focus:ring-1 focus:border-blue-500 "
                                                                                                        placeholder="Column Label"
                                                                                                        value={col.name}
                                                                                                        onChange={(e) => updateTableColumn(section.id, q.id, col.id, 'name', e.target.value, q.tableColumns)}
                                                                                                    />

                                                                                                    {/* Data Type Select */}
                                                                                                    <div className="relative w-full md:w-40 overflow-visible">
                                                                                                        <div
                                                                                                            onClick={() => setOpenColTypeDropdownId(openColTypeDropdownId === col.id ? null : col.id)}
                                                                                                            className={`w-full text-[11px] font-black text-slate-500 border p-2.5 rounded-xl bg-slate-50 flex justify-between items-center cursor-pointer transition-all shadow-sm hover:border-slate-300 ${openColTypeDropdownId === col.id ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-100'
                                                                                                                }`}
                                                                                                        >
                                                                                                            <span className="uppercase">{col.type}</span>
                                                                                                            <ChevronDown
                                                                                                                size={14}
                                                                                                                className={`text-slate-400 transition-transform duration-200 ${openColTypeDropdownId === col.id ? 'rotate-180 text-blue-500' : ''}`}
                                                                                                            />
                                                                                                        </div>

                                                                                                        {openColTypeDropdownId === col.id && (
                                                                                                            <>
                                                                                                                {/* Overlay to close on tap elsewhere on mobile */}

                                                                                                                <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-md p-2">

                                                                                                                    {tableColumnTypes.map((t) => (
                                                                                                                        <div
                                                                                                                            key={t}
                                                                                                                            onClick={() => {
                                                                                                                                updateTableColumn(section.id, q.id, col.id, "type", t, q.tableColumns);
                                                                                                                                setOpenColTypeDropdownId(null);
                                                                                                                            }}
                                                                                                                            className={`px-3 py-2 text-[11px] font-semibold rounded-lg cursor-pointer transition
                                                                                                                            ${col.type === t
                                                                                                                                    ? "bg-blue-50 text-blue-600"
                                                                                                                                    : "text-slate-600 hover:bg-slate-50"
                                                                                                                                }`}
                                                                                                                        >
                                                                                                                            {t}
                                                                                                                        </div>
                                                                                                                    ))}

                                                                                                                </div>
                                                                                                            </>
                                                                                                        )}
                                                                                                    </div>

                                                                                                    {/* ACTION BUTTONS */}
                                                                                                    <div className="flex items-center gap-2 ml-2 min-w-[80px] justify-end">
                                                                                                        {/* TRASH ICON: Always Red */}
                                                                                                        <button
                                                                                                            onClick={() => deleteTableColumn(section.id, q.id, col.id, q.tableColumns)}
                                                                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                                                            title="Delete Column"
                                                                                                        >
                                                                                                            <CircleX size={16} />
                                                                                                        </button>

                                                                                                        {/* PLUS ICON: Only visible on the LAST item */}
                                                                                                        {isLastItem ? (
                                                                                                            <button
                                                                                                                onClick={() => addTableColumn(section.id, q.id, q.tableColumns)}
                                                                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors animate-in zoom-in-50 duration-300"
                                                                                                                title="Add Next Column"
                                                                                                            >
                                                                                                                <Plus size={20} />
                                                                                                            </button>
                                                                                                        ) : (
                                                                                                            /* Hidden spacer to keep alignment consistent */
                                                                                                            <div className="w-[36px]"></div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>

                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}


                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addQuestion(section.id)} className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-blue-600 font-black text-[11px] uppercase flex items-center justify-center gap-3 hover:bg-blue-50 transition-all"><Plus size={16} /> Add Question</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </SortableSection>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
                <button onClick={() => { const newSec = { id: `sec-${Date.now()}`, name: 'New Section Block', isExpanded: true, questions: [] }; setChecklist({ ...checklist, sections: [...checklist.sections, newSec] }); }} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all group"><div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors"><FileText size={20} /></div><span className="text-xs font-black uppercase tracking-widest">Add Section Block</span></button>
            </div>

            {/* ACTION FOOTER (UI UNCHANGED) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-30"><div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest"><Info size={14} className="text-indigo-400" /> Drafts update automatically.</div><div className="flex gap-4 w-full md:w-auto"><button className="px-10 py-3 text-slate-500 font-black text-[11px] uppercase border border-slate-200 rounded-xl hover:bg-slate-50">Save as Draft</button><button onClick={handleSaveChecklist} className="flex-1 md:flex-none px-12 py-3 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"><Save size={16} /> {checklist.id ? 'Update Master' : 'Publish Master'}</button></div></div></div>
        </div>
    );
};

export default MasterChecklistBuilder;



