import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, FileText, X, Send, Lock, MessageSquare,
  Upload, AlertCircle, Info, Plus, ChevronRight, Download,
  PenTool, Clock, Globe, HelpCircle
} from 'lucide-react';

const ClientPortal = () => {

  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  // --- CHAT STATES ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatContext, setChatContext] = useState("General");
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef(null);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Admin', text: 'Hello! Please ensure you upload the 2025 version of the certificate.', timestamp: '10:30 AM', context: 'General' },
    { id: 2, sender: 'Client', text: 'I only have the 2024 one right now. Is that okay?', timestamp: '10:32 AM', context: 'General' },
  ]);

  // --- AUTO-SCROLL TO BOTTOM ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // --- SIMULATED ADMIN RESPONSE LOGIC ---
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'Client') {
      setIsTyping(true);
      const timer = setTimeout(() => {
        const adminReply = {
          id: Date.now(),
          sender: 'Admin',
          text: `I have received your message regarding "${lastMessage.context}". Our team is reviewing it and we will get back to you shortly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          context: lastMessage.context
        };
        setMessages(prev => [...prev, adminReply]);
        setIsTyping(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(),
      sender: 'Client',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      context: chatContext
    };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  // --- MOCK DATA ---
  const [assignment, setAssignment] = useState({
    id: 'ASG-99201',
    name: 'FY24 Financial Compliance Audit',
    status: 'In Progress',
    sections: [
      {
        id: 'sec_1',
        title: 'Entity Information',
        questions: [
          { id: 'q1', title: 'Legal Entity Name', type: 'TEXT', mandatory: true, locked: true, value: 'Global Industries Ltd' },
          { id: 'q2', title: 'Registration Date', type: 'DATE', mandatory: true, locked: true, value: '2010-05-12' },
          { id: 'q3', title: 'Tax Identification Number', type: 'TEXT', mandatory: true, locked: false, value: '' },
        ]
      },
      {
        id: 'sec_2',
        title: 'Financial Documentation',
        questions: [
          { id: 'q4', title: 'Upload Latest Balance Sheet', type: 'FILE', mandatory: true, locked: false, value: null },
          { id: 'q5', title: 'Previous Year Tax Returns', type: 'FILE', mandatory: true, locked: true, value: 'tax_return_2023.pdf' },
          { id: 'q6', title: 'Is the entity VAT registered?', type: 'BUTTONS', options: ['Yes', 'No'], mandatory: true, locked: false, value: '' },
        ]
      },
      {
        id: 'sec_3',
        title: 'Stakeholder Declaration',
        questions: [
          { id: 'q7', title: 'Current Number of Employees', type: 'NUMBER', mandatory: false, locked: false, value: '' },
          { id: 'q8', title: 'Declaration of Accuracy', type: 'BUTTONS', options: ['Confirmed', 'Needs Review'], mandatory: true, locked: false, value: '' },
        ]
      }
    ]
  });

  const [responses, setResponses] = useState({});
  const [isSigned, setIsSigned] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signName, setSignName] = useState('');
  const [errors, setErrors] = useState([]);
  const [hasChangesPending, setHasChangesPending] = useState(false);

  useEffect(() => {
    const initialResponses = {};
    assignment.sections.forEach(sec => {
      sec.questions.forEach(q => {
        initialResponses[q.id] = q.value;
      });
    });
    setResponses(initialResponses);
  }, [assignment]);

  const allQuestions = assignment.sections.flatMap(s => s.questions);
  const mandatoryQuestions = allQuestions.filter(q => q.mandatory);
  const completedMandatory = mandatoryQuestions.filter(q => responses[q.id] && responses[q.id] !== '').length;
  const progressPercent = (completedMandatory / mandatoryQuestions.length) * 100;

  const handleInputChange = (id, val) => {
    setResponses(prev => ({ ...prev, [id]: val }));
    if (isSigned) setHasChangesPending(true);
  };

  const validateAndSubmit = () => {
    const missing = mandatoryQuestions.filter(q => !responses[q.id] || responses[q.id] === '').map(q => q.id);
    if (missing.length > 0) {
      setErrors(missing);
      const element = document.getElementById(missing[0]);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setErrors([]);
      setShowSignModal(true);
    }
  };

  const handleFinalSign = () => {
    if (!signName) return;
    setIsSigned(true);
    setHasChangesPending(false);
    setShowSignModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full hidden lg:block">
        <div className="p-8">
          <div className="flex items-center gap-1 mb-10">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-medium">c</div>
            <span className="font-bold text-slate-800 tracking-tight">ClientPortal</span>
          </div>
          <nav className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Jump to Section</p>
            {assignment.sections.map((sec, idx) => (
              <a key={sec.id} href={`#${sec.id}`} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-colors group">
                <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] group-hover:bg-blue-100 group-hover:text-blue-600">{idx + 1}</span>
                {sec.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-64 pb-20">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-sm font-bold text-slate-800 uppercase">{assignment.name}</h1>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">7/10 REQS</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full md:w-64 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                <Download size={14} /> Review PDF
              </button>
              <button
                onClick={validateAndSubmit}
                className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
              >
                Sign & Submit
              </button>
            </div>

            {/* --- NEW PROFILE SECTION --- */}
            <div className="flex items-center gap-4 border-l border-slate-100 pl-6">

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfileUpload}
                className="hidden"
                accept="image/*"
              />

              <div
                className="relative cursor-pointer group"
                onClick={() => fileInputRef.current.click()}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center transition-transform active:scale-95">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-blue-600 font-bold text-xs uppercase">
                      {/* Logic to show initials of the client (Johnathan Miller -> JM) */}
                      JM
                    </span>
                  )}
                </div>
                {/* Small Plus Icon */}
                <div className="absolute -bottom-0.5 -right-0.5 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center border-2 border-white shadow-sm group-hover:bg-blue-700">
                  <Plus size={10} strokeWidth={4} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {hasChangesPending && (
          <div className="mx-8 mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3 text-amber-700">
              <AlertCircle size={18} /><p className="text-xs font-bold uppercase tracking-tight">Changes pending — please re-sign to submit</p>
            </div>
            <button onClick={() => setShowSignModal(true)} className="text-[10px] font-black bg-amber-200 text-amber-800 px-3 py-1 rounded-lg uppercase">Sign Now</button>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-8 py-10 space-y-12">
          {assignment.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{section.title}</h2>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              <div className="space-y-6">
                {section.questions.map((q) => (
                  <div key={q.id} id={q.id} className={`p-6 bg-white border rounded-2xl transition-all ${errors.includes(q.id) ? 'border-red-500 ring-4 ring-red-50' : 'border-slate-100 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-bold text-slate-700">{q.title}</label>
                        {q.mandatory && <span className="text-red-500 font-bold">*</span>}
                        {q.locked && <Lock size={12} className="text-slate-400" />}
                      </div>
                      <button
                        onClick={() => { setChatContext(q.title); setIsChatOpen(true); }}
                        className="text-slate-300 hover:text-blue-500 transition-colors">
                        <MessageSquare size={16} />
                      </button>
                    </div>

                    <div className={q.locked ? 'opacity-60 grayscale-[0.5] pointer-events-none' : ''}>
                      {q.type === 'TEXT' && <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm" placeholder="Type answer here..." value={responses[q.id] || ''} onChange={(e) => handleInputChange(q.id, e.target.value)} />}
                      {q.type === 'BUTTONS' && (
                        <div className="flex gap-3">
                          {q.options.map(opt => (
                            <button key={opt} onClick={() => handleInputChange(q.id, opt)} className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border ${responses[q.id] === opt ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}>{opt}</button>
                          ))}
                        </div>
                      )}
                      {q.type === 'FILE' && (
                        <div className="flex items-center gap-4">
                          <label className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                            <Upload className="text-slate-400 mb-2" size={20} /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{responses[q.id] ? 'Replace File' : 'Click to Upload'}</span>
                            <input type="file" className="hidden" onChange={(e) => handleInputChange(q.id, e.target.files[0]?.name)} />
                          </label>
                          {responses[q.id] && <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-3 rounded-xl border border-blue-100 max-w-xs overflow-hidden"><FileText size={14} /><span className="text-xs font-bold truncate">{responses[q.id]}</span></div>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
          <div className="pt-10 border-t border-slate-200 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6"><CheckCircle2 size={32} /></div>
            <h3 className="text-lg font-bold text-slate-800">Ready to Submit?</h3>
            <button onClick={validateAndSubmit} className="bg-[#0f172a] text-white px-10 py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 shadow-xl mt-4">Sign & Submit Final Assignment</button>
          </div>
        </div>
      </main>

      {/* SIGNATURE MODAL */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-6">Legal Signing</h2>
            <input type="text" placeholder="Type your full name..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-lg font-medium outline-none" value={signName} onChange={(e) => setSignName(e.target.value)} />
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowSignModal(false)} className="flex-1 py-4 text-sm font-bold text-slate-400">Cancel</button>
              <button onClick={handleFinalSign} disabled={!signName} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm disabled:opacity-50 transition-all">Sign & Complete</button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT WINDOW */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[500px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-10 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">A</div>
              <div><h4 className="text-white text-xs font-bold uppercase tracking-widest">Admin Support</h4><p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">Online</p></div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
          </div>

          {chatContext !== "General" && (
            <div className="bg-blue-50 px-6 py-2 border-b border-blue-100 flex justify-between items-center">
              <span className="text-[10px] font-black text-blue-600 uppercase">Context: {chatContext}</span>
              <button onClick={() => setChatContext("General")} className="text-[9px] font-bold text-blue-400 underline">Clear</button>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'Client' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium ${msg.sender === 'Client' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
                  <p>{msg.text}</p>
                  <span className={`text-[8px] mt-2 block font-bold uppercase opacity-60`}>{msg.timestamp}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white border border-slate-100 p-3 rounded-2xl flex gap-1 items-center">
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="relative flex items-center">
              <input type="text" placeholder="Type your message..." className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none pr-12" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
              <button onClick={handleSendMessage} className="absolute right-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Send size={18} /></button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT TOGGLE BUTTON */}
      {/* <button onClick={() => setIsChatOpen(!isChatOpen)} className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-50">
        {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button> */}

    </div>
  );
};

export default ClientPortal;