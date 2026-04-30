import React, { useState, useEffect } from 'react';
import { Check, FileText, Upload, Eye, XCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

const UnifiedAssignmentPage = ({ role = 'admin' }) => {
  // role 'admin' या 'client' हो सकता है
  const isAdmin = role === 'admin';

  // --- STATES ---
  const [responses, setResponses] = useState({}); // क्लाइंट के जवाब
  const [reviewStatuses, setReviewStatuses] = useState({}); // एडमिन के डिसीजन (Approve/Reject)
  const [activeSection, setActiveSection] = useState('sec1');

  // डमी डेटा (Structure)
  const assignmentData = {
    name: "Annual Compliance Audit 2024",
    client: "Dipal Panchal",
    id: "#411668",
    sections: [
      {
        id: 'sec1',
        name: "Personal Information",
        questions: [
          { id: 'q1', title: "What is your full name?", answerType: 'SHORT_TEXT', isMandatory: true },
          { id: 'q2', title: "Upload Identity Proof", answerType: 'FILE', allowUpload: true }
        ]
      }
    ]
  };

  // --- HANDLERS ---
  const handleAdminAction = (qId, status) => {
    if (!isAdmin) return;
    setReviewStatuses(prev => ({ ...prev, [qId]: status }));
  };

  const handleClientInput = (qId, value) => {
    if (isAdmin) return;
    setResponses(prev => ({ ...prev, [qId]: value }));
  };

  const currentSection = assignmentData.sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-poppins text-slate-900 pb-10">
      
      {/* HEADER (Same for both) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 px-8 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">{assignmentData.name}</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {isAdmin ? `Reviewing: ${assignmentData.client}` : `Fill details for: ${assignmentData.client}`}
          </p>
        </div>
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">
          {isAdmin ? 'Submit Review' : 'Save Assignment'}
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-10 flex gap-10">
        
        {/* SIDEBAR (Structure same) */}
        <aside className="w-72 shrink-0">
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sticky top-32">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Sections</h3>
            {assignmentData.sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} 
                className={`w-full text-left p-4 rounded-2xl text-[11px] font-bold mb-2 transition-all ${activeSection === s.id ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'text-slate-400'}`}>
                {s.name}
              </button>
            ))}
          </div>
        </aside>

        {/* QUESTIONS AREA */}
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-4">{currentSection.name}</h2>
          
          {currentSection.questions.map((q, idx) => {
            const status = reviewStatuses[q.id]; // APPROVED, REJECTED, CLARIFY

            return (
              <div key={q.id} className={`bg-white rounded-[2.5rem] border p-10 shadow-sm transition-all duration-300 ${
                !isAdmin && status === 'REJECTED' ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
              }`}>
                
                {/* QUESTION HEADER */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    {/* CLIENT SIDE FEEDBACK TAGS */}
                    {!isAdmin && status && (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 ${
                        status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 
                        status === 'REJECTED' ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {status === 'APPROVED' ? <CheckCircle2 size={12}/> : status === 'REJECTED' ? <XCircle size={12}/> : <AlertCircle size={12}/>}
                        {status}
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{idx + 1}. {q.title}</h3>
                  </div>

                  {/* ADMIN ACTION BUTTONS */}
                  {isAdmin && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleAdminAction(q.id, 'APPROVED')}
                        className={`text-[9px] font-black px-4 py-2 rounded-xl border transition-all uppercase tracking-tighter shadow-sm ${
                          status === 'APPROVED' ? 'bg-emerald-500 text-white border-emerald-600 scale-105' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>Approve</button>
                      
                      <button onClick={() => handleAdminAction(q.id, 'REJECTED')}
                        className={`text-[9px] font-black px-4 py-2 rounded-xl border transition-all uppercase tracking-tighter shadow-sm ${
                          status === 'REJECTED' ? 'bg-rose-500 text-white border-rose-600 scale-105' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>Reject</button>
                      
                      <button onClick={() => handleAdminAction(q.id, 'CLARIFY')}
                        className={`text-[9px] font-black px-4 py-2 rounded-xl border transition-all uppercase tracking-tighter shadow-sm ${
                          status === 'CLARIFY' ? 'bg-orange-500 text-white border-orange-600 scale-105' : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>Clarify</button>
                    </div>
                  )}
                </div>

                {/* ANSWER FIELD */}
                <div className="space-y-4">
                  {q.answerType === 'SHORT_TEXT' && (
                    <input
                      type="text"
                      readOnly={isAdmin}
                      value={responses[q.id] || ''}
                      onChange={(e) => handleClientInput(q.id, e.target.value)}
                      placeholder={isAdmin ? "No answer provided" : "Type your answer here..."}
                      className={`w-full bg-slate-50/50 border rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none transition-all shadow-inner ${
                        isAdmin ? 'cursor-default' : 'focus:border-blue-400 focus:bg-white'
                      } ${!isAdmin && status === 'REJECTED' ? 'border-rose-400' : 'border-slate-200'}`}
                    />
                  )}

                  {/* FILE UPLOAD DISPLAY */}
                  {q.answerType === 'FILE' && (
                    <div className="space-y-4">
                      {/* Already uploaded file (Visible to Admin & Client) */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <FileText className="text-blue-500" size={24} />
                          <div>
                            <p className="text-xs font-black text-slate-700 uppercase">Passport_Copy.pdf</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PDF Document • 1.2 MB</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button className="p-2 bg-white text-blue-500 rounded-lg shadow-sm border border-slate-100"><Eye size={16}/></button>
                        </div>
                      </div>

                      {/* Upload Box (Only Client can see and only if not approved) */}
                      {!isAdmin && status !== 'APPROVED' && (
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:border-blue-300 cursor-pointer group transition-all">
                          <Upload className="text-blue-500 mb-2 group-hover:scale-110 transition-all" size={24} />
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload Supporting Document</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default UnifiedAssignmentPage;