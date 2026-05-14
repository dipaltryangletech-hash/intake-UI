import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Save, Plus, Trash2, Layout, ChevronDown,
    ChevronUp, Clock, User, Hash, GripHorizontal, Paperclip, Search,
    Copy, FileText, Flag, Table, List,
    CircleX
} from 'lucide-react';

// DND-KIT IMPORTS
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import MasterChecklistPopup from './masterchecklistpopup';

// --- SUB-COMPONENT: SORTABLE QUESTION ---
const SortableQuestion = ({ q, qIdx, sIdx, updateQuestion, deleteQuestion, answerOptions }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: q.id });
    const [openColTypeDropdownId, setOpenColTypeDropdownId] = useState(null);
    const [isAnswerTypeOpen, setIsAnswerTypeOpen] = useState(false);
    const answerTypeRef = useRef(null);
    const colTypeRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (answerTypeRef.current && !answerTypeRef.current.contains(event.target)) {
                setIsAnswerTypeOpen(false);
            }
            if (colTypeRef.current && !colTypeRef.current.contains(event.target)) {
                setOpenColTypeDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const tableColumnTypes = ["Text", "Number", "Currency", "Date", "Email", "Phone"];

    const addTableColumn = () => updateQuestion(sIdx, qIdx, 'tableColumns', [...(q.tableColumns || []), { id: Date.now(), name: '', type: 'Text' }]);
    const updateTableColumn = (colId, field, value) => updateQuestion(sIdx, qIdx, 'tableColumns', (q.tableColumns || []).map(c => c.id === colId ? { ...c, [field]: value } : c));
    const deleteTableColumn = (colId) => (q.tableColumns || []).length > 1 && updateQuestion(sIdx, qIdx, 'tableColumns', (q.tableColumns || []).filter(c => c.id !== colId));

    const addOption = () => updateQuestion(sIdx, qIdx, 'options', [...(q.options || []), { id: Date.now(), text: '' }]);
    const updateOption = (optId, value) => updateQuestion(sIdx, qIdx, 'options', (q.options || []).map(o => o.id === optId ? { ...o, text: value } : o));
    const deleteOption = (optId) => (q.options || []).length > 1 && updateQuestion(sIdx, qIdx, 'options', (q.options || []).filter(o => o.id !== optId));

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="border border-slate-200 rounded-xl bg-white shadow-sm hover:border-blue-200 transition-all">
            <div
                className={`p-2 flex flex-col sm:flex-row rounded-t-2xl items-start sm:items-center justify-between gap-3 sm:gap-0 cursor-pointer ${q.isExpanded ? 'bg-slate-50' : ''}`}
                onClick={() => updateQuestion(sIdx, qIdx, 'isExpanded', !q.isExpanded)}
            >
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Handle attached to Grip icon */}
                    <div {...listeners} {...attributes} className=" text-blue-400 cursor-grab active:cursor-grabbing p-2 sm:p-1 hover:bg-blue-50 rounded">
                        <GripHorizontal size={16} />
                    </div>
                    <span className="w-7 h-7 shrink-0 rounded-full bg-blue-50 text-[10px] font-black flex items-center justify-center text-blue-400 border border-blue-100">
                        {qIdx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-tight break-all sm:break-normal">
                        {q.title || "QUESTION TITLE REQUIRED..."}
                    </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                    <button onClick={(e) => { e.stopPropagation(); /* Clone logic can be added here */ }} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg"><Copy size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteQuestion(sIdx, qIdx); }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    <ChevronDown size={18} className={`text-slate-300 transition-transform ${q.isExpanded ? 'rotate-180 text-blue-500' : ''}`} />
                </div>
            </div>

            {q.isExpanded && (
                <div className="px-3 sm:px-4 py-4 space-y-[10px] animate-in fade-in slide-in-from-top-1">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block ml-1">Question Title *</label>
                        <input
                            type="text"
                            className="w-full text-sm font-medium text-slate-600 border border-slate-200 py-2 px-2 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                            value={q.title}
                            onChange={(e) => updateQuestion(sIdx, qIdx, 'title', e.target.value)}
                            placeholder="e.g. Current Operational Status"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Guidance / Remarks *</label>
                        <textarea
                            rows="2"
                            className="w-full text-sm text-slate-500 bg-slate-50/50 rounded-xl p-2 border border-slate-200 focus:bg-white focus:border-blue-500 outline-none resize-none transition-all placeholder:text-slate-300"
                            value={q.guidance}
                            onChange={(e) => updateQuestion(sIdx, qIdx, 'guidance', e.target.value)}
                            placeholder="Provide additional instructions here..."
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start lg:items-end">
                        {/* 1. ANSWER TYPE */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Answer Type</label>
                            <div className="relative" ref={answerTypeRef}>
                                <div
                                    onClick={() => setIsAnswerTypeOpen(!isAnswerTypeOpen)}
                                    className={`w-full p-2 rounded-lg border-2 bg-white text-[11px] font-bold text-slate-600 flex justify-between items-center cursor-pointer uppercase transition-all ${isAnswerTypeOpen ? "border-blue-500" : "border-slate-200 hover:border-slate-300"}`}
                                >
                                    <span>{answerOptions.find(o => o.value === q.answerType)?.label}</span>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isAnswerTypeOpen ? "rotate-180 text-blue-500" : ""}`} />
                                </div>
                                {isAnswerTypeOpen && (
                                    <div className="absolute left-0 top-full mt-2 w-full bg-white border-2 border-slate-200 rounded-xl shadow-md p-2 z-50">
                                        {answerOptions.map((opt) => (
                                            <div
                                                key={opt.value}
                                                onClick={() => {
                                                    updateQuestion(sIdx, qIdx, "answerType", opt.value);
                                                    setIsAnswerTypeOpen(false);
                                                }}
                                                className={`px-3 py-2 text-[11px] font-bold uppercase rounded-lg cursor-pointer transition ${q.answerType === opt.value ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
                                            >
                                                {opt.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. MANDATORY */}
                        <label className="flex pb-0 lg:pb-2 items-center gap-4 cursor-pointer group whitespace-nowrap">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
                                checked={q.isMandatory}
                                onChange={(e) => updateQuestion(sIdx, qIdx, 'isMandatory', e.target.checked)}
                            />
                            <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-800 uppercase tracking-widest">Mandatory</span>
                        </label>

                        {/* 3. ALLOW DOCUMENT UPLOAD */}
                        <label className="flex pb-0 lg:pb-2 items-center gap-4 cursor-pointer group whitespace-nowrap">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
                                checked={q.allowUpload}
                                onChange={(e) => updateQuestion(sIdx, qIdx, 'allowUpload', e.target.checked)}
                            />
                            <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-800 uppercase tracking-widest">Allow Document Upload</span>

                        </label>

                        {/* 4. PAPERCLIP ICON UPLOAD (New Column) */}
                        <div className="pb-0 lg:pb-1 flex lg:justify-end w-full">
                            {!q.attachedFileName ? (
                                <label className="text-slate-500 hover:text-blue-500 border lg:-mb-1 hover:border-blue-400 hover:bg-blue-50 p-1 rounded-lg cursor-pointer transition-all w-full lg:w-auto">
                                    <div className="p-1 hover:bg-blue-50 flex items-center justify-center lg:justify-start gap-2 max-w-full lg:max-w-[170px]">
                                        <Paperclip size={16} className="flex-shrink-0" />
                                        <span className="text-[10px] font-black text-slate-500 truncate uppercase tracking-widest">
                                            Attach Sample File
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    updateQuestion(sIdx, qIdx, 'attachedFileName', file.name);
                                                    updateQuestion(sIdx, qIdx, 'attachedFileData', event.target.result);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            ) : (
                                <div className="flex w-full lg:w-auto items-center justify-between lg:justify-start gap-1 bg-blue-50 border border-blue-100 px-2 py-2 lg:-mb-1 rounded-md animate-in fade-in zoom-in-95">
                                    <div className="flex items-center gap-2">
                                        <FileText size={14} className="text-blue-600" />
                                        <span className="text-[10px] font-bold text-blue-700 truncate max-w-[200px] lg:max-w-[150px]">
                                            {q.attachedFileName}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => updateQuestion(sIdx, qIdx, 'attachedFileName', null)}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. DYNAMIC DATA SECTION (Options/Table) */}
                    {(q.answerType !== 'SHORT_TEXT' && q.answerType !== 'LONG_TEXT' && q.answerType !== 'YES_NO') && (
                        <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3 sm:p-4 mt-6 animate-in fade-in duration-300">
                            {/* OPTIONS LIST */}
                            {(q.answerType === 'MULTIPLE_CHOICE' || q.answerType === 'CHECKBOX') && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <List size={18} className="text-blue-600 shrink-0" />
                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Configure Options List</span>
                                        </div>
                                        {(!q.options || q.options.length === 0) && (
                                            <button onClick={addOption} className="bg-white w-full sm:w-auto justify-center px-5 py-2.5 border border-slate-200 rounded-xl text-blue-600 font-bold text-[10px] uppercase flex items-center gap-2 hover:bg-blue-50 transition-all shadow-sm">
                                                <Plus size={14} /> Add First Option
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {(q.options || []).map((opt, index) => {
                                            const isLastItem = index === (q.options || []).length - 1;
                                            return (
                                                <div key={opt.id} className="flex items-center gap-2 sm:gap-3 animate-in zoom-in-95">
                                                    <span className="text-[10px] font-semibold text-slate-400 px-1 sm:px-2 min-w-[20px] sm:min-w-[24px] text-center">
                                                        {index + 1}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="flex-1 text-[12px] font-semibold text-slate-700 border border-slate-200 p-2 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white shadow-sm w-full"
                                                        placeholder={`Option ${index + 1}...`}
                                                        value={opt.text}
                                                        onChange={(e) => updateOption(opt.id, e.target.value)}
                                                    />
                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                        <button onClick={() => deleteOption(opt.id)} className="p-2 sm:p-3 text-red-500" title="Remove Option">
                                                            <CircleX size={16} />
                                                        </button>
                                                        {isLastItem ? (
                                                            <button onClick={addOption} className="p-2 sm:p-3 text-blue-600" title="Add Next Option">
                                                                <Plus size={16} />
                                                            </button>
                                                        ) : (
                                                            <div className="w-[32px] sm:w-[40px]"></div>
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
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Table size={18} className="text-blue-500 shrink-0" />
                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Configure Table Columns</span>
                                        </div>
                                        {(!q.tableColumns || q.tableColumns.length === 0) && (
                                            <button onClick={addTableColumn} className="bg-white w-full sm:w-auto justify-center px-5 py-2.5 border border-slate-200 rounded-xl text-blue-600 font-bold text-[10px] uppercase flex items-center gap-2 hover:bg-blue-50 transition-all shadow-sm">
                                                <Plus size={14} /> Add First Column
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2 sm:space-y-1">
                                        {(q.tableColumns || []).map((col, index) => {
                                            const isLastItem = index === (q.tableColumns || []).length - 1;
                                            return (
                                                <div key={col.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-white p-2 sm:p-0 rounded-lg sm:rounded-none transition-all hover:border-slate-200 border border-slate-100 sm:border-transparent">
                                                    <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                                                        <span className="text-[10px] font-bold text-slate-300 px-1 sm:px-2 min-w-[20px] sm:min-w-[24px] text-center">
                                                            {index + 1}
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="flex-1 w-full text-xs font-bold text-slate-700 border border-slate-100 p-2 rounded-lg outline-none focus:ring-1 focus:border-blue-500"
                                                            placeholder="Column Label"
                                                            value={col.name}
                                                            onChange={(e) => updateTableColumn(col.id, 'name', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pl-7 sm:pl-0">
                                                        <div className="relative w-full sm:w-32 md:w-40 overflow-visible" ref={colTypeRef}>
                                                            <div onClick={() => setOpenColTypeDropdownId(openColTypeDropdownId === col.id ? null : col.id)} className={`w-full text-[11px] font-black text-slate-500 border p-2.5 rounded-xl bg-slate-50 flex justify-between items-center cursor-pointer transition-all shadow-sm hover:border-slate-300 ${openColTypeDropdownId === col.id ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-100'}`}>
                                                                <span className="uppercase">{col.type}</span>
                                                                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${openColTypeDropdownId === col.id ? 'rotate-180 text-blue-500' : ''}`} />
                                                            </div>
                                                            {openColTypeDropdownId === col.id && (
                                                                <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-md p-2">
                                                                    {tableColumnTypes.map((t) => (
                                                                        <div key={t} onClick={() => { updateTableColumn(col.id, "type", t); setOpenColTypeDropdownId(null); }} className={`px-3 py-2 text-[11px] font-semibold rounded-lg cursor-pointer transition ${col.type === t ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}>
                                                                            {t}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 sm:gap-2 ml-0 sm:ml-2 min-w-[70px] sm:min-w-[80px] justify-end">
                                                            <button onClick={() => deleteTableColumn(col.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Column">
                                                                <CircleX size={16} />
                                                            </button>
                                                            {isLastItem ? (
                                                                <button onClick={addTableColumn} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors animate-in zoom-in-50 duration-300" title="Add Next Column">
                                                                    <Plus size={20} />
                                                                </button>
                                                            ) : (
                                                                <div className="w-[32px] sm:w-[36px]"></div>
                                                            )}
                                                        </div>
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
    );
};

// --- SUB-COMPONENT: SORTABLE SECTION ---
const SortableSection = ({ section, sIdx, assignment, setAssignment, updateQuestion, deleteQuestion, addQuestion, answerOptions, isOverlay }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Translate.toString(transform), // Use Translate for smoother movement than Transform
        transition,
        opacity: isDragging ? 0.3 : 1, // Make the original placeholder faint
        zIndex: isDragging ? 0 : 1,
    };

    const overlayStyle = isOverlay ? {
        cursor: 'grabbing',
        transform: 'scale(1.02)', // Slightly larger for "lifted" effect
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    } : {};

    const handleSectionDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleSectionDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = assignment.sections.findIndex((s) => s.id === active.id);
            const newIndex = assignment.sections.findIndex((s) => s.id === over.id);
            setAssignment({ ...assignment, sections: arrayMove(assignment.sections, oldIndex, newIndex) });
        }
        setActiveId(null);
    };

    return (
        <div ref={setNodeRef} style={{ ...style, ...overlayStyle }}
            className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible transition-shadow duration-300 relative ${isOverlay ? 'z-[100]' : ''}`} >
            <div className="relative flex justify-center py-1 bg-slate-50/50 border-b rounded-t-xl border-slate-100 px-2">
                <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing text-blue-400 hover:text-blue-500 transition-colors p-1">
                    <GripHorizontal size={20} />
                </div>
                <button
                    onClick={() => {
                        if (window.confirm("Delete this entire section?")) {
                            const ns = [...assignment.sections];
                            ns.splice(sIdx, 1);
                            setAssignment({ ...assignment, sections: ns });
                        }
                    }}
                    className="absolute right-2 sm:right-4 p-2 sm:p-1 text-red-400 hover:text-red-500 transition-all"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className={`p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${section.isExpanded ? 'bg-slate-50/30' : ''}`}>
                <input
                    type="text"
                    value={section.name}
                    onChange={(e) => {
                        const ns = [...assignment.sections];
                        ns[sIdx].name = e.target.value;
                        setAssignment({ ...assignment, sections: ns });
                    }}
                    className="bg-slate-50/50 font-bold text-sm border border-slate-200 ml-0 sm:ml-2 p-3 rounded-lg outline-none uppercase tracking-tight w-full text-slate-600 placeholder:text-slate-400 focus:border-blue-300 transition-all"
                    placeholder="PLEASE ENTER SECTION NAME..."
                />
                <div className="flex items-center justify-between w-full sm:w-auto gap-3 px-2 sm:px-0">
                    <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-2 rounded-lg whitespace-nowrap">
                        {section.questions.length} Questions
                    </span>
                    <button
                        onClick={() => {
                            const ns = [...assignment.sections];
                            ns[sIdx].isExpanded = !ns[sIdx].isExpanded;
                            setAssignment({ ...assignment, sections: ns });
                        }}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        {section.isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>
            </div>

            {section.isExpanded && (
                <div className="p-3 sm:p-4 space-y-4">
                    <DndContext collisionDetection={closestCenter} onDragStart={handleSectionDragStart} onDragEnd={handleSectionDragEnd}  >
                        <SortableContext items={section.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-4">
                                {section.questions.map((q, qIdx) => (
                                    <SortableQuestion
                                        key={q.id}
                                        q={q}
                                        qIdx={qIdx}
                                        sIdx={sIdx}
                                        updateQuestion={updateQuestion}
                                        deleteQuestion={deleteQuestion}
                                        answerOptions={answerOptions}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {/* Section drag */}

                    <button
                        onClick={() => addQuestion(sIdx)}
                        className="w-full py-4 bg-blue-50/50 border border-dashed border-blue-200 rounded-xl text-blue-600 font-black text-[11px] uppercase flex items-center justify-center gap-3 hover:bg-blue-100 transition-all shadow-sm"
                    >
                        <Plus size={16} /> Add Question
                    </button>
                </div>
            )}
        </div>
    );
};

const AssignmentBuilder = () => {
    const [userAnswers, setUserAnswers] = useState({});
    const { id: urlId } = useParams();
    const isEditMode = !!urlId;
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate(-1);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    // reviewer1, reviewer2, final finalApprover dropdown 
    const reviewer1Ref = useRef(null);
    const [isReviewer1Open, setIsReviewer1Open] = useState(false);
    const [reviewer1Search, setReviewer1Search] = useState("");
    const reviewer2Ref = useRef(null);
    const [isReviewer2Open, setIsReviewer2Open] = useState(false);
    const [reviewer2Search, setReviewer2Search] = useState("");
    const finalApproverRef = useRef(null);
    const [isFinalApproverOpen, setIsFinalApproverOpen] = useState(false);
    const [finalApproverSearch, setFinalApproverSearch] = useState("");
    const [fetchedUsers, setFetchedUsers] = useState([]);
    const filteredReviewers1 = fetchedUsers.filter(user =>
        user.toLowerCase().includes(reviewer1Search.toLowerCase())
    );
    const filteredReviewers2 = fetchedUsers.filter(user =>
        user.toLowerCase().includes(reviewer2Search.toLowerCase())
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const answerOptions = [
        { value: "SHORT_TEXT", label: "Short Text" },
        { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
        { value: "LONG_TEXT", label: "Long text" },
        { value: "YES_NO", label: "Yes / No" },
        { value: "TABLE", label: "Table" },
    ];

    const [isClientOpen, setIsClientOpen] = useState(false);
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [isCopyPopupOpen, setIsCopyPopupOpen] = useState(false);
    const [clientSearch, setClientSearch] = useState("");
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const clientRef = useRef(null);
    const priorityRef = useRef(null);

    const [clients, setClients] = useState([]);
    const [users, setUsers] = useState([]);
    const [assignment, setAssignment] = useState({
        id: `ASG-${Math.floor(100000 + Math.random() * 900000)}`,
        name: '',
        client: '',
        priority: 'Medium',
        createdBy: 'Admin User',
        createdOn: new Date().toLocaleString('en-GB'),
        sections: []
    });

    const priorityOptions = [
        { label: "Low", color: "text-slate-500" },
        { label: "Medium", color: "text-blue-500" },
        { label: "High", color: "text-orange-500" }
    ];

    useEffect(() => {
        const savedClients = JSON.parse(localStorage.getItem('client')) || [];
        setClients(savedClients);

        const savedUsers = JSON.parse(localStorage.getItem('my_app_users')) || [];
        setUsers(savedUsers);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (clientRef.current && !clientRef.current.contains(event.target)) {
                setIsClientOpen(false);
            }
            if (priorityRef.current && !priorityRef.current.contains(event.target)) {
                setIsPriorityOpen(false);
            }
            if (reviewer1Ref.current && !reviewer1Ref.current.contains(event.target)) {
                setIsReviewer1Open(false);
            }
            if (reviewer2Ref.current && !reviewer2Ref.current.contains(event.target)) {
                setIsReviewer2Open(false);
            }
            if (finalApproverRef.current && !finalApproverRef.current.contains(event.target)) {
                setIsFinalApproverOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleImportMasterData = (selectedMaster) => {
        if (!selectedMaster || !selectedMaster.sections) return;
        const importedSections = JSON.parse(JSON.stringify(selectedMaster.sections)).map(s => ({
            ...s,
            id: `sec-${Math.random()}`,
            isExpanded: true,
            questions: (s.questions || []).map(q => ({
                ...q,
                id: `q-${Math.random()}`,
                isExpanded: false,
                options: q.options || [],
                tableColumns: q.tableColumns || []
            }))
        }));
        setAssignment(prev => ({ ...prev, sections: [...prev.sections, ...importedSections] }));
        setIsDetailsVisible(true);
    };

    const addManualSection = () => {
        const newSec = { id: `sec-${Date.now()}`, isExpanded: true, questions: [] };
        setAssignment(prev => ({ ...prev, sections: [...prev.sections, newSec] }));
        setIsDetailsVisible(true);
    };

    const addQuestion = (sIdx) => {
        const ns = [...assignment.sections];
        ns[sIdx].questions.push({
            id: `q-${Date.now()}`,
            title: '',
            guidance: '',
            answerType: 'SHORT_TEXT',
            isMandatory: false,
            allowUpload: false,
            isExpanded: true,
            options: [],
            tableColumns: []
        });
        setAssignment({ ...assignment, sections: ns });
    };

    const updateQuestion = (sIdx, qIdx, field, value) => {
        const ns = [...assignment.sections];
        ns[sIdx].questions[qIdx][field] = value;
        setAssignment({ ...assignment, sections: ns });
    };

    const deleteQuestion = (sIdx, qIdx) => {
        const ns = [...assignment.sections];
        ns[sIdx].questions.splice(qIdx, 1);
        setAssignment({ ...assignment, sections: ns });
    };

    const handleSectionDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = assignment.sections.findIndex((s) => s.id === active.id);
            const newIndex = assignment.sections.findIndex((s) => s.id === over.id);
            setAssignment({ ...assignment, sections: arrayMove(assignment.sections, oldIndex, newIndex) });
        }
    };

    const handleSelectFinalApprover = (name) => {
        setAssignment(prev => ({ ...prev, finalApprover: name }));
        setFinalApproverSearch("");
        setIsFinalApproverOpen(false);
    };


    const handleQuestionDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = section.questions.findIndex(q => q.id === active.id);
            const newIndex = section.questions.findIndex(q => q.id === over.id);

            const updatedQuestions = [...section.questions];
            const [movedItem] = updatedQuestions.splice(oldIndex, 1);
            updatedQuestions.splice(newIndex, 0, movedItem);

            const updatedSections = [...assignment.sections];
            updatedSections[sIdx].questions = updatedQuestions;

            setAssignment({
                ...assignment,
                sections: updatedSections
            });
        }
    };
    const saveAssignment = () => {
        if (!assignment.name || !assignment.client) {
            toast.error("Client and Assignment Name are required");
            return;
        }
        const existingAssignments = JSON.parse(localStorage.getItem('all_assignments')) || [];
        if (isEditMode) {
            const updatedList = existingAssignments.map((item) => item.id === assignment.id ? { ...assignment, updatedOn: new Date().toLocaleString('en-GB') } : item);
            localStorage.setItem('all_assignments', JSON.stringify(updatedList));
            toast.success("Assignment updated successfully!");
        } else {
            const finalAssignment = {
                ...assignment,
                id: `#${assignment.id.split('-')[1]}`,
                initials: assignment.client.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
                status: 'Sent',
                progress: 0,
                created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                due: 'Dec 2026',
                color: 'bg-blue-50 text-blue-600'
            };
            localStorage.setItem('all_assignments', JSON.stringify([finalAssignment, ...existingAssignments]));
            toast.success("Assignment Saved Successfully!");
        }
        setTimeout(() => navigate('/assignments'), 800);
    };

    const handleKeyDown = (e) => {
        if (!isClientOpen) return;
        if (e.key === "ArrowDown") setSelectedIndex(prev => (prev < filteredClients.length - 1 ? prev + 1 : prev));
        else if (e.key === "ArrowUp") setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        else if (e.key === "Enter" && selectedIndex >= 0) {
            const selectedClient = filteredClients[selectedIndex];
            setAssignment({ ...assignment, client: selectedClient });
            setClientSearch(selectedClient);
            setIsClientOpen(false);
            setSelectedIndex(-1);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.company && c.company.toLowerCase().includes(clientSearch.toLowerCase()))
    );
    const filteredReviewer1 = users.filter(u =>
        u.name.toLowerCase().includes(reviewer1Search.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(reviewer1Search.toLowerCase()))
    );
    const filteredReviewer2 = users.filter(u =>
        u.name.toLowerCase().includes(reviewer2Search.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(reviewer2Search.toLowerCase()))
    );
    const filteredFinalApprover = users.filter(u =>
        u.name.toLowerCase().includes(finalApproverSearch.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(finalApproverSearch.toLowerCase()))
    );

    useEffect(() => {
        if (isEditMode) {
            const existingEntries = JSON.parse(localStorage.getItem('all_assignments')) || [];
            const cleanId = urlId.startsWith('23') ? `#${urlId.substring(2)}` : urlId.includes('%23') ? urlId.replace('%23', '#') : urlId.startsWith('#') ? urlId : `#${urlId}`;
            const itemToEdit = existingEntries.find(item => item.id === urlId || item.id === cleanId);
            if (itemToEdit) {
                setAssignment(itemToEdit);
                setClientSearch(itemToEdit.client);
                setIsDetailsVisible(true);
            }
        }
    }, [urlId, isEditMode]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-poppins pb-0">
            <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-3">
                {/* LEFT SIDE: Title Group */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200 shrink-0">
                        <Layout size={18} />
                    </div>
                    <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                        {isEditMode ? 'Edit Assignment' : 'Assignment Builder'}
                    </h1>
                </div>

                {/* RIGHT SIDE: Buttons Grouped Together */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 w-full md:w-auto">
                    <button
                        onClick={handleCancel}
                        className="w-full sm:w-auto justify-center text-slate-500 hover:text-slate-800 py-2.5 sm:px-6 sm:py-2 text-[10px] border border-slate-300 hover:bg-gray-50 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={saveAssignment}
                        className="w-full sm:w-auto justify-center bg-blue-50 text-blue-600 border-2 border-blue-300 py-2.5 sm:px-8 sm:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-100 transition-colors"
                    >
                        <Save size={14} /> {isEditMode ? 'Save & Draft' : 'Save & Draft'}
                    </button>

                    <button
                        onClick={saveAssignment}
                        className="w-full sm:w-auto justify-center bg-blue-600 text-white py-2.5 sm:px-8 sm:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Save size={14} /> {isEditMode ? 'Update Assignment' : 'Send Assignment'}
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-3 sm:p-4 space-y-6 sm:space-y-8">
                {isDetailsVisible && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-4">
                        <div><p className="text-[9px] font-black text-slate-400 uppercase"><Hash size={10} className="inline mr-1" /> ID</p><p className="text-xs sm:text-sm font-bold text-blue-600 mt-1 sm:mt-2">{assignment.id}</p></div>
                        <div><p className="text-[9px] font-black text-slate-400 uppercase"><User size={10} className="inline mr-1" /> Creator</p><p className="text-xs sm:text-sm font-bold text-slate-800 mt-1 sm:mt-2 truncate">{assignment.createdBy}</p></div>
                        <div><p className="text-[9px] font-black text-slate-400 uppercase"><Clock size={10} className="inline mr-1" /> Created</p><p className="text-xs sm:text-sm font-bold text-slate-600 mt-1 sm:mt-2">{assignment.createdOn}</p></div>
                        <div><p className="text-[9px] font-black text-slate-400 uppercase"><Flag size={10} className="inline mr-1" /> Priority</p><p className="text-xs sm:text-sm font-bold text-blue-500 mt-1 sm:mt-2">{assignment.priority}</p></div>
                    </div>
                )}

                <div className="bg-[#eef2ff] rounded-2xl p-4 sm:p-5 mb-8 sm:mb-12 text-black border border-[#e0e7ff] shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-3">
                        <div className="lg:col-span-8 space-y-4 lg:space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-3">
                                <div className="relative" ref={clientRef}>
                                    <label className="text-[10px] font-black text-gray-700 uppercase mb-2 ml-1 block tracking-[0.2em]">Client Name <span className='text-red-400 text-[12px]'>*</span></label>

                                    {/* SELECT FIELD (Trigger) */}
                                    <div
                                        onClick={() => setIsClientOpen(!isClientOpen)}
                                        className={`w-full bg-white/100 border rounded-xl px-4 py-2.5 text-xs font-semibold flex justify-between items-center cursor-pointer transition-all
                    ${isClientOpen ? 'border-blue-400 ring-1 ring-blue-400/20' : 'border-slate-100 hover:border-[#c7d4f9]'}`}
                                    >
                                        <span className={assignment.client ? "text-slate-600 font-semibold" : "text-slate-400 font-medium"}>
                                            {assignment.client || "Select Client..."}
                                        </span>
                                        <ChevronDown size={16} className={`text-blue-600 transition-transform duration-300 ${isClientOpen ? 'rotate-180' : ''}`} />
                                    </div>

                                    {/* DROPDOWN CONTAINER (Search + List) */}
                                    {isClientOpen && (
                                        <div className="absolute z-[80] w-full mt-2 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-slide-in-from-top-2">
                                            {/* SEARCH BAR INSIDE DROPDOWN */}
                                            <div className="bg-white border-b border-slate-100">
                                                <div className="relative group">
                                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        placeholder="Search client name..."
                                                        className="w-full bg-white rounded-lg pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:border-blue-400 transition-all text-slate-600 placeholder:text-slate-400"
                                                        value={clientSearch}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => {
                                                            setClientSearch(e.target.value);
                                                            setSelectedIndex(0);
                                                        }}
                                                        onKeyDown={handleKeyDown}
                                                    />
                                                </div>
                                            </div>

                                            {/* CLIENT LIST */}
                                            <div className="bg-white p-2">
                                                <div className="max-h-48 overflow-y-auto scrollbar-hide space-y-1">
                                                    {filteredClients.length > 0 ? (
                                                        filteredClients.map((c, idx) => (
                                                            <div
                                                                key={c.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setAssignment({ ...assignment, client: c.name });
                                                                    setClientSearch("");
                                                                    setIsClientOpen(false);
                                                                }}
                                                                className={`group px-4 py-1.5 text-[10px] font-semibold tracking-wide uppercase cursor-pointer transition-all duration-200 flex justify-between items-center mb-1 last:mb-0 border rounded-md
                                            ${assignment.client === c.name
                                                                        ? 'bg-blue-50 border-[#c7d4f9] text-blue-600 shadow-sm'
                                                                        : 'bg-white border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-100 hover:text-blue-600'}`}
                                                            >
                                                                <div className="flex items-center gap-1">
                                                                    <span>{c.name}</span>
                                                                </div>
                                                                {assignment.client === c.name && (
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                                                            No clients found
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-700 uppercase mb-2 ml-1 block tracking-[0.2em]">Assignment Name <span className='text-red-400 text-[12px]'>*</span></label>
                                    <input type="text" placeholder="e.g. Annual Audit" className="w-full bg-white/100 border border-slate-100 rounded-xl px-4 lg:px-2 py-2.5 text-xs font-semibold outline-none focus:border-[#c7d4f9] hover:border-[#c7d4f9] transition-all text-slate-600 placeholder:text-slate-400 placeholder:font-medium" value={assignment.name} onChange={(e) => setAssignment({ ...assignment, name: e.target.value })} />
                                </div>
                            </div>


                            {/* WRAPPER FOR SIDE-BY-SIDE DROPDOWNS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-4 mb-3">

                                {/* ========================================= */}
                                {/* 1st REVIEWER DROPDOWN */}
                                {/* ========================================= */}
                                <div className="relative" ref={reviewer1Ref}>
                                    {/* LABEL */}
                                    <label className="text-[10px] font-black text-gray-700 uppercase mb-2 ml-1 block tracking-[0.2em]">
                                        1st Reviewer
                                    </label>

                                    {/* TRIGGER / SELECT FIELD */}
                                    <div
                                        onClick={() => setIsReviewer1Open(!isReviewer1Open)}
                                        className={`w-full bg-white/100 border rounded-xl px-4 py-2.5 text-xs font-semibold flex justify-between items-center cursor-pointer transition-all
        ${isReviewer1Open ? 'border-blue-400 ring-2 ring-blue-400/20' : 'border-slate-100 hover:border-[#c7d4f9]'}`}
                                    >
                                        <span className={assignment.reviewer1 ? "text-slate-600 font-semibold" : "text-slate-400 font-medium"}>
                                            {assignment.reviewer1 || "Select 1st Reviewer..."}
                                        </span>
                                        <ChevronDown size={16} className={`text-blue-600 transition-transform duration-300 ${isReviewer1Open ? 'rotate-180' : ''}`} />
                                    </div>

                                    {/* DROPDOWN MENU */}
                                    {isReviewer1Open && (
                                        <div className="absolute z-[70] w-full mt-2 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-slide-in-from-top-2">

                                            {/* SEARCH BAR */}
                                            <div className=" bg-white border-b border-slate-100">
                                                <div className="relative group">
                                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        placeholder="Search reviewer name..."
                                                        className="w-full bg-white rounded-lg pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:border-blue-400 transition-all text-slate-600 placeholder:text-slate-400"
                                                        value={reviewer1Search}
                                                        onClick={(e) => e.stopPropagation()} // Keeps dropdown open when clicking input
                                                        onChange={(e) => setReviewer1Search(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* LIST USING YOUR FETCHED CLIENTS */}
                                            <div className="bg-white p-2">
                                                <div className="max-h-48 overflow-y-auto scrollbar-hide space-y-1">
                                                    {filteredReviewer1.length > 0 ? (
                                                        filteredReviewer1.map((c, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // 1. Set the reviewer name to the clicked item
                                                                    setAssignment({ ...assignment, reviewer1: c.name });
                                                                    // 2. Clear the search text
                                                                    setReviewer1Search("");
                                                                    // 3. Close the dropdown
                                                                    setIsReviewer1Open(false);
                                                                }}
                                                                className={`group px-4 py-1.5 text-[12px] font-semibold tracking-wide cursor-pointer transition-all duration-200 flex justify-between items-center rounded-md border
                                ${assignment.reviewer1 === c.name
                                                                        ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                                                                        : 'bg-white border-transparent text-slate-500 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600'}`}
                                                            >
                                                                <div className="flex items-center gap-1">
                                                                    <span>{c.name}</span>
                                                                </div>

                                                                {/* Blue dot indicator */}
                                                                {assignment.reviewer1 === c.name && (
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-8 text-center text-slate-400 text-[10px] font-bold tracking-widest italic">
                                                            No reviewers found
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ========================================= */}
                                {/* 2nd REVIEWER DROPDOWN */}
                                {/* ========================================= */}
                                <div className="relative" ref={reviewer2Ref}>
                                    {/* LABEL */}
                                    <label className="text-[10px] font-black text-gray-700 uppercase mb-2 ml-1 block tracking-[0.2em]">
                                        2nd Reviewer
                                    </label>

                                    {/* TRIGGER / SELECT FIELD */}
                                    <div
                                        onClick={() => setIsReviewer2Open(!isReviewer2Open)}
                                        className={`w-full bg-white/100 border rounded-xl px-4 py-2.5 text-xs font-semibold flex justify-between items-center cursor-pointer transition-all
        ${isReviewer2Open ? 'hover:border-[#c7d4f9] ring-1 ring-blue-400/20 ' : 'border-slate-100 hover:border-[#c7d4f9]'}`}
                                    >
                                        <span className={assignment.reviewer2 ? "text-slate-600 font-semibold" : "text-slate-400 font-medium"}>
                                            {assignment.reviewer2 || "Select 2nd Reviewer..."}
                                        </span>
                                        <ChevronDown size={16} className={`text-blue-600 transition-transform duration-300 ${isReviewer2Open ? 'rotate-180' : ''}`} />
                                    </div>

                                    {/* DROPDOWN MENU */}
                                    {isReviewer2Open && (
                                        <div className="absolute z-[70] w-full mt-2 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-slide-in-from-top-2">

                                            {/* SEARCH BAR */}
                                            <div className=" bg-white border-b border-slate-100">
                                                <div className="relative group">
                                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        placeholder="Search reviewer name..."
                                                        className="w-full bg-white rounded-lg pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:border-blue-400 transition-all text-slate-600 placeholder:text-slate-400"
                                                        value={reviewer2Search}
                                                        onClick={(e) => e.stopPropagation()} // Keeps dropdown open when clicking input
                                                        onChange={(e) => setReviewer2Search(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* LIST USING YOUR FETCHED CLIENTS */}
                                            <div className="bg-white p-2">
                                                <div className="max-h-48 overflow-y-auto scrollbar-hide space-y-1">
                                                    {filteredReviewer2.length > 0 ? (
                                                        filteredReviewer2.map((c, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // 1. Set the reviewer name to the clicked item
                                                                    setAssignment({ ...assignment, reviewer2: c.name });
                                                                    // 2. Clear the search text
                                                                    setReviewer2Search("");
                                                                    // 3. Close the dropdown
                                                                    setIsReviewer2Open(false);
                                                                }}
                                                                className={`group px-4 py-1.5 text-[12px] font-semibold tracking-wide cursor-pointer transition-all duration-200 flex justify-between items-center rounded-md border
                                ${assignment.reviewer2 === c.name
                                                                        ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                                                                        : 'bg-white border-transparent text-slate-500 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600'}`}
                                                            >
                                                                <div className="flex items-center gap-1">
                                                                    <span>{c.name}</span>
                                                                </div>

                                                                {/* Blue dot indicator */}
                                                                {assignment.reviewer2 === c.name && (
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                                                            No reviewers found
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] ml-1 text-gray-700 font-black uppercase mb-2 block tracking-[0.2em]">Description (Optional)</label>
                                <textarea placeholder="Describe scope..." rows={6} className="w-full bg-white/100 border border-slate-100 hover:border-[#c7d4f9] rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-[#c7d4f9] transition-all text-slate-600 placeholder:text-slate-400 placeholder:font-medium resize-none" />
                            </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-0 mt-2 lg:mt-0">
                            <div>
                                <label className="text-[10px] ml-1 font-black text-gray-700 uppercase block tracking-[0.2em]">Set Priority<span className="text-red-400 text-[12px] "> *</span></label>
                                <div className="relative" ref={priorityRef}>
                                    <button onClick={() => setIsPriorityOpen(!isPriorityOpen)} className="w-full mt-2 flex justify-between items-center bg-white/100 border border-slate-100 rounded-xl px-4 py-3 text-xs font-semibold uppercase text-slate-400 hover:border-[#c7d4f9] ">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${assignment.priority === 'High' ? 'bg-red-400' : 'bg-emerald-400'}`} />
                                            {assignment.priority}
                                        </div>
                                        <ChevronDown size={16} className="text-blue-600" />
                                    </button>
                                    {isPriorityOpen && (
                                        <div className="absolute z-[90] w-full bg-white/100 rounded-xl shadow-2xl p-2 mt-1">
                                            {priorityOptions.map(p => (
                                                <div key={p.label} onClick={() => { setAssignment({ ...assignment, priority: p.label }); setIsPriorityOpen(false) }} className={`p-3 text-[10px] font-medium text-slate-700 hover:border-slate-100 uppercase hover:rounded-lg cursor-pointer hover:bg-blue-100 hover:text-blue-600 transition-all ${p.color}`}>{p.label}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>


                            <div className="relative lg:mt-3" ref={finalApproverRef}>
                                {/* LABEL */}
                                <label className="text-[10px] font-black text-gray-700 uppercase mb-2 ml-1 block tracking-[0.2em]">
                                    Final Approver <span className='text-red-400 text-[12px]'>*</span>
                                </label>

                                {/* TRIGGER / SELECT FIELD */}
                                <div
                                    onClick={() => setIsFinalApproverOpen(!isFinalApproverOpen)}
                                    className={`w-full bg-white/100 border rounded-xl px-4 py-2.5 text-xs font-semibold flex justify-between items-center cursor-pointer transition-all
        ${isFinalApproverOpen ? 'border-blue-400 ring-1 ring-blue-400/20' : ' border-slate-100 hover:border-[#c7d4f9]'}`}
                                >

                                    <span className={assignment.finalApprover ? "text-slate-600 font-semibold" : "text-slate-400 font-medium"}>
                                        {assignment.finalApprover || "Select Final Reviewer..."}
                                    </span>
                                    <ChevronDown size={16} className={`text-blue-600 transition-transform duration-300 ${isFinalApproverOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {/* DROPDOWN MENU */}
                                {isFinalApproverOpen && (
                                    <div className="absolute z-[70] w-full mt-2 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-slide-in-from-top-2">

                                        {/* SEARCH BAR */}
                                        <div className=" bg-white border-b border-slate-100">
                                            <div className="relative group">
                                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Search reviewer name..."
                                                    className="w-full bg-white rounded-lg pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:border-blue-400 transition-all text-slate-600 placeholder:text-slate-400"
                                                    value={finalApproverSearch}
                                                    onClick={(e) => e.stopPropagation()} // Keeps dropdown open when clicking input
                                                    onChange={(e) => setFinalApproverSearch(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* LIST */}
                                        <div className="bg-white p-2">
                                            <div className="max-h-48 overflow-y-auto scrollbar-hide space-y-1">
                                                {filteredFinalApprover.length > 0 ? (
                                                    filteredFinalApprover.map((c, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setAssignment({ ...assignment, finalApprover: c.name });
                                                                setFinalApproverSearch("");
                                                                setIsFinalApproverOpen(false);
                                                            }}
                                                            className={`group px-4 py-1.5 text-[12px] font-semibold tracking-wide cursor-pointer transition-all duration-200 flex justify-between items-center rounded-md border
                                    ${assignment.finalApprover === c.name
                                                                    ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                                                                    : 'bg-white border-transparent text-slate-500 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600'}`}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <span>{c.name}</span>
                                                            </div>

                                                            {/* Blue dot indicator */}
                                                            {assignment.finalApprover === c.name && (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                                                        No reviewers found
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="relative lg:mt-3">
                                {/* LABEL */}
                                <label className="text-[10px] font-black text-gray-700 uppercase mb-2 ml-1 block tracking-[0.2em]">
                                    Select Due Date <span className='text-red-400 text-[12px]'>*</span>
                                </label>

                                {/* INPUT CONTAINER */}
                                <div className="relative group">
                                    <input
                                        type="date"
                                        className="w-full bg-white/100 border border-slate-100 rounded-xl px-4 py-1 h-[40px] text-xs font-semibold text-blue-600 outline-none transition-all 
            hover:border-[#c7d4f9] focus:border- focus:ring-1 
            [color-scheme:light] cursor-pointer "
                                        onChange={(e) => setAssignment({ ...assignment, date: e.target.value })}
                                        // To ensure the placeholder text logic works if needed
                                        style={{
                                            color: assignment.date ? '#475569' : '#94A3B8',
                                            fontWeight: assignment.date ? '600' : '500'
                                        }}
                                    />

                                    {/* We use a custom icon overlay or style the native one */}
                                    {/* Note: [color-scheme:dark] handles the native icon color automatically */}
                                </div>
                            </div>

                            <div className="mt-4 lg:mt-2 mb-0 lg:-mb-10 w-full">
                                <label className="text-[10px] ml-1 font-black text-gray-700 uppercase block tracking-[0.2em]">
                                    Select Checklist
                                </label>
                                <button
                                    onClick={() => setIsCopyPopupOpen(true)}
                                    className="mt-2 w-full h-[40px] bg-[#011e5c] text-white rounded-xl font-black text-[11px] uppercase flex items-center justify-center gap-3 shadow-lg transition-all hover:bg-[#022a7a]"
                                >
                                    <Copy size={18} /> Copy From Master Checklist
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- SORTABLE BUILDER SECTIONS --- */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
                    <SortableContext items={assignment.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-6 sm:space-y-10">
                            {assignment.sections.map((section, sIdx) => (
                                <SortableSection
                                    key={section.id}
                                    section={section}
                                    sIdx={sIdx}
                                    assignment={assignment}
                                    setAssignment={setAssignment}
                                    updateQuestion={updateQuestion}
                                    deleteQuestion={deleteQuestion}
                                    addQuestion={addQuestion}
                                    answerOptions={answerOptions}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <button onClick={addManualSection} className="w-full py-6 sm:py-8 border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-xl bg-white hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-3 group mt-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-all"><FileText size={20} /></div>
                    <span className="text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-blue-600">Add Section Block</span>
                </button>
            </main>

            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 mb-6 sm:mb-20">
                <div className="bg-[#0f172a] rounded-2xl p-5 sm:p-8 text-white shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0 border border-slate-700/50">
                    <div className="flex items-center gap-4 pl-0 sm:pl-4">
                        <div className="w-10 h-8 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700"><div className="w-6 h-1 bg-blue-500 rounded-full"></div></div>
                        <div><h4 className="text-xs font-black uppercase tracking-widest">Builder Stats</h4><p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Real-time update</p></div>
                    </div>
                    <div className="flex gap-8 sm:gap-12 pr-0 sm:pr-8">
                        <div className="text-center"><p className="text-xl sm:text-2xl font-black text-blue-400 leading-none">{assignment.sections.length}</p><p className="text-[9px] font-black text-slate-500 uppercase mt-1">Sections</p></div>
                        <div className="text-center"><p className="text-xl sm:text-2xl font-black text-blue-400 leading-none">{assignment.sections.reduce((acc, s) => acc + s.questions.length, 0)}</p><p className="text-[9px] font-black text-slate-500 uppercase mt-1">Questions</p></div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-6 sm:mt-12 mb-20">
                <div className="bg-white rounded-2xl p-4 sm:p-3 text-black flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 border border-[#c7d4f9]">
                    <div className="flex items-center gap-4 pl-0 sm:pl-4 w-full sm:w-auto justify-center sm:justify-start">
                        <div className="text-center sm:text-left"><h4 className="text-xs text-blue-700 font-semibold uppercase tracking-widest">Update Data </h4><p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Live Update</p></div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pr-0 sm:pr-4 w-full sm:w-auto">
                        <button onClick={saveAssignment} className="w-full sm:w-auto justify-center bg-blue-100 text-blue-600 border border-blue-300 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-blue-100 flex items-center gap-2">
                            <Save size={14} /> {isEditMode ? 'Save & Draft' : 'Save & Draft'}
                        </button>
                        <button onClick={saveAssignment} className="w-full sm:w-auto justify-center bg-blue-600 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700">
                            <Save size={14} /> {isEditMode ? 'Update Assignment' : 'Send Assignment'}
                        </button>
                    </div>
                </div>
            </div>

            <MasterChecklistPopup isOpen={isCopyPopupOpen} onClose={() => setIsCopyPopupOpen(false)} onCopyData={handleImportMasterData} />
        </div>
    );
};

export default AssignmentBuilder;