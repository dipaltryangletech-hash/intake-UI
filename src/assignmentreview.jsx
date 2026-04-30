import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Added hooks

import { 
  CheckCircle2, AlertCircle, FileText, MessageSquare, 
  User, Clock, Shield, ChevronRight, Download, 
  ExternalLink, Search, Bell, Settings, ArrowLeft,
  XCircle, CheckCircle, HelpCircle, MoreVertical
} from 'lucide-react';

const AssignmentReviewPage = () => {
  // --- USER PERMISSIONS & ROLES ---
  const [currentUser] = useState({
    name: "Admin User",
    role: "Admin",
    hasDelegationRights: true // Toggle this to test visibility
  });

  // --- ASSIGNMENT STATE ---
  const [assignment, setAssignment] = useState({
    title: "ANNUAL AUDIT Q3 2026",
    client: "John Doe",
    email: "john@example.com",
    priority: "High",
    status: "Submitted", // Submitted, Ready for Review, Ready for Final Approval, Completed
    createdDate: "10 Oct, 2025",
    currentSection: "Company Profile",
    openRequirements: 4,
    sections: [
      { id: 1, title: "COMPANY PROFILE", completed: 3, total: 10, icon: <User size={16}/> },
      { id: 2, title: "FINANCIAL RECORDS", completed: 0, total: 5, icon: <FileText size={16}/> },
      { id: 3, title: "COMPLIANCE CHECK", completed: 0, total: 12, icon: <Shield size={16}/> },
      { id: 4, title: "INTERNAL CONTROLS", completed: 0, total: 5, icon: <Settings size={16}/> },
    ],
    roles: {
      preparer: { name: "Sarah Connor", date: "Oct 12, 10:45 AM" },
      reviewer: { name: "Michael Scott", date: null },
      finalApprover: { name: "Admin User", date: null }
    }
  });

  // --- WORKFLOW LOGIC ---
  const updateStatus = (newStatus) => {
    const timestamp = new Date().toLocaleString();
    setAssignment(prev => ({
      ...prev,
      status: newStatus,
      roles: {
        ...prev.roles,
        reviewer: newStatus === 'Ready for Final Approval' ? { name: currentUser.name, date: timestamp } : prev.roles.reviewer,
        finalApprover: newStatus === 'Completed' ? { name: currentUser.name, date: timestamp } : prev.roles.finalApprover
      }
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-poppins text-slate-900">
      
      {/* 1. TOP UTILITY NAV */}
      

      {/* 2. HEADER INFO BAR */}
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-blue-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <ArrowLeft size={14} /> {assignment.title}
                </h1>
            </div>
            <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100">
                <Clock size={14} /> VIEW HISTORY
            </button>
        </div>

        <div className="grid grid-cols-5 gap-8">
            <StatItem label="Client" value={assignment.client} />
            <StatItem label="Email" value={assignment.email} />
            <StatItem label="Priority" value={assignment.priority} isPriority />
            <StatItem label="Status" value={assignment.status} isStatus />
            <StatItem label="Created Date" value={assignment.createdDate} />
        </div>
      </header>

      <div className="flex">
        {/* 3. LEFT SECTION NAVIGATION */}
        <aside className="w-64 border-r border-slate-200 h-[calc(100vh-180px)] p-6 sticky top-[140px]">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Section Nav</h3>
            <div className="space-y-2">
                {assignment.sections.map(sec => (
                    <div key={sec.id} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${assignment.currentSection === sec.title ? 'bg-white shadow-md border border-slate-100' : 'hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`${assignment.currentSection === sec.title ? 'text-blue-600' : 'text-slate-400'}`}>
                                {sec.icon}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-tight ${assignment.currentSection === sec.title ? 'text-slate-900' : 'text-slate-500'}`}>
                                {sec.title}
                            </span>
                        </div>
                        <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded leading-none">{sec.completed}/{sec.total}</span>
                    </div>
                ))}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100">
                <button className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-slate-600 transition-colors">
                    <HelpCircle size={14} /> Support
                </button>
            </div>
        </aside>

        {/* 4. MAIN REVIEW CONTENT */}
        <main className="flex-1 p-8 pb-32">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{assignment.currentSection}</h2>
                        <p className="text-slate-500 text-sm mt-1">Review the core organizational details provided by the client.</p>
                    </div>
                    <button className="flex items-center gap-2 text-blue-600 bg-blue-50/50 border border-blue-200 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-tighter hover:bg-blue-100 transition-all">
                        <CheckCircle2 size={14} /> Approve All Questions
                    </button>
                </div>

                {/* Q1: TEXT/CHAT QUESTION */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-800">Q1: Legal Entity Structure and Ownership</h4>
                            <p className="text-xs text-slate-400 italic">Guidance: Provide a full list of shareholders and their respective stakes as of the reporting date.</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-md uppercase border border-emerald-100">Approved</span>
                            <button className="bg-amber-50 text-amber-600 text-[10px] font-bold px-3 py-1 rounded-md uppercase border border-amber-100">Clarify</button>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed mb-6">
                        The company is structured as a Limited Liability Company (LLC) under the state of Delaware. Major shareholders include Sapphire Holding Corp (45%), Logic Venture Capital (30%), and individual stakeholders (25%).
                    </div>

                    {/* Chat Thread */}
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">A</div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold">Admin</span>
                                    <span className="text-[9px] text-slate-400">10:45 AM</span>
                                </div>
                                <div className="bg-slate-100 text-slate-700 text-xs py-2 px-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-slate-200 inline-block max-w-md">
                                    Please provide a clearer copy of the shareholder agreement.
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <div className="space-y-1 text-right">
                                <div className="flex items-center gap-2 justify-end">
                                    <span className="text-[9px] text-slate-400">11:02 AM</span>
                                    <span className="text-[10px] font-bold">Client</span>
                                </div>
                                <div className="bg-blue-600 text-white text-xs py-2 px-3 rounded-tl-xl rounded-bl-xl rounded-br-xl shadow-sm inline-block max-w-md">
                                    Sure, uploading the PDF now to the file section below.
                                </div>
                            </div>
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-[10px] font-bold flex-shrink-0">C</div>
                        </div>
                    </div>
                </div>

                {/* Q2: FILE UPLOAD QUESTION */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-800">Q2: Certificate of Incorporation</h4>
                            <p className="text-xs text-slate-400 italic">Guidance: Upload the most recent certified copy of the incorporation document.</p>
                        </div>
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-md uppercase border border-slate-200">Pending Review</span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-50 p-2 rounded-lg text-red-500 border border-red-100">
                                <FileText size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-700">Cert_Incorporation_2025.pdf</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter mt-0.5">2.4 MB • Uploaded on 12 Oct</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-emerald-500 text-white text-[9px] font-bold px-4 py-2 rounded-md uppercase tracking-wider hover:bg-emerald-600 transition-colors">Approve</button>
                            <button className="bg-white text-red-500 text-[9px] font-bold px-4 py-2 rounded-md uppercase tracking-wider border border-red-200 hover:bg-red-50 transition-colors">Reject</button>
                        </div>
                    </div>

                    <textarea 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500"
                        placeholder="Add a comment if rejecting..."
                        rows="2"
                    ></textarea>
                </div>

                {/* Q3: TABLE DATA QUESTION */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-800">Q3: Key Management Personnel</h4>
                            <p className="text-xs text-slate-400 italic">Guidance: List all executive directors and officers.</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-md uppercase border border-emerald-100">Approved</button>
                            <button className="bg-amber-50 text-amber-600 text-[10px] font-bold px-3 py-1 rounded-md uppercase border border-amber-100">Clarify</button>
                        </div>
                    </div>

                    <div className="overflow-hidden border border-slate-100 rounded-xl">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-400 uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Position</th>
                                    <th className="px-4 py-3">Experience</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600 divide-y divide-slate-100">
                                <tr>
                                    <td className="px-4 py-4 font-bold">Emily Davis</td>
                                    <td className="px-4 py-4">Operations Director</td>
                                    <td className="px-4 py-4">10 Years</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-4 font-bold">John Doe</td>
                                    <td className="px-4 py-4">Chief Executive Officer</td>
                                    <td className="px-4 py-4">15 Years</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
      </div>

      {/* 5. FLOATING WORKFLOW FOOTER */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 flex items-center justify-between z-[100] animate-in slide-in-from-bottom duration-500">
        <div className="flex items-center gap-4 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
            <AlertCircle size={18} className="text-red-500" />
            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                Open Required Items ({assignment.openRequirements})
            </span>
        </div>

        <div className="flex items-center gap-3">
            {/* Status-Driven Workflow Buttons */}
            <button 
                onClick={() => updateStatus('Ready for Review')}
                disabled={assignment.status !== 'Submitted'}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border
                ${assignment.status === 'Submitted' ? 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50' : 'bg-slate-50 text-slate-300 border-transparent cursor-not-allowed'}`}
            >
                Ready for Review
            </button>

            <button 
                onClick={() => updateStatus('Ready for Final Approval')}
                disabled={assignment.status !== 'Ready for Review' || !currentUser.hasDelegationRights}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border
                ${assignment.status === 'Ready for Review' ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' : 'bg-slate-50 text-slate-300 border-transparent cursor-not-allowed'}`}
            >
                Ready for Final Approval
            </button>

            <button 
                onClick={() => updateStatus('Completed')}
                disabled={assignment.status !== 'Ready for Final Approval' || !currentUser.hasDelegationRights}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all
                ${assignment.status === 'Ready for Final Approval' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
                Final Approve
            </button>
        </div>
      </footer>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const StatItem = ({ label, value, isPriority, isStatus }) => (
    <div className="space-y-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</p>
        <div className="flex items-center gap-1.5">
            {isPriority && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
            {isStatus && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>}
            <span className={`text-xs font-bold ${isStatus ? 'bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase text-[10px]' : 'text-slate-800'}`}>
                {value}
            </span>
        </div>
    </div>
);

export default AssignmentReviewPage;