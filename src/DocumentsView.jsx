import React from 'react';
import { X, Check, Image, FileText, RotateCcw, Send, Trash2, FolderPlus, RefreshCcw, FileX, Layers, CheckCircle, ChevronRight, ChevronDown } from 'lucide-react';

const DocumentsView = ({
  docTab,
  setDocTab,
  activeDocs,
  depositoryDocs,
  displayDocs,
  filteredDisplayDocs,
  selectedDocIds,
  setSelectedDocIds,
  setSelectedDoc,
  setIsRequestModalOpen,
  handleDocAction,
  handleDeleteDoc,
  setDocSidebarOpen,
  fileInputRef,
  setActiveRequestId,
  setMessages
}) => {
  const [selectedYear, setSelectedYear] = React.useState('All');
  const [selectedMonth, setSelectedMonth] = React.useState('All');
  const [expandedAsgs, setExpandedAsgs] = React.useState({}); // { asgName: boolean }
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const toggleAsg = (asgName) => {
    setExpandedAsgs(prev => ({ ...prev, [asgName]: !prev[asgName] }));
  };

  const allAssignments = React.useMemo(() => {
    return JSON.parse(localStorage.getItem('all_assignments')) || [];
  }, []);

  const assignmentFiles = React.useMemo(() => {
    // Collect files from all assignment submissions
    const files = [];

    // Add Demo Assignment
    const demoDate = new Date("2026-05-08");
    files.push({
      id: 'demo-1',
      name: 'Payslip_2026-03 (2).pdf',
      fileName: 'Payslip_2026-03 (2).pdf',
      size: '0.00 MB',
      fileSize: '0.00 MB',
      type: 'application/pdf',
      assignmentId: 'demo-asg-1',
      assignmentName: 'Business Documents',
      clientName: 'JOHN SMITH',
      timestamp: '08/05/2026',
      fullTimestamp: '08/05/2026',
      dateObj: demoDate,
      docStatus: 'approved'
    });

    allAssignments.forEach(asg => {
      const submission = JSON.parse(localStorage.getItem(`submission_${asg.id}`));
      if (submission && submission.files) {
        Object.entries(submission.files).forEach(([qId, qFiles]) => {
          qFiles.forEach(f => {
            // Robust date parsing
            let timestamp = submission.submittedAt;
            let dateObj = new Date(timestamp);
            if (isNaN(dateObj.getTime())) {
              // Try removing ' at ' if present
              dateObj = new Date(timestamp.replace(' at ', ' '));
            }

            files.push({
              ...f,
              assignmentId: asg.id,
              assignmentName: asg.name,
              clientName: asg.client,
              timestamp: timestamp,
              dateObj: dateObj,
              fullTimestamp: timestamp,
              fileSize: f.size,
              fileName: f.name,
              docStatus: 'approved'
            });
          });
        });
      }
    });
    return files;
  }, [allAssignments]);

  const years = React.useMemo(() => {
    const uniqueYears = new Set();
    assignmentFiles.forEach(f => {
      if (f.dateObj && !isNaN(f.dateObj.getTime())) {
        uniqueYears.add(f.dateObj.getFullYear().toString());
      }
    });
    // Add some default years for display if none exist
    if (uniqueYears.size === 0) {
      uniqueYears.add("2026");
      uniqueYears.add("2025");
      uniqueYears.add("2024");
    }
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [assignmentFiles]);

  const filteredAssignmentFiles = React.useMemo(() => {
    return assignmentFiles.filter(f => {
      if (isNaN(f.dateObj.getTime())) return false;
      const yearMatches = selectedYear === 'All' || f.dateObj.getFullYear().toString() === selectedYear;
      const monthMatches = selectedMonth === 'All' || f.dateObj.toLocaleString('default', { month: 'short' }) === selectedMonth;
      return yearMatches && monthMatches;
    });
  }, [assignmentFiles, selectedYear, selectedMonth]);

  const groupedByClient = React.useMemo(() => {
    const groups = {};
    filteredAssignmentFiles.forEach(f => {
      if (!groups[f.clientName]) groups[f.clientName] = {};
      if (!groups[f.clientName][f.assignmentName]) groups[f.clientName][f.assignmentName] = [];
      groups[f.clientName][f.assignmentName].push(f);
    });
    return groups;
  }, [filteredAssignmentFiles]);
  return (
    <div className="w-full bg-slate-50 flex flex-col animate-fadeIn flex-1">
      {/* Tabs Header */}
      <div className="shrink-0 bg-white px-6 pt-2 border-b border-slate-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-end border-b border-transparent">
            <button
              onClick={() => setDocTab('documents')}
              className={`py-3 px-3 font-semibold text-sm transition-colors relative ${docTab === 'documents' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Documents ({activeDocs.length})
              {docTab === 'documents' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
            </button>
            <button
              onClick={() => setDocTab('depository')}
              className={`py-3 px-3 font-semibold text-sm transition-colors relative ${docTab === 'depository' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Documents Depository ({depositoryDocs.length})
              {docTab === 'depository' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
            </button>
            <button
              onClick={() => setDocTab('assignmentDepository')}
              className={`py-3 px-3 font-semibold text-sm transition-colors relative ${docTab === 'assignmentDepository' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Assignment Depository ({assignmentFiles.length})
              {docTab === 'assignmentDepository' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
            </button>
          </div>

          {/* REQUEST BUTTON */}
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="mb-2 flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium"
          >
            Request Document
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative scrollbar-hide">
        <div className="max-w-6xl mx-auto space-y-4">
          {docTab === 'assignmentDepository' ? (
            <div className="space-y-4 p-1">
              {/* Filters Container */}
              <div className=" max-w-[1450px] mx-auto space-y-3">
                {/* SELECT YEAR ROW */}
                <div className=" -mt-4 flex items-center gap-8">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] w-28 shrink-0">
                    Select Year
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedYear('All')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-300 ${selectedYear === 'All'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                      All
                    </button>
                    {years.map(y => (
                      <button
                        key={y}
                        onClick={() => setSelectedYear(y)}
                        className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-300 ${selectedYear === y
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100 w-full" />

                {/* SELECT MONTH ROW */}
                <div className="flex items-center gap-8">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] w-28 shrink-0">
                    Select Month
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedMonth('All')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${selectedMonth === 'All'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                      All
                    </button>
                    {months.map(m => (
                      <button
                        key={m}
                        onClick={() => setSelectedMonth(m)}
                        className={`px-2 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${selectedMonth === m
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grouped Content */}
              {Object.keys(groupedByClient).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(groupedByClient).map(([client, assignments]) => {
                    return (
                      <div key={client} className="space-y-4">
                        {/* <div className="flex items-center gap-4">
                          <div className="w-7 h-7 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-100">
                            {client.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Client</span>
                            <span className="text-sm font-semibold text-slate-800">{client}</span>
                          </div>
                          <div className="h-px bg-gradient-to-r from-slate-200 to-transparent flex-1" />
                        </div> */}

                        {Object.entries(assignments).map(([asgName, files]) => {

                          const isExpanded = expandedAsgs[asgName];
                          return (

                            <div key={asgName} className="space-y-4">
                              {/* Modern Assignment Header (Collapsible) */}
                              <div
                                onClick={() => toggleAsg(asgName)}
                                className="flex flex-col gap-1 px-2 cursor-pointer bg-blue-50  border border-blue-100 p-2 rounded-xl transition-all group"
                              >
                                <div className="flex items-center justify-between gap-2 w-full">
                                  <div className="flex items-center gap-2">
                                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                      <ChevronDown size={18} className="text-slate-600" />
                                    </div>
                                    <h3 className="text-[13px] font-semibold text-slate-800 tracking-tight transition-colors">
                                      {asgName}
                                    </h3>
                                    <ChevronRight size={10} className="text-slate-500" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                      {files[0]?.timestamp?.split(',')[0] || "06 MAY 2026"}
                                    </span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{client}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-md border border-blue-100 shadow-sm">
                                      {files.length} {files.length === 1 ? 'Document' : 'Documents'}
                                    </span>
                                  </div>
                                </div>

                              </div>

                              {/* Document Rows (Visible only if expanded) */}
                              {isExpanded && (
                                <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                  {files.map(doc => (
                                    <div
                                      key={doc.id}
                                      onClick={() => setSelectedDoc(doc)}
                                      className="group flex flex-col sm:flex-row items-center justify-between border border-slate-100 rounded-xl p-2 bg-white shadow-sm  transition-all duration-300 gap-4 w-full cursor-pointer relative overflow-hidden"
                                    >

                                      <div className="flex items-center gap-4 flex-1 overflow-hidden w-full">
                                        <div className="p-1 bg-blue-50 text-blue-600 rounded-md shrink-0  transition-colors duration-300 shadow-sm">
                                          {doc.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                                            <Image size={16} />
                                          ) : (
                                            <FileText size={16} />
                                          )}
                                        </div>
                                        <div className="flex flex-col-3 overflow-hidden gap-3">
                                          <h4 className="text-[12px] font-medium truncate text-slate-800 group-hover:text-blue-700 transition-colors" title={doc.fileName}>
                                            {doc.fileName}
                                          </h4>
                                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                                            {doc.fileSize}
                                          </span>
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {doc.fullTimestamp?.split(',')[0]}
                                          </span>

                                        </div>
                                      </div>

                                      {/* No Action Buttons or Icons here, as requested */}

                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-32 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                    <FileX size={40} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No Records Found</h3>
                  <p className="text-slate-400 text-sm mt-2 max-w-xs text-center">There are no assignment documents archived for <span className="text-blue-600 font-bold">{selectedMonth} {selectedYear}</span>.</p>
                  <button
                    onClick={() => { setSelectedMonth('All'); setSelectedYear('All'); }}
                    className="mt-8 px-6 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          ) : filteredDisplayDocs.length === 0 ? (
            <p className="text-base text-slate-400 text-center mt-20">No documents in this view.</p>
          ) : (
            <>
              {docTab === 'documents' && (
                <div className="flex items-center  justify-between bg-slate-100 rounded-xl p-2 mb-4 border border-slate-200 shadow-sm">
                  <div
                    className="flex items-center gap-3 cursor-pointer group/selectall"
                    onClick={() => {
                      if (selectedDocIds.length === filteredDisplayDocs.length) setSelectedDocIds([]);
                      else setSelectedDocIds(filteredDisplayDocs.map(d => d.id));
                    }}
                  >
                    <button className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedDocIds.length === filteredDisplayDocs.length && filteredDisplayDocs.length > 0 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-transparent group-hover/selectall:border-blue-400'}`}>
                      <Check size={18} className="stroke-[3]" />
                    </button>
                    <span className="text-sm p-1 font-semibold text-slate-700 group-hover/selectall:text-blue-600 transition-colors">Select All</span>
                  </div>

                  {selectedDocIds.length > 0 && (
                    <button
                      onClick={() => {
                        setMessages(prev => prev.map(m => selectedDocIds.includes(m.id) ? { ...m, inDepository: docTab === 'documents' } : m));
                        setSelectedDocIds([]);
                      }}
                      className="text-xs font-semibold py-1 px-2  bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
                    >
                      {docTab === 'documents' ? 'Move to Depository' : 'Remove from Depository'}
                    </button>
                  )}
                </div>
              )}
              {filteredDisplayDocs.map((doc) => (
                <div
                  key={`full-${doc.id}`}
                  className={`flex flex-col sm:flex-row items-center justify-between border border-slate-200 rounded-xl p-2 bg-white shadow-sm hover:shadow-md transition gap-2 w-full ${doc.inDepository ? 'opacity-75' : ''} ${selectedDocIds.includes(doc.id) ? 'border-blue-400 bg-blue-50/10' : ''}`}
                >
                  {/* LEFT SIDE: Checkbox, Icon, File Name & Details */}
                  <div className="flex items-center gap-4 flex-1 overflow-hidden w-full group/item">
                    {docTab === 'documents' && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocIds(prev => prev.includes(doc.id) ? prev.filter(id => id !== doc.id) : [...prev, doc.id]);
                        }}
                        className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${selectedDocIds.includes(doc.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-transparent hover:border-blue-400'}`}
                      >
                        <Check size={14} className="stroke-[3]" />
                      </div>
                    )}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoc(doc);
                      }}
                      className="flex items-center gap-4 flex-1 overflow-hidden cursor-pointer group/doc-link"
                    >
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0 transition-colors group-hover/doc-link:bg-blue-100">
                        {doc.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                          <Image size={20} />
                        ) : (
                          <FileText size={20} />
                        )}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <h4 className={`text-sm font-semibold truncate group-hover/doc-link:text-blue-600 transition-colors ${doc.inDepository ? 'text-slate-500' : 'text-slate-800'}`} title={doc.fileName}>
                          {doc.fileName}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-slate-500">{doc.fileSize}</span>
                          <span className="text-blue-300">•</span>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {doc.fullTimestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE: Approve / Reject Buttons */}
                  <div
                    className="shrink-0 flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex-1 sm:flex-none">
                      {doc.docStatus === 'requested' ? (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleDocAction(doc.id, 'will_send_later')}
                            className="px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all border-2 bg-amber-500 border-amber-500 text-white hover:bg-amber-600 rounded-lg whitespace-nowrap"
                          >
                            I will send later
                          </button>
                          <button
                            onClick={() => handleDocAction(doc.id, 'already_sent')}
                            className="px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all border-2 bg-blue-500 border-blue-500 text-white hover:bg-blue-600 rounded-lg whitespace-nowrap"
                          >
                            Already sent
                          </button>
                        </div>
                      ) : doc.docStatus === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDocAction(doc.id, 'approved')}
                            className="px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-all border-2 bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 rounded-lg"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDocAction(doc.id, 'rejected')}
                            className="px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all border-2 bg-red-500 border-red-500 text-white hover:bg-red-600 rounded-lg"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className={`text-[10px] font-black px-2 py-1 rounded-full border-2 transition-all uppercase tracking-widest ${doc.docStatus === 'approved'
                            ? 'text-emerald-600 border-emerald-500 bg-emerald-50'
                            : doc.docStatus === 'rejected'
                              ? 'text-red-600 border-red-500 bg-red-50'
                              : doc.docStatus === 'already_sent'
                                ? 'text-blue-600 border-blue-500 bg-blue-50'
                                : doc.docStatus === 'will_send_later'
                                  ? 'text-amber-500 border-amber-500 bg-amber-50'
                                  : 'text-red-500 border-red-500 bg-red-50'
                            }`}>
                            {doc.docStatus.replace(/_/g, ' ')}
                          </div>
                        </div>
                      )}
                    </div>

                    {doc.docStatus === 'requested' && (
                      <>
                        <div className="w-px h-8 bg-slate-200 shrink-0"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveRequestId(doc.id);
                            if (fileInputRef.current) {
                              fileInputRef.current.click();
                            }
                          }}
                          className="px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all border-2 bg-blue-50 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                          title="Upload Document"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                        </button>
                      </>
                    )}

                    {doc.docStatus !== 'requested' && doc.docStatus !== 'approved' && (
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-1 text-red-400 hover:text-red-600 transition-all flex items-center gap-2"
                        title="Delete Document"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsView;
