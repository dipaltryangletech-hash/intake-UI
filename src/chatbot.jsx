import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  Smile,
  MoreVertical,
  Search,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  ChevronDown,
  Eye,
  Trash2,
  FolderPlus,
  MessageCircle,
  CirclePlus,
  ListTodo,
  Layers,
  Plus,
  Square,
  Check,
  Pencil,
  RefreshCcw,
  ExternalLink,
  FileText,
  File,
  CheckCircle,
  XCircle,
  X,
  CircleAlert,
  ArrowRight,
  Info,
  FileX,
  ReplyAll,
  RotateCcw,
  Paperclip,
  Image
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

const PdfIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2z" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2v6h6" fill="#ef4444" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="12" y="16" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">PDF</text>
  </svg>
);

// Timestamp Helper Function
function getFullTimestamp() {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${date} at ${time}`;
}

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const INITIAL_MESSAGES = [
  {
    id: 1,
    type: "text",
    text: "👋 Hello! Welcome to Intake Platform Assistant. How can I help you today?",
    sender: "bot",
    time: formatTime(),
    fullTimestamp: getFullTimestamp(),
    status: "read",
  },
  {
    id: 2,
    type: "text",
    text: "I can help you with:\n• Managing Assignments\n• Client Information\n• User Management\n• Master Checklists\n\nJust type your question!",
    sender: "bot",
    time: formatTime(),
    fullTimestamp: getFullTimestamp(),
    status: "read",
  },
  {
    id: 3,
    type: "document",
    fileName: "Shareholder_Agreement_v2.pdf",
    fileSize: "2.4 MB",
    sender: "user",
    time: formatTime(),
    fullTimestamp: getFullTimestamp(),
    status: "read",
    docStatus: "pending"
  }
];

const QUICK_REPLIES = [
  "How do I create an assignment?",
  "Show client list",
  "Help with checklist",
  "Contact support",
];

const BOT_RESPONSES = {
  default: "Thanks for your message! I'm processing your request. Our team will get back to you shortly.",
  assignment: "To create a new assignment:\n1. Go to Assignments page\n2. Click '+ Create Assignment'\n3. Fill in the details\n4. Add sections and questions\n5. Save or publish!",
  client: "You can manage clients from the Clients page. There you can:\n• Add new clients\n• Edit existing information\n• View client details\n• Track invitation status",
  checklist: "Master Checklists help you create reusable templates. Go to Master Checklist in the navigation to:\n• Create new checklists\n• Manage existing ones\n• Use them in assignments",
  support: "Our support team is available 24/7!\n📧 Email: support@intakeplatform.com\n📞 Phone: +1 (555) 000-1234\n💬 Live chat: You're already here!",
  hello: "Hey there! 😊 Great to see you. How can I help you today? Feel free to ask anything about the Intake Platform.",
};

function getBotResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes("assignment") || lower.includes("create")) return BOT_RESPONSES.assignment;
  if (lower.includes("client") || lower.includes("list")) return BOT_RESPONSES.client;
  if (lower.includes("checklist") || lower.includes("template")) return BOT_RESPONSES.checklist;
  if (lower.includes("support") || lower.includes("contact") || lower.includes("help")) return BOT_RESPONSES.support;
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) return BOT_RESPONSES.hello;
  return BOT_RESPONSES.default;
}



const ChatBot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingFiles, setPendingFiles] = useState([]);
  // 1. Extract Client Data & Assignment ID securely
  const clientName = location.state?.name || location.state?.client || "Guest";
  const [selectedDoc, setSelectedDoc] = useState(null);
  const assignmentId = location.state?.assignmentId || "general";
  const clientId = location.state?.clientId || "anonymous";

  // 2. Create a UNIQUE Storage Key per Client or Assignment
  // If we have an assignment, use it. Otherwise, use the clientId to keep client chats separate.
  const contextId = assignmentId !== "general" ? assignmentId : `client_${clientId}`;
  const storageKey = `chatbot_messages_${contextId.replace('#', '')}`;

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [customDocInput, setCustomDocInput] = useState("");
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({}); // { groupId: boolean }
  const [selectedItems, setSelectedItems] = useState([]); // List of {id, name, type}

  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('document_groups');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // 3. Initialize State from LocalStorage using the UNIQUE Key
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_MESSAGES; }
    }
    return INITIAL_MESSAGES;
  });

  // Ensure chat updates if user navigates directly from one client chat to another client chat
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch (e) { setMessages(INITIAL_MESSAGES); }
    } else {
      setMessages(INITIAL_MESSAGES);
    }
  }, [storageKey]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const initialView = location.state?.view || 'chat';
  const [docSidebarOpen, setDocSidebarOpen] = useState(initialView === 'documents');
  const [chatIconOn, setChatIconOn] = useState(initialView === 'chat');
  const [taskIconOn, setTaskIconOn] = useState(initialView === 'tasks');

  // Handle external view changes via location state
  useEffect(() => {
    if (location.state?.view) {
      setDocSidebarOpen(location.state.view === 'documents');
      setChatIconOn(location.state.view === 'chat');
      setTaskIconOn(location.state.view === 'tasks');
    }
  }, [location.state?.view]);

  // 6. Tasks State
  const tasksStorageKey = `chatbot_tasks_${contextId.replace('#', '')}`;
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(tasksStorageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(tasksStorageKey, JSON.stringify(tasks));
  }, [tasks, tasksStorageKey]);

  const [newTaskInput, setNewTaskInput] = useState("");
  const [taskTab, setTaskTab] = useState("active");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskText, setEditTaskText] = useState("");

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const handleAddTask = () => {
    if (!newTaskInput.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      text: newTaskInput.trim(),
      completed: false,
    };
    setTasks(prev => [newTask, ...prev]);
    setNewTaskInput("");
  };

  const handleToggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditTaskText(task.text);
  };

  const saveEditTask = () => {
    if (editingTaskId && editTaskText.trim()) {
      setTasks(prev => prev.map(t => t.id === editingTaskId ? { ...t, text: editTaskText.trim() } : t));
    }
    setEditingTaskId(null);
    setEditTaskText("");
  };

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // 4. Document Preview Blob Management
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);

  useEffect(() => {
    if (!selectedDoc?.fileUrl || !selectedDoc.fileUrl.startsWith('data:')) {
      setPreviewBlobUrl(selectedDoc?.fileUrl || null);
      return;
    }

    try {
      const parts = selectedDoc.fileUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)[1];
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      const blob = new Blob([u8arr], { type: mime });
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);

      return () => URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Blob conversion failed:", e);
      setPreviewBlobUrl(selectedDoc.fileUrl);
    }
  }, [selectedDoc]);

  // 5. Save to LocalStorage whenever messages change using the UNIQUE Key
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn("LocalStorage quota exceeded. Some large documents may not be saved for the next session.");
      }
    }
  }, [messages, storageKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!taskIconOn && !docSidebarOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, taskIconOn, docSidebarOpen]);



  // Derived logic for documents
  const documentMessages = messages.filter(m => m.type === "document");
  const pendingCount = documentMessages.filter(m => m.docStatus === "pending").length;
  const pendingChatCount = 4; // Placeholder for pending chat count

  // Documents Tabs State
  const [docTab, setDocTab] = useState("documents");
  const activeDocs = documentMessages.filter(d => !d.inDepository);
  const depositoryDocs = documentMessages.filter(d => d.inDepository);
  const displayDocs = docTab === "documents" ? activeDocs : depositoryDocs;

  const [selectedDocIds, setSelectedDocIds] = useState([]);

  const handleToggleSelection = (msgId) => {
    setSelectedDocIds(prev =>
      prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]
    );
  };

  // Handle Document Approve/Reject & Trigger Notification
  const handleDocAction = (id, newStatus) => {
    const targetDoc = messages.find(m => m.id === id);
    if (!targetDoc) return;

    const actionTime = getFullTimestamp();

    // Determine who is performing the action
    const performer = (newStatus === 'approved' || newStatus === 'rejected') ? 'Admin' : clientName;

    // Create the Auto-Notification Message
    const notificationMsg = {
      id: Date.now() + Math.random(),
      type: "notification", // Special type for system alerts
      docName: targetDoc.fileName,
      action: newStatus,
      client: performer,
      time: formatTime(),
      fullTimestamp: actionTime,
    };

    setMessages(prev => {
      // Update the document's status
      const updatedDocs = prev.map(m => m.id === id ? { ...m, docStatus: newStatus } : m);
      // Append the notification to the chat
      return [...updatedDocs, notificationMsg];
    });
  };

  // 10. Delete Document Permanently
  const handleDeleteDoc = (id) => {
    if (window.confirm("Are you sure you want to delete this document? This cannot be undone.")) {
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleSend = () => {
    if (!input.trim() && pendingFiles.length === 0) return;

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const isDocument = pendingFiles.length > 0;

    const createMessage = (file = null, fileUrl = null, caption = "") => {
      return {
        id: Date.now() + Math.random(),
        type: file ? "document" : "text",
        text: caption,
        sender: "user",
        time: formatTime(),
        fullTimestamp: getFullTimestamp(),
        status: "sent",
        replyTo: replyingTo ? { id: replyingTo.id, sender: replyingTo.sender, text: replyingTo.type === 'document' ? replyingTo.fileName : replyingTo.text } : null,
        ...(file && {
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          fileUrl: fileUrl,
          docStatus: "pending",
        })
      };
    };

    const processFilesAndSend = async () => {
      const messagesToSend = [];
      let currentCaption = input.trim();

      if (pendingFiles.length > 0) {
        for (let i = 0; i < pendingFiles.length; i++) {
          const file = pendingFiles[i];
          const fileUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          });

          // Send caption with the first file only, or as a separate message if preferred.
          // Here we attach it to the first file.
          messagesToSend.push(createMessage(file, fileUrl, i === 0 ? currentCaption : ""));
        }
      } else if (currentCaption) {
        messagesToSend.push(createMessage(null, null, currentCaption));
      }

      if (messagesToSend.length === 0) return;

      setMessages((prev) => [...prev, ...messagesToSend]);
      setInput("");
      setPendingFiles([]);
      setReplyingTo(null);
      setIsTyping(true);

      // Simulate delivery and read status for all new messages
      messagesToSend.forEach((msg, index) => {
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, status: "delivered" } : m))
          );
        }, 500 + (index * 100));

        setTimeout(() => {
          setIsTyping(false);
          const responseText = msg.type === "document"
            ? `I've received your document: ${msg.fileName}. I'll review it shortly!`
            : getBotResponse(msg.text);

          const botReply = {
            id: Date.now() + Math.random(),
            type: "text",
            text: responseText,
            sender: "bot",
            time: formatTime(),
            fullTimestamp: getFullTimestamp(),
            status: "read",
          };

          setMessages((prev) => {
            const updated = prev.map((m) => (m.id === msg.id ? { ...m, status: "read" } : m));
            return [...updated, botReply];
          });
        }, 1500 + (index * 200));
      });
    };

    processFilesAndSend();
  };

  const handleQuickReply = (text) => {
    setInput(text);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Context-aware File Upload Handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (selectedDoc || activeRequestId) {
      // Modal Context or Direct List Context: Immediate Upload or Re-upload
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newDoc = {
            id: activeRequestId || (Date.now() + Math.random()),
            type: "document",
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            fileUrl: reader.result,
            sender: "user",
            time: formatTime(),
            fullTimestamp: getFullTimestamp(),
            status: "sent",
            docStatus: "pending",
          };

          setMessages(prev => {
            if (activeRequestId) {
              const updated = prev.map(m => m.id === activeRequestId ? newDoc : m);
              if (selectedDoc) {
                const updatedDoc = updated.find(m => m.id === activeRequestId);
                if (updatedDoc) setSelectedDoc(updatedDoc);
              }
              return updated;
            } else {
              const updated = [...prev, newDoc];
              if (selectedDoc) {
                setSelectedDoc(newDoc);
              }
              return updated;
            }
          });
        };
        reader.readAsDataURL(file);
      });
      setActiveRequestId(null);
    } else {
      // Chat Context: Add to pending
      setPendingFiles(prev => [...prev, ...files]);
    }
    e.target.value = '';
  };

  const filteredMessages = searchQuery
    ? messages.filter((m) => m.type === "text" && m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;


  const renderPreviewContent = (doc) => {
    if (!doc?.fileUrl) return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <FileX size={48} className="mb-4 opacity-20" />
        <p className="font-medium">Document content unavailable</p>
      </div>
    );

    const ext = doc.fileName.split('.').pop().toLowerCase();
    const docs = [{ uri: doc.fileUrl, fileName: doc.fileName }];
    const previewUrl = previewBlobUrl || doc.fileUrl;

    // 1. Premium Image Preview
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return (
        <div className="flex flex-col items-center animate-fadeIn group p-4">
          <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(59,130,246,0.15)] border-4 border-white bg-white max-w-full ring-1 ring-blue-100">
            <img
              src={previewUrl}
              alt="preview"
              className="max-w-full max-h-[65vh] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>
      );
    }

    // 2. Enhanced PDF Preview (Native Browser Viewer is best)
    if (ext === 'pdf') {
      const srcUrl = previewUrl.startsWith('data:') ? previewUrl : `${previewUrl}#toolbar=0`;
      return (
        <div className="w-full h-[75vh] relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner hide-scrollbar">
          <iframe
            src={srcUrl}
            className="w-full h-full border-none"
            title="PDF Preview"
          />
          {/* Overlay to style empty browser spaces if needed */}
          <div className="absolute top-0 right-0 p-4 pointer-events-none">
            <span className="bg-white/300 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">PDF VIEWER</span>
          </div>
        </div>
      );
    }

    // 3. Office & Other Formats Fallback
    // Note: Local blob: URLs for Office files (pptx, docx, xlsx) cannot be rendered by online services (Microsoft/Google)
    // as they require a publicly accessible URL.
    if (['pptx', 'docx', 'xlsx', 'xls', 'ppt'].includes(ext)) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 w-full min-h-[500px]">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
            <FileText size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Local Preview Unavailable</h3>
          <p className="text-slate-500 text-sm max-w-md mb-8 leading-relaxed">
            Microsoft Office documents (<strong>{ext.toUpperCase()}</strong>) require a public link for online previewers.
            Since this file is private/local, please download it to view it on your device.
          </p>
          <a
            href={doc.fileUrl}
            download={doc.fileName}
            className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
          >
            <Send size={18} className="rotate-90" /> Download & Open {ext.toUpperCase()}
          </a>
        </div>
      );
    }

    // 4. Universal Document Viewer (Office, Text, CSV)
    return (
      <div className="w-full h-[75vh] flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-2xl hide-scrollbar">
        <div className="flex-1 relative hide-scrollbar overflow-y-auto">
          <DocViewer
            documents={docs}
            pluginRenderers={DocViewerRenderers}
            style={{ height: '100%' }}
            theme={{
              primary: "#3b82f6",
              secondary: "#f1f5f9",
              tertiary: "#ffffff",
              textPrimary: "#1e293b",
              textSecondary: "#64748b",
              textTertiary: "#94a3b8",
              disableThemeScrollbar: true,
            }}
            config={{
              header: {
                disableHeader: true,
                disableFileName: true,
              },
              csvDelimiter: ',', // For CSV files
              pdfZoom: {
                defaultZoom: 1.1,
                zoomJump: 0.2,
              },
            }}
          />
        </div>

      </div>
    );
  };


  // --- Logic Functions ---

  const toggleExpand = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const isSelected = (id) => selectedItems.some(item => item.id === id);

  const handleToggleSelect = (item, groupSubgroups = []) => {
    if (item.type === 'group') {
      const allSubgroupSelected = groupSubgroups.length > 0 && groupSubgroups.every(sg => isSelected(sg.id));
      if (allSubgroupSelected) {
        // Unselect all subgroups in this group
        const groupSubgroupIds = groupSubgroups.map(sg => sg.id);
        setSelectedItems(selectedItems.filter(i => !groupSubgroupIds.includes(i.id)));
      } else {
        // Select all subgroups not already selected
        const newSelections = [...selectedItems];
        groupSubgroups.forEach(sg => {
          if (!isSelected(sg.id)) {
            newSelections.push({ id: sg.id, name: sg.name, type: 'subgroup' });
          }
        });
        setSelectedItems(newSelections);
      }
    } else {
      if (isSelected(item.id)) {
        setSelectedItems(selectedItems.filter(i => i.id !== item.id));
      } else {
        setSelectedItems([...selectedItems, item]);
      }
    }
  };

  const handleSelectAll = () => {
    const allSubgroups = [];
    groups.forEach(g => {
      g.subgroups.forEach(sg => {
        allSubgroups.push({ id: sg.id, name: sg.name, type: 'subgroup' });
      });
    });

    if (selectedItems.length === allSubgroups.length && allSubgroups.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allSubgroups);
    }
  };

  const handleAddCustomDoc = () => {
    if (!customDocInput.trim()) return;
    const newItem = {
      id: "custom-" + Date.now(),
      name: customDocInput.trim(),
      type: "subgroup"
    };
    setSelectedItems([...selectedItems, newItem]);
    setCustomDocInput("");
  };

  const handleRequestDocuments = () => {
    if (selectedItems.length === 0) return;

    const requestTime = getFullTimestamp();
    const newRequests = selectedItems.map(item => ({
      id: Date.now() + Math.random(),
      type: "document",
      fileName: item.name,
      fileSize: "Requested",
      sender: "bot",
      time: formatTime(),
      fullTimestamp: requestTime,
      status: "read",
      docStatus: "requested",
      isRequest: true,
      inDepository: false
    }));

    setMessages(prev => [...prev, ...newRequests]);
    setSelectedItems([]);
    setIsRequestModalOpen(false);
  };

  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  // Filter groups based on search
  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
    g.subgroups.some(sg => sg.name.toLowerCase().includes(modalSearch.toLowerCase()))
  );

  const totalSelectableItemsCount = groups.reduce((acc, g) => acc + g.subgroups.length, 0);

  return (
    <div className="w-full bg-white font-poppins text-slate-900 flex flex-col">
      <main className="flex-1 flex flex-col w-full">

        {/* Removed wrapper padding, rounded corners, shadows, and max-widths */}
        <div className="flex-1 bg-white flex flex-col relative ">

          {/* Chat Header */}
          <div className=" sticky top-10 z-50 bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2 flex items-center justify-between shrink-0 z-50">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="flex items-center text-white/90 transition hover:text-white">
                <ChevronLeft size={20} />
                <span className="text-sm font-medium ml-1">Back</span>
              </button>
              <div className="relative flex">
                <div className="w-7 h-7 text-white text-[15px] font-bold bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  {/* Uses the first letter of the actual client's name or Guest */}
                  {clientName.charAt(0)}
                </div>
              </div>
              <div>
                <h3 className="text-white/100 font-semibold text-[15px]">{isTyping ? "Typing..." : `${clientName}`}</h3>
              </div>
            </div>


            <div className="flex items-center gap-3">

              {/* Chat Toggle */}
              <button
                onClick={() => {
                  setChatIconOn(true);
                  setTaskIconOn(false);
                  setDocSidebarOpen(false);
                }}
                className={`relative flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors ml-1 ${chatIconOn && !docSidebarOpen ? 'bg-green-600 hover:bg-green-600' : 'hover:bg-white/10'
                  }`}
                title="Chat"
              >
                <MessageCircle size={16} className={chatIconOn && !docSidebarOpen ? "text-white" : "text-white/80"} />
                <span className={chatIconOn && !docSidebarOpen ? "text-white text-[12px] font-medium" : "text-white/80 text-[12px] font-medium"}>
                  Chat
                </span>
                {pendingChatCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#fdf4c6] text-slate-900 text-[9px] font-semibold px-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full border border-[#1e293b] shadow-sm">
                    {pendingChatCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setTaskIconOn(true);
                  setChatIconOn(false);
                  setDocSidebarOpen(false);
                }}
                className={`relative flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors  ${taskIconOn ? 'bg-amber-600 hover:bg-amber-600' : 'hover:bg-white/10'
                  }`}
                title="Task Action"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={taskIconOn ? "text-white" : "text-white/80"}
                >
                  <path d="M21 12 A 9 9 0 1 0 12 21" />
                  <path d="M9 12 l 2.5 2.5 L 16 9" />
                  <path d="M19 15 v6 M16 18 h6" />
                </svg>
                <span className={taskIconOn ? "text-white text-[12px] font-medium" : "text-white/80 text-[12px] font-medium"}>
                  Tasks
                </span>
                {activeTasks.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#fdf4c6] text-slate-900 text-[9px] font-semibold px-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full border border-[#1e293b] shadow-sm">
                    {activeTasks.length}
                  </span>
                )}
              </button>

              {/* Document Sidebar Toggle */}
              <button
                onClick={() => {
                  setDocSidebarOpen(true);
                  setChatIconOn(false);
                  setTaskIconOn(false);
                }}
                className={`relative flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors ${docSidebarOpen ? 'bg-[#1c90bb] hover:bg-[#1c90bb]' : 'hover:bg-white/10'
                  }`}
              >
                <FolderPlus size={18} className={docSidebarOpen ? "text-white" : "text-white/80"} />
                <span className={docSidebarOpen ? "text-white text-[12px] font-medium" : "text-white/80 text-[12px] font-medium"}>
                  Documents
                </span>
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#fdf4c6] text-slate-900 text-[9px] font-semibold px-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full border border-[#1e293b] shadow-sm">
                    {pendingCount}
                  </span>
                )}
              </button>
              <span className="inline-block h-8 border-l-1 border border-white/60 mx-3"></span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-blue-500" size={16} />
                <input
                  type="text"
                  placeholder="Search in conversation..."
                  className="pl-10 pr-4 py-1.5 bg-white/10 border-white/50 rounded-lg text-sm w-full lg:w-64 focus:outline-none focus:ring-1 focus:ring-slate-50  transition-all text-white focus:text-white placeholder:text-white/60 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

            </div>
          </div>


          {/* Middle Section (Scrolling Chat Area & Absolute Sidebar) */}
          <div className="flex-1 flex overflow-hidden relative">

            {/* Tasks Overlay */}
            {taskIconOn && (
              <div className="w-full bg-white flex flex-col animate-fadeIn flex-1">
                {/* Tabs Header */}
                <div className="shrink-0 bg-slate-50/50 px-6 pt-2">
                  <div className="max-w-4xl mx-auto flex items-end border-b border-slate-200">
                    <button
                      onClick={() => setTaskTab('active')}
                      className={`py-3 px-3 font-semibold text-sm transition-colors relative ${taskTab === 'active' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Tasks {activeTasks.length > 0 && `(${activeTasks.length})`}
                      {taskTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
                    </button>
                    <button
                      onClick={() => setTaskTab('completed')}
                      className={`py-3 px-3 font-semibold text-sm transition-colors relative ${taskTab === 'completed' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Completed {completedTasks.length > 0 && `(${completedTasks.length})`}
                      {taskTab === 'completed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
                    </button>
                  </div>
                </div>

                {/* Add Task Input (Sticky) */}
                {taskTab === 'active' && (
                  <div className="px-6 pt-2 mt-2 pb-2 bg-white shrink-0 z-10">
                    <div className="max-w-4xl mx-auto relative">
                      <input
                        type="text"
                        value={newTaskInput}
                        onChange={(e) => setNewTaskInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        placeholder="Add a task..."
                        className="w-full pl-5 pr-14 px-4 py-3 bg-blue-50 border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                      />
                      <button
                        onClick={handleAddTask}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Tasks Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 scrollbar-hide">
                  <div className="max-w-4xl mx-auto space-y-2">
                    {(taskTab === 'active' ? activeTasks : completedTasks).map(task => (
                      <div key={task.id} className="group flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all animate-fadeIn">
                        <div className="flex items-center gap-2 flex-1 overflow-hidden">
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className={`group/tick shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-blue-500 border-blue-500' : 'border-slate-300 hover:border-blue-400'}`}
                          >
                            {task.completed ? (
                              <Check size={14} className="text-white" strokeWidth={3} />
                            ) : (
                              <Check size={14} className="text-blue-400 opacity-0 group-hover/tick:opacity-50 transition-opacity" strokeWidth={3} />
                            )}
                          </button>

                          {editingTaskId === task.id ? (
                            <input
                              type="text"
                              value={editTaskText}
                              onChange={(e) => setEditTaskText(e.target.value)}
                              onBlur={saveEditTask}
                              onKeyDown={(e) => e.key === 'Enter' && saveEditTask()}
                              className="flex-1 px-3 py-1.5 bg-blue-50 text-sm font-medium text-slate-800 rounded-lg outline-none border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all w-full"
                              autoFocus
                            />
                          ) : (
                            <div
                              onDoubleClick={() => startEditTask(task)}
                              className={`flex-1 text-sm font-medium truncate cursor-text py-1 ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}
                            >
                              {task.text}
                            </div>
                          )}
                        </div>

                      </div>
                    ))}

                    {(taskTab === 'active' ? activeTasks : completedTasks).length === 0 && (
                      <div className="text-center py-12 text-slate-500 text-sm flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                          <ListTodo size={32} />
                        </div>
                        {taskTab === 'active' ? "No active tasks. Add one above!" : "No completed tasks yet."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Area - This is the ONLY area that scrolls */}
            <div
              className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide flex flex-col ${taskIconOn || docSidebarOpen ? 'hidden' : ''}`}
              style={{
                backgroundColor: "#f8fafc",
              }}
            >
              <div className="flex items-center justify-center py-2">
                <div className="bg-blue-100/80 backdrop-blur-sm text-blue-700 text-[10px] font-semibold px-4 py-1 rounded-full shadow-sm">
                  Today
                </div>
              </div>

              {filteredMessages.map((msg) => (
                <React.Fragment key={msg.id}>

                  {/* --- NOTIFICATION RENDERING (Centered) --- */}
                  {msg.type === "notification" && (
                    <div className="flex justify-center w-full my-3 animate-fadeIn">
                      <div className={`px-4 py-2 rounded-xl text-[11px] font-medium shadow-sm border flex items-center gap-2 max-w-[80%] ${msg.action === 'approved'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : msg.action === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : msg.action === 'already_sent' || msg.action === 'uploaded'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : msg.action === 'will_send_later'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
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
                            <ReplyAll size={18} className=" transition-transform duration-300" />
                          </button>
                        </div>
                      )}

                      <div className={`relative max-w-[75%] ${msg.type === 'document' ? 'p-0 bg-transparent' : 'px-3.5 py-2.5 rounded-xl shadow-sm text-[13px] leading-relaxed'} ${msg.type === 'text' && msg.sender === "user" ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md" : msg.type === 'text' ? "bg-white text-slate-700 border border-slate-100 rounded-bl-md" : ""}`}>

                        {/* TEXT MESSAGE */}
                        {msg.type === 'text' && (
                          <>
                            {msg.replyTo && (
                              <div className={`mb-1.5 p-2 rounded-lg border-l-4 text-[11px] opacity-90 cursor-pointer ${msg.sender === 'user' ? 'bg-black/10 border-white/50' : 'bg-green-50 border-green-400'}`}>
                                <div className={`font-bold mb-0.5 ${msg.sender === 'user' ? 'text-white' : 'text-green-700'}`}>{msg.replyTo.sender === 'user' ? 'You' : 'Assistant'}</div>
                                <div className="truncate max-w-[200px]">{msg.replyTo.text}</div>
                              </div>
                            )}
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
                          <div className={`bg-white border shadow-sm rounded-2xl w-[500px] overflow-hidden ${msg.sender === "user" ? "border-blue-100" : "border-slate-200"
                            }`}>
                            {msg.replyTo && (
                              <div className="m-3 mb-0 p-2 bg-slate-50 rounded-lg border-l-4 border-blue-400 text-[11px] opacity-90">
                                <div className="font-bold text-slate-700 mb-0.5">{msg.replyTo.sender === 'user' ? 'You' : 'Assistant'}</div>
                                <div className="truncate text-slate-500">{msg.replyTo.text}</div>
                              </div>
                            )}
                            {/* 1. Header with Timestamp */}
                            <div
                              className="flex items-center justify-between px-4 border-b border-slate-100 transition-colors"
                            >
                              <div className="text-[10px] text-slate-400 font-medium py-2">
                                Shared on {msg.fullTimestamp || msg.time}
                              </div>
                            </div>

                            <div className="p-3">
                              {/* 2. File Information Row */}
                              <div className="flex items-center gap-3 mb-4">
                                <div
                                  onClick={() => {
                                    setSelectedDoc(msg);
                                    setDocSidebarOpen(true);
                                  }}
                                  className="flex items-center gap-3 cursor-pointer group/doc-link"
                                >
                                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0 group-hover/doc-link:bg-blue-100 transition-all">
                                    {msg.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                                      <Image size={20} />
                                    ) : (
                                      <FileText size={20} />
                                    )}
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                    <p className="text-[15px] font-bold text-slate-800 truncate group-hover/doc-link:text-blue-600 transition-colors" title={msg.fileName}>
                                      {msg.fileName}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">{msg.fileSize}</p>
                                  </div>
                                </div>
                              </div>

                              {/* 3. Approve / Reject Buttons Section */}
                              {msg.docStatus === 'pending' ? (
                                <div className="flex gap-3 mb-1">
                                  <button
                                    onClick={() => handleDocAction(msg.id, 'approved')}
                                    className="py-2 flex-1 flex items-center justify-center gap-2 border-2 bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition-all font-semibold text-sm"
                                  >
                                    <CheckCircle size={18} /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleDocAction(msg.id, 'rejected')}
                                    className="py-2 flex-1 flex items-center justify-center gap-2 border-2 bg-red-500 border-red-500 text-white hover:bg-red-600 rounded-lg transition-all font-semibold text-sm"
                                  >
                                    <XCircle size={18} /> Reject
                                  </button>
                                </div>
                              ) : (
                                /* Status Badge after clicking Approve/Reject */
                                <div className={`w-full py-2 text-center rounded-3xl font-bold text-sm mb-1 border ${msg.docStatus === 'approved'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 '
                                  : 'bg-red-50 text-red-600 border-red-200 '
                                  }`}>
                                  {msg.docStatus === 'approved' ? 'Approved' : 'Rejected'}
                                </div>
                              )}

                              {/* 4. THE CAPTION MESSAGE (The "check image is blur?" part) */}
                              {msg.text && (
                                <div className="mt-2 px-1 py-2 border-t border-slate-100">
                                  <p className="text-[14px] text-slate-700 leading-relaxed">
                                    {msg.text}
                                  </p>
                                  {/* Internal timestamp for the message part */}
                                  <div className="flex justify-end mt-1 opacity-60">
                                    <span className="text-[9px] text-slate-500">{msg.time}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {msg.sender === "bot" && (
                        <div className="flex items-center ml-2 mb-1">
                          <button onClick={() => { setReplyingTo(msg); inputRef.current?.focus(); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Reply">
                            <ReplyAll
                              size={18}
                              className="transition-transform duration-300"
                            />                          </button>
                        </div>
                      )}

                      {msg.sender === "user" && msg.type !== "notification" && (
                        <div className="w-7 h-7 bg-orange-400 rounded-full flex items-center justify-center ml-2 mt-auto mb-1 shrink-0 text-white text-[12px] font-normal">
                          {/* Uses the first letter of the actual client's name or Guest */}
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

            {/* Document Sidebar Tracker */}
            {/* Overlay */}
            {docSidebarOpen && (
              <div className="w-full bg-slate-50 flex flex-col animate-fadeIn flex-1">
                {/* Header Section (With X button to close) */}
                {/* <div className="px-6 py-1 border-b border-blue-100 flex items-center justify-between bg-white shadow-sm">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-md tracking-tight">
                    <FileText size={20} className="text-blue-600" /> Shared Documents
                  </h3>
                  <button
                    onClick={() => setDocSidebarOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition"
                  >
                    <X size={24} />
                  </button>
                </div> */}

                {/* Tabs Header */}
                <div className="shrink-0 bg-white px-6 pt-2 border-b border-slate-200">
                  <div className="max-w-6xl mx-auto flex items-end justify-between">
                    <div className="flex items-end">
                      <button
                        onClick={() => setDocTab('documents')}
                        className={`py-2 px-2 font-semibold text-sm transition-colors relative ${docTab === 'documents' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Documents
                        {docTab === 'documents' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
                      </button>
                      <button
                        onClick={() => setDocTab('depository')}
                        className={`py-2 px-2 font-semibold text-sm transition-colors relative ${docTab === 'depository' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Documents Depository
                        {docTab === 'depository' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
                      </button>
                    </div>

                    {/* REQUEST BUTTON */}
                    <button
                      onClick={() => setIsRequestModalOpen(true)}
                      className="mb-2 flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium"
                    >
                      Request Document
                    </button>

                    {/* 2. The Split-Pane Modal */}
                    {isRequestModalOpen && (
                      <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-6xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">

                          {/* Header */}
                          <div className="flex justify-between items-center px-6 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
                            <div>
                              <h2 className="text-xl font-bold text-slate-600">Request Documents</h2>
                              <p className="text-xs text-slate-500">Select groups and subgroups to request from the client.</p>
                            </div>
                            <button
                              onClick={() => setIsRequestModalOpen(false)}
                              className="pb-2 hover:text-slate-600 text-slate-400 transition"
                            >
                              <X size={22} />
                            </button>
                          </div>

                          {/* Main Content Area (Two Partitions) */}
                          <div className="flex-1 flex overflow-hidden">

                            {/* LEFT SIDE: Search & Tree Selection */}
                            <div className="w-1/2 border-r border-slate-100 flex flex-col bg-white">
                              <div className="p-4 pb-2">
                                <div className="relative mb-4">
                                  <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                                  <input
                                    type="text"
                                    placeholder="Search for group or subgroup..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-sm transition-all"
                                    value={modalSearch}
                                    onChange={(e) => setModalSearch(e.target.value)}
                                  />
                                </div>

                                <button
                                  onClick={handleSelectAll}
                                  className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1.5 rounded-lg transition"
                                >
                                  {selectedItems.length > 0 && selectedItems.length === totalSelectableItemsCount ? <Check size={18} /> : <Square size={18} />}  Select All Items
                                </button>
                              </div>

                              <div className="flex-1 overflow-y-auto px-6 py-2 no-scrollbar">
                                {filteredGroups.map(group => (
                                  <div key={group.id} className="mb-1">
                                    {/* Group Item */}
                                    <div className="flex items-center gap-2 hover:bg-slate-50 p-2 rounded-xl group transition-colors">
                                      <button onClick={() => toggleExpand(group.id)} className="text-slate-400">
                                        {expandedGroups[group.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                      </button>
                                      <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
                                        checked={group.subgroups.length > 0 && group.subgroups.every(sg => isSelected(sg.id))}
                                        onChange={() => handleToggleSelect({ id: group.id, name: group.name, type: 'group' }, group.subgroups)}
                                      />
                                      <span className="text-sm font-semibold text-slate-700">{group.name}</span>
                                    </div>

                                    {/* Subgroup Items (Conditional Expand) */}
                                    {expandedGroups[group.id] && (
                                      <div className="ml-9 mt-1 space-y-1">
                                        {group.subgroups.slice().sort((a, b) => a.name.localeCompare(b.name)).map(sub => (
                                          <div key={sub.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors group/sub">
                                            <div className="flex items-center gap-3">
                                              <input
                                                type="checkbox"
                                                className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
                                                checked={isSelected(sub.id)}
                                                onChange={() => handleToggleSelect({ id: sub.id, name: sub.name, type: 'subgroup' })}
                                              />
                                              <span className="text-sm text-slate-600">{sub.name}</span>{sub.explanation && (
                                                <div className="relative flex items-center ">
                                                  <CircleAlert size={16} className="text-[#8B4513] cursor-pointer peer" />
                                                  <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden peer-hover:block w-48 bg-amber-50 text-[#8B4513] text-xs p-2 rounded-lg shadow-md z-10 border border-amber-200">
                                                    {sub.explanation}
                                                  </div>
                                                </div>
                                              )}
                                            </div>

                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* RIGHT SIDE: Selected Display */}
                            <div className="w-1/2 bg-slate-50 flex flex-col">
                              <div className="py-2 px-3 pb-3 shrink-0 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-600 text-xs uppercase tracking-widest">
                                  Selected Items ({selectedItems.length})
                                </h3>
                                {selectedItems.length > 0 && (
                                  <button
                                    onClick={() => setSelectedItems([])}
                                    className="text-xs text-red-500 font-bold hover:underline"
                                  >
                                    Clear All
                                  </button>
                                )}
                              </div>

                              <div className="flex-1 overflow-y-auto px-6 no-scrollbar space-y-2">
                                {selectedItems.length === 0 ? (
                                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-10">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                      <FolderPlus size={24} className="opacity-20" />
                                    </div>
                                    <p className="text-sm font-normal text-slate-300">Select documents on the left to include them in your request.</p>
                                  </div>
                                ) : (
                                  selectedItems.slice().sort((a, b) => a.name.localeCompare(b.name)).map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between bg-white border border-slate-200 px-4 py-1 rounded-lg shadow-sm animate-in slide-in-from-right-4 duration-200"
                                    >
                                      <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="text-sm font-semibold text-slate-700 truncate">
                                          {item.name}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Footer Logic */}
                              <div className="p-3 bg-white border-t border-slate-100 shrink-0 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Type custom document name..."
                                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={customDocInput}
                                    onChange={(e) => setCustomDocInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomDoc()}
                                  />
                                  <button
                                    onClick={handleAddCustomDoc}
                                    disabled={!customDocInput.trim()}
                                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                  >
                                    <ArrowRight size={16} />
                                  </button>
                                </div>
                                <button
                                  onClick={handleRequestDocuments}
                                  disabled={selectedItems.length === 0}
                                  className="w-full bg-blue-600 text-white py-1 rounded-lg font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                >
                                  <Send size={16} /> Send Document Request
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    )}





                  </div>
                </div>





                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-6 relative scrollbar-hide">
                  <div className="max-w-6xl mx-auto space-y-4">
                    {displayDocs.length === 0 ? (
                      <p className="text-base text-slate-400 text-center mt-20">No documents in this view.</p>
                    ) : (
                      <>
                        {docTab === 'documents' && (
                          <div className="flex items-center  justify-between bg-slate-100 rounded-xl p-2 mb-4 border border-slate-200 shadow-sm">
                            <div
                              className="flex items-center gap-3 cursor-pointer group/selectall"
                              onClick={() => {
                                if (selectedDocIds.length === displayDocs.length) setSelectedDocIds([]);
                                else setSelectedDocIds(displayDocs.map(d => d.id));
                              }}
                            >
                              <button className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedDocIds.length === displayDocs.length && displayDocs.length > 0 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-transparent group-hover/selectall:border-blue-400'}`}>
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
                        {displayDocs.map((doc) => (
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
                                    <span className="text-xs font-medium text-slate-500">{doc.fileSize}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                              {/* 2. REVERT BUTTON (Appears only after selection) */}
                              {doc.docStatus !== 'requested' && doc.docStatus !== 'pending' && (
                                <button
                                  onClick={() => handleDocAction(doc.id, doc.isRequest ? 'requested' : 'pending')}
                                  className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                  title="Revert Status"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              )}
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
                                    <button
                                      onClick={() => handleDocAction(doc.id, 'not_applicable')}
                                      className="px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all border-2 bg-red-500 border-red-500 text-white hover:bg-red-600 rounded-lg whitespace-nowrap"
                                    >
                                      Not Applicable
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


                              {/* PAPERCLIP UPLOAD (Fulfills Request) */}
                              {doc.docStatus === 'requested' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // CRITICAL: Prevents row click from canceling dialog
                                    setActiveRequestId(doc.id);
                                    if (fileInputRef.current) {
                                      fileInputRef.current.click();
                                    }
                                  }}
                                  className="p-1 text-blue-600 hover:text-blue-700 transition-all flex items-center justify-center"
                                  title="Upload Document"
                                >
                                  <span className="inline-block h-9 border-l-1 border border-blue-500 mr-3"></span>
                                  <Paperclip size={20} className="" />
                                </button>
                              )}

                              {/* 3. DELETE BUTTON (Hidden during request or approved phase) */}
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
                        ))
                        }
                      </>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Quick Replies */}
          {!taskIconOn && !docSidebarOpen && messages.filter(m => m.type === 'text').length <= 3 && (
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
          {!taskIconOn && !docSidebarOpen && (
            <div className="bg-white border-t border-slate-200 px-3 py-3 shrink-0 z-10">
              {replyingTo && (
                <div className="mx-2 mb-2 p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between border-l-4 border-l-blue-500 animate-fadeIn">
                  <div className="flex flex-col overflow-hidden pr-4">
                    <span className="text-[10px] font-bold text-blue-600 mb-0.5">Replying to {replyingTo.sender === 'user' ? 'yourself' : 'Assistant'}</span>
                    <span className="text-xs text-slate-600 truncate">{replyingTo.type === 'document' ? replyingTo.fileName : replyingTo.text}</span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600 p-1 shrink-0 bg-white rounded-full shadow-sm">
                    <X size={14} />
                  </button>
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
                      <button
                        onClick={() => setPendingFiles(prev => prev.filter((_, i) => i !== index))}
                        className="text-blue-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <div className="flex items-center gap-0.5">
                  <button className="p-2 pb-4 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Smile size={20} /></button>
                  <button onClick={() => fileInputRef.current?.click()} className={`p-2 pb-4 flex items-center rounded-lg transition-colors ${pendingFiles.length > 0 ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                    <Paperclip size={20} /></button>
                </div>
                <div className="flex-1 relative">
                  <textarea ref={inputRef} rows={1} placeholder={pendingFiles.length > 0 ? "Add a caption..." : "Type a message..."} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} className="w-full resize-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" style={{ maxHeight: "120px" }} />
                </div>
                {(input.trim() || pendingFiles.length > 0) && (
                  <button onClick={handleSend} className="p-2.5 mb-2 items-center bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md active:scale-95"><Send size={18} /></button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Global File Input for Ref Access */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 60px; } }
        .animate-slideDown { animation: slideDown 0.2s ease-out; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- ENHANCED PREVIEW POPUP (MODAL) --- */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#f8fafc] rounded-2xl w-full max-w-7xl h-[90vh] shadow-2xl overflow-hidden flex border border-slate-200">

            {/* LEFT SIDEBAR: Files List */}
            <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-semibold text-[14px] text-slate-700 flex items-center">
                  Files<span className="text-[12px]">({messages.filter(m => m.type === 'document' && m.fileUrl).length})</span></h3>
                <button
                  onClick={() => {
                    setActiveRequestId(null); // Clear context to add as new
                    fileInputRef.current?.click();
                  }}
                  className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  title="Upload New Document"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 hide-scrollbar">
                {messages.filter(m => m.type === 'document' && m.fileUrl).map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-2 rounded-2xl transition-all cursor-pointer group flex items-center gap-3 border ${selectedDoc.id === doc.id
                      ? 'border-transparent hover:bg-slate-200'
                      : 'border-transparent hover:bg-slate-50'
                      }`}
                  >
                    <div className={`flex items-center justify-center p-2 rounded-xl shrink-0 transition-colors ${selectedDoc.id === doc.id ? 'text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      {doc.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                        <Image size={20} />
                      ) : doc.fileName.toLowerCase().endsWith('.pdf') ? (
                        <PdfIcon size={20} />
                      ) : (
                        <FileText size={20} />
                      )}
                    </div>
                    <div className="overflow-hidden flex flex-col justify-center">
                      <p className={`text-[13px] font-semibold truncate ${selectedDoc.id === doc.id ? 'text-blue-600' : 'text-slate-700'}`}>{doc.fileName}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{doc.fileSize}</p>
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
                    ) : selectedDoc.fileName.toLowerCase().endsWith('.pdf') ? (
                      <PdfIcon size={24} />
                    ) : (
                      <FileText size={24} className="text-slate-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-lg leading-tight truncate max-w-md">{selectedDoc.fileName}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400 font-medium">{selectedDoc.fileSize}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-xs text-slate-400 font-medium uppercase">{selectedDoc.fileName.split('.').pop()}</span>
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
      )}
    </div>
  );
};

export default ChatBot;