import React from 'react';
import {
  X, Plus, Image, FileText, Trash2, ExternalLink
} from 'lucide-react';

const DocumentPreviewModal = ({
  selectedDoc,
  setSelectedDoc,
  messages,
  handleDeleteDoc,
  fileInputRef,
  setActiveRequestId,
  previewBlobUrl,
  PdfIcon // Passed from parent if needed, or imported
}) => {
  if (!selectedDoc) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#f8fafc] rounded-2xl w-full max-w-7xl h-[90vh] shadow-2xl overflow-hidden flex border border-slate-200">

        {/* LEFT SIDEBAR: Files List */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-semibold text-[14px] text-slate-700 flex items-center">
              Files<span className="text-[12px]">({messages.filter(m => m.type === 'document' && m.fileUrl).length})</span></h3>
            <button
              onClick={() => {
                setActiveRequestId(null);
                fileInputRef.current?.click();
              }}
              className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              title="Upload New Document"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 hide-scrollbar">
            {messages.filter(m => m.type === 'document' && m.fileUrl).reverse().map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-2 rounded-xl cursor-pointer group flex items-center gap-3 border ${selectedDoc.id === doc.id
                  ? 'border-blue-500 bg-slate-50 hover:bg-slate-50'
                  : 'border-transparent hover:bg-slate-50'
                  }`}
              >
                <div className={`flex items-center justify-center p-2 rounded-xl shrink-0 transition-colors ${selectedDoc.id === doc.id ? 'text-blue-600' : ' text-slate-400'}`}>
                  {doc.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                    <Image size={20} />
                  ) : (
                    <FileText size={20} />
                  )}
                </div>
                <div className="overflow-hidden flex flex-col justify-center">
                  <p className={`text-[13px] font-semibold truncate ${selectedDoc.id === doc.id ? 'text-blue-600' : 'text-slate-700'}`}>{doc.fileName}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{doc.fileSize}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN AREA: Preview & Actions */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 shadow-sm bg-white z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                {selectedDoc.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                  <Image size={24} className="text-blue-600" />
                ) : (
                  <FileText size={24} className="text-slate-500" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-lg leading-tight truncate max-w-md">{selectedDoc.fileName}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-400 font-medium">{selectedDoc.fileSize}</span>
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  <span className="text-xs text-blue-500 font-medium uppercase">{selectedDoc.fileName.split('.').pop()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  handleDeleteDoc(selectedDoc.id);
                  setSelectedDoc(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all font-semibold text-sm shadow-sm"
              >
                <Trash2 size={18} />
                Delete
              </button>
              <button
                onClick={() => {
                  if (previewBlobUrl) {
                    window.open(previewBlobUrl, '_blank');
                  } else {
                    window.open(selectedDoc.fileUrl, '_blank');
                  }
                }}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <ExternalLink size={20} />
              </button>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-slate-100/50 p-6 overflow-hidden relative">
            <div className="w-full h-full bg-white rounded-xl shadow-inner border border-slate-200 overflow-hidden">
              {selectedDoc.fileUrl ? (
                selectedDoc.fileName.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={selectedDoc.fileUrl} className="w-full h-full border-none" title="PDF Preview" />
                ) : selectedDoc.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                  <div className="w-full h-full flex items-center justify-center p-4 bg-slate-50">
                    <img src={selectedDoc.fileUrl} alt="Preview" className="max-w-full max-h-full object-contain shadow-lg rounded-lg" />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <FileText size={64} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">Preview not available for this file type</p>
                    <button onClick={() => window.open(selectedDoc.fileUrl, '_blank')} className="mt-4 text-blue-600 font-bold hover:underline">Download to View</button>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 italic">No file data available</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentPreviewModal;
