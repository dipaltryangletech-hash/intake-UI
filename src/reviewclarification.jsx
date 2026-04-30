import React, { useState } from 'react';
import { 
  Search, Bell, Settings, CheckCircle2, MessageSquare, 
  FileText, Eye, Download, XCircle, Clock, ChevronRight,
  User, Layout, ShieldCheck, History, Send, MoreHorizontal
} from 'lucide-react';

const ReviewWorkspace = () => {
  // --- STATE ---
  const [currentStatus, setCurrentStatus] = useState('Ready for Review');
  const [items, setItems] = useState([
    {
      id: 'Q1',
      type: 'question',
      number: 'QUESTION 01',
      status: 'Answered',
      title: 'Have there been any major acquisitions this fiscal year?',
      content: '"Yes, we acquired Zenith Labs in Q3. The deal was finalized on September 14th."',
      reviewStatus: 'pending', // approved, clarification, pending
      chat: [
        { id: 101, user: 'JD', name: 'John Doe', text: 'Could you please provide the merger agreement for Zenith Labs?', time: '10:42 AM' }
      ]
    },
    {
      id: 'F2',
      type: 'file',
      number: 'FILE 02',
      status: 'Uploaded',
      title: 'Annual Fixed Asset Ledger',
      fileName: 'Fixed_Asset_Ledger_2023_Final.pdf',
      fileSize: '2.4 MB',
      uploadedBy: 'Sarah Smith',
      reviewStatus: 'pending'
    },
    {
      id: 'Q3',
      type: 'question',
      number: 'QUESTION 03',
      status: 'Pending Client',
      title: 'Documentation of R&D Tax Credits',
      content: 'Waiting for client response: Documentation of R&D Tax Credits...',
      reviewStatus: 'pending_client'
    }
  ]);

  const [auditTrail] = useState([
    { id: 1, user: 'John Doe', action: 'approved Q1', time: '2 mins ago', type: 'success' },
    { id: 2, user: 'Admin', action: 'requested clarification for Q4', time: '1 hour ago', type: 'warning' }
  ]);

  // --- HANDLERS ---
  const handleReviewAction = (id, newStatus) => {
    setItems(items.map(item => item.id === id ? { ...item, reviewStatus: newStatus } : item));
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-poppins antialiased flex flex-col">
      
      {/* --- TOP NAVIGATION --- */}
      <nav className="bg-white border-b border-slate-200 px-6 py-2.5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white"><ShieldCheck size={18}/></div>
            <span className="font-bold text-slate-800 tracking-tight">Review Workspace</span>
          </div>
          <div className="flex gap-6 text-xs font-semibold text-slate-500">
            <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
            <span className="hover:text-blue-600 cursor-pointer">Clients</span>
            <span className="text-blue-600 border-b-2 border-blue-600 pb-3 mt-3">Workpapers</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={14} />
            <input type="text" placeholder="Search documents..." className="bg-slate-100 border-none rounded-lg pl-9 pr-4 py-1.5 text-xs w-64 focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
          </div>
          <Bell size={18} className="text-slate-400 cursor-pointer hover:text-slate-600" />
          <Settings size={18} className="text-slate-400 cursor-pointer hover:text-slate-600" />
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-[11px] font-bold text-blue-600 border border-blue-200">JD</div>
        </div>
      </nav>

      <div className="flex flex-1">
        
        {/* --- LEFT SIDEBAR (STATUS & PROGRESS) --- */}
        <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-10">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Status Flow</p>
            <div className="space-y-1">
              <StatusNavItem label="Ready for Review" icon={<Clock size={14}/>} active={currentStatus === 'Ready for Review'} />
              <StatusNavItem label="Ready for Approval" icon={<CheckCircle2 size={14}/>} active={currentStatus === 'Ready for Approval'} />
              <StatusNavItem label="In Progress" icon={<History size={14}/>} active={currentStatus === 'In Progress'} />
              <StatusNavItem label="Completed" icon={<Layout size={14}/>} active={currentStatus === 'Completed'} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Review Progress</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-black text-slate-800">65%</span>
              <span className="text-[10px] font-bold text-slate-400 pb-1">13 of 20 items</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-[65%]" />
            </div>
          </div>

          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Audit Trail</p>
            <div className="space-y-4">
              {auditTrail.map(log => (
                <div key={log.id} className="flex gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${log.type === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="text-[11px] font-bold text-slate-700 leading-tight">
                      {log.user} <span className="font-medium text-slate-500">{log.action}</span>
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                <FileText size={12}/> {'{{DATA:DOCUMENT:DOCUMENT_1}}'}
              </p>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Client Review: 2023 Tax Provision</h1>
              <div className="flex gap-4 text-xs font-semibold">
                <p className="text-slate-400 uppercase tracking-tighter">Preparer: <span className="text-slate-800 uppercase tracking-normal">John Doe</span></p>
                <div className="w-[1px] h-4 bg-slate-200" />
                <p className="text-slate-400 uppercase tracking-tighter">Client: <span className="text-slate-800 uppercase tracking-normal">Acme Corp</span></p>
              </div>
            </div>

            {/* Review Cards */}
            <div className="space-y-6">
              
              {/* Card 1: Question with Chat */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Question 01</span>
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded-full border border-emerald-100 uppercase tracking-tight">
                        <CheckCircle2 size={10}/> Answered
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleReviewAction('Q1', 'approved')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
                        <CheckCircle2 size={12}/> Approve
                      </button>
                      <button onClick={() => handleReviewAction('Q1', 'clarification')} className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all border border-slate-200">
                        <MessageSquare size={12}/> Clarification
                      </button>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-2">{items[0].title}</h3>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mb-6 italic text-slate-600 text-xs">
                    {items[0].content}
                  </div>

                  <div className="border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-2 mb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       <MessageSquare size={12}/> Internal Discussions & Client Chat
                    </div>
                    {items[0].chat.map(msg => (
                      <div key={msg.id} className="flex gap-3 mb-4">
                        <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-600 flex-shrink-0">{msg.user}</div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-slate-700">{msg.name}</span>
                              <span className="text-[9px] text-slate-400">{msg.time}</span>
                           </div>
                           <div className="bg-blue-50/50 border border-blue-100 rounded-tr-xl rounded-br-xl rounded-bl-xl p-3 text-xs text-slate-600 max-w-sm">
                             {msg.text}
                           </div>
                        </div>
                      </div>
                    ))}
                    <div className="relative">
                      <input type="text" placeholder="Message client or team..." className="w-full bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"><Send size={16}/></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: File Review */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">File 02</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-full border border-blue-100 uppercase tracking-tight">
                      <FileText size={10}/> Uploaded
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 size={12}/> Approve
                    </button>
                    <button className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5 border border-rose-100">
                      <XCircle size={12}/> Reject File
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-4">Annual Fixed Asset Ledger</h3>
                <div className="bg-white border border-slate-100 border-dashed rounded-xl p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center border border-rose-100"><FileText size={20}/></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Fixed_Asset_Ledger_2023_Final.pdf</p>
                      <p className="text-[10px] text-slate-400 font-medium">2.4 MB • Uploaded by Client (Sarah Smith)</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-slate-300">
                     <button className="hover:text-blue-500"><Eye size={16}/></button>
                     <button className="hover:text-blue-500"><Download size={16}/></button>
                  </div>
                </div>
                <button className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-blue-500">
                  <MessageSquare size={12}/> Add Clarification Note
                </button>
              </div>

              {/* Card 3: Pending Item */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 opacity-60">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Question 03</span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-500 text-[9px] font-bold rounded-full border border-amber-100 uppercase tracking-tight">
                       Pending Client
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-slate-300">N/A</span>
                </div>
                <h3 className="text-xs font-bold text-slate-400 italic">Waiting for client response: Documentation of R&D Tax Credits...</h3>
              </div>

            </div>
          </div>
        </main>

      </div>
    </div>
  );
};

// --- HELPER COMPONENT ---
const StatusNavItem = ({ label, icon, active }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);

export default ReviewWorkspace;