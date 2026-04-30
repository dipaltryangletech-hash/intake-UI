import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle2, Circle, Paperclip,
  Trash2, Plus, Calendar, AlertCircle,
  ChevronRight, Save, Send, XCircle, X, Download, Check, MessageSquare,
  SquarePen
} from 'lucide-react';

const ClientAssignmentFill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({}); // Track validation errors

  // State for Clarification Chat
  const [reviewState, setReviewState] = useState({});
  const [chats, setChats] = useState({});
  const [tempMsg, setTempMsg] = useState("");
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);

  // --- PROGRESS CALCULATION ---
  const calculateProgress = () => {
    if (!assignment) return 0;
    const allQuestions = assignment.sections.flatMap(s => s.questions);
    const total = allQuestions.length;
    if (total === 0) return 0;

    let answered = 0;
    allQuestions.forEach(q => {
      // 1. Files
      if (q.allowUpload && files[q.id]?.length > 0) {
        answered++;
        return;
      }

      const val = answers[q.id];
      if (val === undefined || val === null) return;

      // 2. Tables
      if (q.answerType === 'TABLE') {
        // Table is "answered" if at least one row has at least one value
        const hasData = val.some(row => Object.values(row).some(v => v !== "" && v !== undefined));
        if (hasData) answered++;
      }
      // 3. Multi-Select / Checkbox
      else if (Array.isArray(val)) {
        if (val.length > 0) answered++;
      }
      // 4. Standard Inputs
      else {
        if (String(val).trim() !== "" && val !== 'NA') answered++;
      }
    });

    return Math.round((answered / total) * 100);
  };

  const progressPercent = calculateProgress();

  const finalSubmitRef = useRef(null);
  // Refs for scrolling
  const sectionRefs = useRef([]);

  // Load Data
  useEffect(() => {
    const allAssignments = JSON.parse(localStorage.getItem('all_assignments')) || [];
    const found = allAssignments.find(a => a.id === id || a.id === `#${id}`);
    if (found) {
      setAssignment(found);
      const initialAnswers = {};
      found.sections.forEach(sec => {
        sec.questions.forEach(q => {
          if (q.answerType === 'TABLE') initialAnswers[q.id] = [{}];
          else if (q.answerType === 'CHECKBOX') initialAnswers[q.id] = [];
          else initialAnswers[q.id] = "";
        });
      });
      setAnswers(initialAnswers);
    }
  }, [id]);

  // Logic: Intersection Observer for Scroll Highlighting
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
  //for final submit button
  const scrollToFinal = () => {
    finalSubmitRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Logic: Validation
  const validateAndFormat = (type, value) => {
    const upperType = type?.toUpperCase();
    switch (upperType) {
      case 'PHONE':
        // Only numbers and + symbol
        return value.replace(/[^0-9+]/g, '');
      case 'TEXT':
        // Only characters and spaces
        return value.replace(/[^a-zA-Z\s]/g, '');
      case 'NUMBER':
        // Allow digits + %, ., $, ₹
        return value.replace(/[^0-9%.$₹]/g, '');
      case 'CURRENCY':
        // Only numbers and one decimal point
        return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      default:
        return value;
    }
  };


  const validateField = (q, value) => {
    if (value === 'NA') {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr[q.id];
        return newErr;
      });
      return;
    }

    // existing validation
    if (!value || value === "") {
      setErrors(prev => ({ ...prev, [q.id]: "This field is required" }));
    } else {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr[q.id];
        return newErr;
      });
    }
  };
  // Logic: Update Answer
  const updateAnswer = (question, value) => {
    validateField(question, value);
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  // Logic: Table Handling
  const addTableRow = (qId) => {
    setAnswers(prev => ({ ...prev, [qId]: [...prev[qId], {}] }));
  };

  const updateTableRow = (qId, rowIndex, col, value) => {
    // 1. Sanitization (Check kijiye ki ye function character block toh nahi kar raha)
    const sanitizedValue = validateAndFormat(col.type, value);

    // 2. State Update (Functional update use karein taaki hamesha fresh data mile)
    setAnswers(prev => {
      // Agar pehle se data nahi hai, toh empty array lein
      const currentTableData = prev[qId] ? [...prev[qId]] : [{}];

      // Row ki copy banayein aur value update karein
      const updatedRow = { ...currentTableData[rowIndex], [col.name]: sanitizedValue };

      // Array mein updated row wapas daalein
      const newTable = [...currentTableData];
      newTable[rowIndex] = updatedRow;

      return { ...prev, [qId]: newTable };
    });

    // 3. Email Validation Logic (Ye bilkul sahi hai)
    if (col.type === 'EMAIL') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.(com|in)$/;
      const isValid = emailRegex.test(sanitizedValue);
      setErrors(prev => ({
        ...prev,
        [`${qId}-${rowIndex}-${col.name}`]: sanitizedValue && !isValid ? "Must contain @ and end with .com or .in" : ""
      }));
    }
  };

  // Logic: File Upload
  const handleFileUpload = (qId, e) => {
    const uploadedFiles = Array.from(e.target.files).map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + " MB"
    }));
    setFiles(prev => ({ ...prev, [qId]: [...(prev[qId] || []), ...uploadedFiles] }));
  };

  const removeFile = (qId, fileId) => {
    setFiles(prev => ({ ...prev, [qId]: prev[qId].filter(f => f.id !== fileId) }));
  };

  if (!assignment) return <div className="p-20 text-center">Loading Assignment...</div>;



  // Function to reset all data
  const handleDiscard = () => {
    const confirmDiscard = window.confirm("Are you sure you want to discard all changes? This will clear all your answers.");

    if (confirmDiscard) {
      setAnswers({});
      toast.info("All changes have been cleared.");

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Function to save and submit
  const handleSubmit = () => {
    // 1. Basic validation check (optional)
    if (Object.keys(answers).length === 0) {
      toast.error("Please fill in some details before submitting.");
      return;
    }

    // 2. Prepare the payload
    const submissionPayload = {
      assignmentId: assignment.id,
      clientName: "Siddhi Khatri", // You can get this from your auth state
      submittedAt: new Date().toLocaleString(),
      answers: answers, // This contains all your text, radio, and TABLE data
      files: files,     // Any uploaded file metadata
      status: 'PENDING' // Initial status for Admin
    };

    try {
      // 3. Save to localStorage
      localStorage.setItem(`submission_${assignment.id}`, JSON.stringify(submissionPayload));

      toast.success("Assignment submitted for review!", {
        position: "top-right",
        autoClose: 3000
      });

      // 4. Optional: Redirect to a 'Thank You' or 'Dashboard' page
      navigate("/assignments");
    } catch (error) {
      toast.error("Failed to save submission locally.");
    }
  };


  const updateStatus = (qId, status) => {
    setReviewState(prev => ({ ...prev, [qId]: status }));
  };



  const deleteMessageAndReset = (qId) => {
    // 1. Reset the Review Status (Approved/Rejected/Clarify) to null
    setReviewStatuses(prev => {
      const newStatuses = { ...prev };
      delete newStatuses[qId]; // Removes the status for this specific question
      return newStatuses;
    });

    // 2. Clear the feedback message for this question (if you have a separate state)
    setResponses(prev => ({
      ...prev,
      [`${qId}_message`]: "" // Clears the clarification text
    }));

    // 3. Update LocalStorage so the change is saved
    const allAssignments = JSON.parse(localStorage.getItem('all_assignments')) || [];
    const index = allAssignments.findIndex(asg => asg.id.replace('#', '') === id);
    if (index !== -1) {
      // Remove status from storage
      if (allAssignments[index].reviewStatuses) {
        delete allAssignments[index].reviewStatuses[qId];
      }
      localStorage.setItem('all_assignments', JSON.stringify(allAssignments));
    }

    toast.info("Status reset successfully");
  };


  const handleCancelClarification = (qId) => {
    // Clear the typing text for this question
    setTempMsg(prev => ({ ...prev, [qId]: "" }));
    // Revert status to show the "Need Clarification?" button again
    setReviewState(prev => {
      const newState = { ...prev };
      delete newState[qId];
      return newState;
    });
  };

  const handleSendClarification = (qId) => {
    const text = tempMsg[qId];
    if (!text?.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: text,
      sender: 'Admin',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => ({
      ...prev,
      [qId]: [...(prev[qId] || []), newMessage]
    }));

    // Clear input after sending
    setTempMsg(prev => ({ ...prev, [qId]: "" }));
  };


  const handleEditMessage = (qId, msg) => {
    setTempMsg(prev => ({ ...prev, [qId]: msg.text }));
    setEditingMsgId(msg.id);
    // Remove the message from the list temporarily while editing
    setChats(prev => ({
      ...prev,
      [qId]: prev[qId].filter(m => m.id !== msg.id)
    }));
  };




  return (
    <div className="min-h-screen bg-[#F1F5F9] font-poppins pb-20">
      {/* TOP HEADER */}
      <div className="sticky top-11 z-50 w-full mx-auto bg-white border-2 border-b border-t border-slate-200 px-6 py-2 flex justify-between items-end shadow-sm">
        <div className="">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
            {assignment.client} <ChevronRight size={10} /> {assignment.created}
          </p>
          <h1 className="text-lg font-black text-slate-800">{assignment.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion</p>
            <div className="w-48 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <button className="bg-blue-50 text-blue-700 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all">Review PDF</button>
        </div>
      </div>

      <main className="max-w-[1800px] mx-auto grid grid-cols-10 gap-6 p-6">

        {/* LEFT SIDEBAR */}
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
              <button onClick={scrollToFinal} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all">
                Submit Assignment
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="col-span-7 space-y-12">
          {/* DYNAMIC SECTIONS - ALL VISIBLE */}
          {assignment.sections.map((section, sIdx) => (
            <div
              key={section.id}
              ref={el => sectionRefs.current[sIdx] = el}
              className="space-y-4 scroll-mt-28"
            >
              <div className="bg-blue-50/50 border-l-4 border-blue-600 px-4 py-2">
                <h2 className="text-[11px] font-black uppercase text-blue-800 tracking-widest">Section {sIdx + 1}: {section.name}</h2>
              </div>

              {section.questions.map((q, qIdx) => (
                <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-slate-700">{qIdx + 1}. {q.title} {q.isMandatory && <span className="text-red-500">*</span>}</h3>
                      <div className="flex items-center gap-3">
                        {/* SAMPLE FILE DOWNLOAD BUTTON */}
                        {q.attachedFileName && (
                          <button
                            onClick={() => {
                              // Logic: Trigger automatic download
                              const link = document.createElement('a');
                              // Point this to your actual file storage location
                              link.href = `/path-to-your-files/${q.attachedFileName}`;
                              link.download = q.attachedFileName;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-100 px-3 py-1.5 rounded-lg transition-all group shadow-sm"
                            title={`Download ${q.attachedFileName}`}
                          >
                            <Download size={14} className="text-blue-500 group-hover:text-white transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              Sample File
                            </span>
                          </button>
                        )}


                      </div>
                    </div>

                    {q.guidance && (
                      <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-lg flex gap-3">
                        <AlertCircle size={16} className="text-amber-500 shrink-0" />
                        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">{q.guidance}</p>
                      </div>
                    )}

                    <div className="pt-1">
                      {/* INPUT RENDERER WITH VALIDATION */}

                      {/* YES / NO */}
                      {q.answerType === 'YES_NO' && (
                        <div className="flex gap-8">
                          {['Yes', 'No', 'NA#'].map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                              <input
                                type="radio"
                                name={q.id}
                                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                                onChange={() => updateAnswer(q, opt)}
                                checked={answers[q.id] === opt}
                              />
                              <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600">
                                {opt}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* SHORT TEXT */}
                      {q.answerType === 'SHORT_TEXT' && (
                        <div>
                          <input
                            type="text"
                            placeholder={`Enter ${q.title}...`}
                            className={`w-full bg-slate-50 border ${errors[q.id]
                              ? 'border-red-400 ring-2 ring-red-50'
                              : 'border-slate-200'
                              } rounded-lg px-4 py-2.5 text-xs font-semibold focus:bg-white focus:border-blue-500 outline-none transition-all`}
                            value={answers[q.id] || ""}
                            onChange={(e) => updateAnswer(q, e.target.value)}
                            onBlur={(e) => validateField(q, e.target.value)}
                          />
                          {errors[q.id] && (
                            <p className="text-[10px] text-red-500 mt-1 font-bold animate-in fade-in slide-in-from-top-1">
                              {errors[q.id]}
                            </p>
                          )}
                        </div>
                      )}

                      {/* LONG TEXT */}
                      {q.answerType === 'LONG_TEXT' && (
                        <textarea
                          rows={4}
                          placeholder="Enter detailed response..."
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium focus:border-blue-500 outline-none transition-all resize-none shadow-sm"
                          value={answers[q.id] || ""}
                          onChange={(e) => updateAnswer(q, e.target.value)}
                          onBlur={(e) => validateField(q, e.target.value)}
                        />
                      )}

                      {(q.answerType === 'DATE' || q.title.toLowerCase().includes('date')) && (
                        <div className="relative max-w-sm">
                          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="date"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm font-bold text-slate-600 focus:bg-white outline-none"
                            value={answers[q.id] || ""}
                            onChange={(e) => updateAnswer(q, e.target.value)}
                          />
                        </div>
                      )}

                      {q.answerType === 'TABLE' && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                              <tr>
                                <th className="px-4 py-3 border-r border-slate-200 w-10">#</th>
                                {q.tableColumns?.map(col => (
                                  <th key={col.id} className="px-4 py-3 border-r border-slate-200">
                                    <div className="flex flex-col">
                                      {col.name}
                                      <span className="text-[8px] opacity-60 font-medium">({col.type})</span>
                                    </div>
                                  </th>
                                ))}
                                <th className="px-4 py-3 w-10">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(answers[q.id] || [{}]).map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-4 py-3 text-[11px] font-bold text-slate-400 bg-slate-50/30 text-center border-r border-slate-200">{rIdx + 1}</td>
                                  {q.tableColumns?.map(col => {
                                    const errorKey = `${q.id}-${rIdx}-${col.name}`;
                                    return (
                                      <td key={col.id} className="px-2 py-2 border-r border-slate-200 relative">
                                        <input
                                          // Use 'date' type only if config says DATE
                                          type={col.type === 'DATE' ? 'date' : 'text'}
                                          className={`w-full bg-transparent p-2 text-xs font-medium outline-none placeholder:text-slate-300 ${errors[errorKey] ? 'text-red-500' : 'text-slate-700'
                                            }`}
                                          placeholder={col.type === 'DATE' ? '' : `Enter ${col.name}...`}
                                          value={row[col.name] || ""}
                                          onChange={(e) => updateTableRow(q.id, rIdx, col, e.target.value)}
                                        />
                                        {/* Small error tooltip for Email validation */}
                                        {errors[errorKey] && (
                                          <div className="absolute bottom-0 left-2 text-[7px] text-red-500 font-bold bg-white px-1">
                                            {errors[errorKey]}
                                          </div>
                                        )}
                                      </td>
                                    );
                                  })}
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => {
                                        const t = [...answers[q.id]];
                                        t.splice(rIdx, 1);
                                        setAnswers(prev => ({ ...prev, [q.id]: t }));
                                      }}
                                      className="text-red-300 hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <button
                            onClick={() => addTableRow(q.id)}
                            className="w-full p-3 bg-white hover:bg-slate-50 text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border-t border-slate-200"
                          >
                            <Plus size={14} /> Add New Row
                          </button>
                        </div>
                      )}

                      {(q.answerType === 'MULTIPLE_CHOICE' || q.answerType === 'CHECKBOX') && (
                        <div className="space-y-3">
                          {(q.options || []).map(opt => (
                            <label key={opt.id} className="flex items-center gap-4 p-2 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-all">
                              <input
                                type="checkbox"
                                className="w-3.5 h-3.5 rounded-md border-slate-300 text-blue-600"
                                onChange={(e) => {
                                  const current = answers[q.id] || [];
                                  if (e.target.checked) updateAnswer(q, [...current, opt.text]);
                                  else updateAnswer(q, current.filter(i => i !== opt.text));
                                }}
                              />
                              <span className="text-xs font-bold text-slate-600">{opt.text}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* file Upload Documents */}
                      {q.allowUpload && (
                        <div className="mt-6 space-y-4">
                          <label className="flex flex-col items-center justify-center w-full h-12 border-2 border-dashed border-slate-200 hover:border-blue-600 rounded-2xl bg-slate-50 hover:bg-white cursor-pointer group transition-all">
                            <div className="items-center justify-center pt-5 pb-6">
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-600 flex items-center gap-2">
                                <Paperclip size={16} className="text-slate-400 group-hover:text-blue-600" />
                                Upload Documentation
                              </p>
                            </div>
                            <input type="file" className="hidden" multiple onChange={(e) => handleFileUpload(q.id, e)} />
                          </label>
                          <div className="space-y-2">
                            {(files[q.id] || []).map(file => (
                              <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3">
                                  <FileText size={16} className="text-blue-500" />
                                  <span className="text-[11px] font-bold text-slate-700">{file.name} ({file.size})</span>
                                </div>
                                <button onClick={() => removeFile(q.id, file.id)} className="text-red-500"><Trash2 size={16} /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CLARIFICATION SECTION */}
                    <div className="mt-4 pt-4 border-t border-slate-50">
                      {/* 1. BUTTON MODE: Shows "Need Clarification?" */}
                      {reviewState[q.id] !== 'CLARIFY' && (
                        <button
                          onClick={() => updateStatus(q.id, 'CLARIFY')}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <MessageSquare size={14} /> Need Help?
                        </button>
                      )}

                      {/* 2. CHAT & INPUT MODE */}
                      {reviewState[q.id] === 'CLARIFY' && (
                        <div className="bg-orange-50/40 rounded-2xl border border-orange-100 p-4 space-y-4 animate-in fade-in zoom-in-95">

                          {/* Sent Messages List */}
                          <div className="space-y-3">
                            {(chats[q.id] || []).map((msg) => (
                              <div key={msg.id} className="flex items-start gap-3 group">
                                <div className="w-7 h-7 rounded-full bg-white border border-orange-200 text-orange-600 flex items-center justify-center text-[9px] font-black shadow-sm">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${q.id.color}`}>{q.id.initials}</div>

                                </div>
                                <div className="flex-1 bg-white border border-orange-100 rounded-2xl p-3 shadow-sm relative">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-slate-800">Admin</span>
                                    <div className="flex items-center gap-1">
                                      {/* EDIT BUTTON (SquarePen) */}
                                      <button
                                        onClick={() => handleEditMessage(q.id, msg)}
                                        className="p-1 text-blue-600"
                                      >
                                        <SquarePen size={12} />
                                      </button>
                                      {/* DELETE BUTTON (Trash) - Closes box and shows "Need Help" */}
                                      <button
                                        onClick={() => deleteMessageAndReset(q.id, msg.id)}
                                        className="p-1 text-red-500 "
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{msg.text}</p>
                                  <span className="text-[8px] font-medium text-slate-300 block mt-1">{msg.time}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Input Area: Shows if typing new message OR editing */}
                          {(!chats[q.id] || chats[q.id].length === 0 || editingMsgId) && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center px-1">
                                <span className="text-[9px] font-black text-orange-700 uppercase tracking-widest">
                                  {editingMsgId ? "Editing Message" : "Instructions"}
                                </span>
                                {/* CLOSE CROSS ICON: Reverts everything to "Need Help?" */}
                                <button
                                  onClick={() => handleCancelClarification(q.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              <div className="relative">
                                <textarea
                                  value={tempMsg[q.id] || ""}
                                  onChange={(e) => setTempMsg(prev => ({ ...prev, [q.id]: e.target.value }))}
                                  placeholder="Type your clarification request..."
                                  className="w-full bg-white border border-orange-200 rounded-xl p-3 pr-12 text-xs font-medium outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all resize-none min-h-[80px]"
                                />
                                {/* SEND ICON */}
                                <button
                                  onClick={() => {
                                    handleSendClarification(q.id);
                                    setEditingMsgId(null);
                                  }}
                                  disabled={!tempMsg[q.id]?.trim()}
                                  className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all ${tempMsg[q.id]?.trim()
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                    }`}
                                >
                                  {editingMsgId ? <Check size={16} /> : <Send size={16} />}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* FINAL SUBMIT CARD */}
          <div ref={finalSubmitRef} className="bg-[#0f172a] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden mt-20">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-[0.2em]">Final Review & Sign-off</h3>
            </div>
            <div className="p-4 space-y-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Declaration Statement</h4>
                <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
                  "I hereby declare that the information provided in this assignment is true and accurate to the best of my knowledge. I understand that any false statements may lead to the rejection of the compliance status and potential legal repercussions under the regulatory framework established by Sapphire Logic and its partners."
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Digital Signature</label>
                  <input type="text" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-2 py-3 text-sm text-white outline-none placeholder:text-slate-600" placeholder="e.g.Jane M.Cooper" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Date of Signature</label>
                  <input type="text" className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-2 py-3 text-sm text-white outline-none placeholder:text-slate-600" placeholder='DD/MM/YYYY' value={new Date().toLocaleDateString()} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-[12px] text-slate-400">
                <input type="checkbox" className="w-4 h-4 accent-blue-600" />
                I agree to the terms of the digital submission and authorize Global Logistic Corp to review all the submitted documentation for compliance purposes.
              </label>
              <div className="flex justify-end items-center space-x-4 pt-2">
                <div className="flex items-center gap-4">
                  {/* Discard Changes Button */}
                  <button
                    onClick={handleDiscard}
                    className="px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 hover:text-red-500  transition-all border border-transparent hover:border-red-300"
                  >
                    discard Changes
                  </button>

                  {/* Sign & Submit Button */}
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] bg-[#2563eb] text-white hover:bg-blue-600 transition-all  shadow-blue-100 active:scale-95"
                  >
                    Sign & Submit Assignment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientAssignmentFill;