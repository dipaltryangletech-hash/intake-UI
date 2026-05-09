import React from 'react';
import {
  Paperclip, User, Bot, FileText, Image, Download, Eye, Check, X,
  Smile, CheckCheck, ReplyAll, Info, CheckCircle, XCircle
} from 'lucide-react';
import { SendHorizontalIcon } from 'lucide-react';

const ChatView = ({
  messages,
  filteredMessages,
  messagesEndRef,
  setSelectedDoc,
  setDocSidebarOpen,
  handleDocAction,
  handleToggleSelection,
  selectedDocIds,
  isTyping,
  clientName,
  replyingTo,
  setReplyingTo,
  input,
  setInput,
  handleSend,
  handleKeyDown,
  pendingFiles,
  setPendingFiles,
  fileInputRef,
  inputRef,
  QUICK_REPLIES,
  handleQuickReply,
  PdfIcon
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat Area */}
      <div
        className="flex-1 overflow-y-auto px-4 space-y-1 scrollbar-hide flex flex-col"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div className="flex items-center justify-center py-2">
          <div className="bg-blue-100/80 backdrop-blur-sm text-blue-700 text-[10px] font-semibold px-4 py-1 rounded-full shadow-sm">
            Today
          </div>
        </div>

        {filteredMessages.map((msg) => (
          <React.Fragment key={msg.id}>
            {/* --- NOTIFICATION RENDERING --- */}
            {msg.type === "notification" && (
              <div className="flex justify-center w-full my-3 animate-fadeIn">
                <div className={`px-4 py-2 rounded-xl text-[11px] font-medium shadow-sm border flex items-center gap-2 max-w-[80%] ${msg.action === 'approved' ? 'bg-green-50 text-green-700 border-green-300' :
                  msg.action === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-400' :
                    msg.action === 'already_sent' || msg.action === 'uploaded' ? 'bg-blue-50 text-blue-700 border-blue-400' :
                      msg.action === 'will_send_later' ? 'bg-amber-50 text-amber-700 border-amber-400' :
                        'bg-red-50 text-red-700 border-red-400'
                  }`}>
                  <Info size={14} className="shrink-0" />
                  <span>
                    <span className="font-bold">{msg.docName}</span> is <span className="italic">{msg.action.replace(/_/g, ' ')}</span> by <span className="font-bold">{msg.client}</span> on {msg.fullTimestamp}
                  </span>
                </div>
              </div>
            )}

            {/* --- REGULAR CHAT RENDERING --- */}
            {msg.type !== "notification" && (
              <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn group/message items-end mb-1`}>
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-auto mb-1 shrink-0 border border-blue-200">
                    <span className="text-blue-600 text-[10px]">A</span>
                  </div>
                )}

                {msg.sender === "user" && (
                  <div className="flex items-center mr-2 mb-1">
                    <button onClick={() => { setReplyingTo(msg); inputRef.current?.focus(); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Reply">
                      <ReplyAll size={18} className="transition-transform duration-300" />
                    </button>
                  </div>
                )}

                <div className={`relative max-w-[75%] pt-1 mb-1 ${msg.type === 'document' ? 'p-0 bg-transparent' : 'px-3.5 py-2.5 rounded-xl shadow-sm text-[13px] leading-relaxed'} ${msg.type === 'text' && msg.sender === "user" ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md" : msg.type === 'text' ? "bg-white text-slate-700 border border-slate-100 rounded-bl-md " : ""}`}>

                  {/* TEXT MESSAGE */}
                  {msg.type === 'text' && (
                    <>
                      {msg.replyTo && (
                        <div className={`mb-1.5 p-2 rounded-lg border-l-4 text-[11px] opacity-90 cursor-pointer ${msg.sender === 'user' ? 'bg-black/10 border-white/50' : 'bg-green-50 border-green-400'}`}>
                          <div className={`font-bold mb-0.5 ${msg.sender === 'user' ? 'text-white' : 'text-green-700'}`}>{msg.replyTo.sender === 'user' ? 'You' : 'Assistant'}</div>
                          <div className="truncate max-w-[200px]">{msg.replyTo.text}</div>
                        </div>
                      )}
                      <div className={`text-[10px] text-right font-medium mb-1 ${msg.sender === "user" ? "text-blue-200" : "text-slate-400"}`}>
                        {msg.sender === "bot" ? "Admin" : clientName}
                      </div>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sender === "user" ? "text-blue-200" : "text-slate-400"}`}>
                        <span className="text-[10px]">{msg.time}</span>
                        {msg.sender === "user" && (
                          <CheckCheck size={13} className={msg.status === "read" ? "text-blue-200" : msg.status === "delivered" ? "text-blue-300" : "text-blue-400/50"} />
                        )}
                      </div>
                    </>
                  )}

                  {/* DOCUMENT MESSAGE */}
                  {msg.type === 'document' && (
                    <div className={`bg-white border shadow-sm rounded-2xl w-[500px] overflow-hidden ${msg.sender === "user" ? "border-blue-100" : "border-slate-200"}`}>
                      {msg.replyTo && (
                        <div className="m-3 mb-0 p-2 bg-slate-50 rounded-lg border-l-4 border-blue-400 text-[11px] opacity-90">
                          <div className="font-bold text-slate-700 mb-0.5">{msg.replyTo.sender === 'user' ? 'You' : 'Assistant'}</div>
                          <div className="truncate text-slate-500">{msg.replyTo.text}</div>
                        </div>
                      )}
                      <div className="flex items-center justify-between px-4 border-b border-slate-100 transition-colors">
                        <div className="text-[10px] text-slate-400 font-medium py-2">Shared on {msg.fullTimestamp || msg.time}</div>
                        <div className="text-[10px] text-slate-400 font-medium py-2">{msg.sender === "bot" ? "Admin" : clientName}</div>
                      </div>

                      <div className="p-3">
                        <div className="flex items-center gap-3 mb-4">
                          <div onClick={() => { setSelectedDoc(msg); }} className="flex items-center gap-3 cursor-pointer group/doc-link">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0 group-hover/doc-link:bg-blue-100 transition-all">
                              {msg.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                                <Image size={20} />
                              ) : msg.fileName.toLowerCase().endsWith('.pdf') ? (
                                <PdfIcon size={20} />
                              ) : (
                                <FileText size={20} />
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-[15px] font-bold text-slate-800 truncate group-hover/doc-link:text-blue-600 transition-colors" title={msg.fileName}>{msg.fileName}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{msg.fileSize}</p>
                            </div>
                          </div>
                        </div>

                        {msg.docStatus === 'pending' ? (
                          <div className="flex gap-3 mb-1">
                            <button onClick={() => handleDocAction(msg.id, 'approved')} className="py-2 flex-1 flex items-center justify-center gap-2 border-2 bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition-all font-semibold text-sm"><CheckCircle size={18} /> Approve</button>
                            <button onClick={() => handleDocAction(msg.id, 'rejected')} className="py-2 flex-1 flex items-center justify-center gap-2 border-2 bg-red-500 border-red-500 text-white hover:bg-red-600 rounded-lg transition-all font-semibold text-sm"><XCircle size={18} /> Reject</button>
                          </div>
                        ) : (
                          <div className={`w-full py-2 text-center rounded-3xl font-bold text-sm mb-1 border ${msg.docStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 ' : 'bg-red-50 text-red-600 border-red-200 '}`}>{msg.docStatus === 'approved' ? 'Approved' : 'Rejected'}</div>
                        )}

                        {msg.text && (
                          <div className="mt-2 px-1 py-2 border-t border-slate-100">
                            <p className="text-[14px] text-slate-700 leading-relaxed">{msg.text}</p>
                            <div className="flex justify-end mt-1 opacity-60"><span className="text-[9px] text-slate-500">{msg.time}</span></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === "bot" && (
                  <div className="flex items-center ml-2 mb-1">
                    <button onClick={() => { setReplyingTo(msg); inputRef.current?.focus(); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Reply">
                      <ReplyAll size={18} className="transition-transform duration-300" />
                    </button>
                  </div>
                )}

                {msg.sender === "user" && msg.type !== "notification" && (
                  <div className="w-7 h-7 bg-orange-400 rounded-full flex items-center justify-center ml-2 mt-auto mb-1 shrink-0 text-white text-[12px] font-normal">
                    {clientName.charAt(0)}
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fadeIn">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-auto mb-1 shrink-0 border border-blue-200">
              <Bot size={14} className="text-blue-600" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.filter(m => m.type === 'text').length <= 3 && (
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm shrink-0 z-10">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Quick Replies</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_REPLIES.map((text, i) => (
              <button key={i} onClick={() => handleQuickReply(text)} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-100 transition-all font-medium">
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 px-3 py-2 shrink-0 z-10">
        {replyingTo && (
          <div className="mx-2 mb-2 p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between border-l-4 border-l-blue-500 animate-fadeIn">
            <div className="flex flex-col overflow-hidden pr-4">
              <span className="text-[10px] font-bold text-blue-600 mb-0.5">Replying to {replyingTo.sender === 'user' ? 'yourself' : 'Assistant'}</span>
              <span className="text-xs text-slate-600 truncate">{replyingTo.type === 'document' ? replyingTo.fileName : replyingTo.text}</span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600 p-1 shrink-0 bg-white rounded-full shadow-sm"><X size={14} /></button>
          </div>
        )}
        {pendingFiles.length > 0 && (
          <div className="mx-2 mb-2 flex flex-col gap-1">
            {pendingFiles.map((file, index) => (
              <div key={index} className="p-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={16} className="text-blue-600 shrink-0" />
                  <span className="text-xs text-blue-800 truncate font-medium">{file.name}</span>
                  <span className="text-[10px] text-blue-400 font-bold uppercase">{(file.size / 1024).toFixed(0)} KB</span>
                </div>
                <button onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== index))} className="text-blue-400 hover:text-red-500 transition-colors"><X size={16} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="flex items-center gap-0.5">
            <button className="p-2 mb-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Smile size={20} /></button>
            <button onClick={() => fileInputRef.current?.click()} className={`p-2 mb-2 flex items-center rounded-lg transition-colors ${pendingFiles.length > 0 ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}><Paperclip size={20} /></button>
          </div>
          <div className="flex-1 relative">
            <textarea ref={inputRef} rows={1} placeholder={pendingFiles.length > 0 ? "Add a caption..." : "Type a message..."} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} className="w-full resize-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all" style={{ maxHeight: "120px" }} />
          </div>
          {(input.trim() || pendingFiles.length > 0) && (
            <button onClick={handleSend} className="p-2.5 mb-2 items-center bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-md active:scale-95"><SendHorizontalIcon size={18} /></button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatView;
