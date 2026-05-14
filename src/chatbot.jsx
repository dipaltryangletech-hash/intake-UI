import React, { useState, useRef, useEffect } from "react";
import { toast } from 'react-toastify';
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
  ArrowRight,
  Info,
  FileX,
  ReplyAll,
  RotateCcw,
  Paperclip,
  Image,
  FileUp,
  SendHorizonalIcon,
  SendHorizontalIcon
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import ExplanationTooltip from "./components/ExplanationTooltip";
import TasksView from './TasksView';
import DocumentsView from './DocumentsView';
import ChatView from './ChatView';
import DocumentPreviewModal from './DocumentPreviewModal';
import RequestDocumentsModal from './RequestDocumentsModal';

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

// --- INDEXED DB STORAGE UTILITY ---
const dbStorage = {
  dbName: "IntakeChatDocs",
  storeName: "docs",
  db: null,

  async init() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  },

  async save(id, data) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);
      store.put(data, id);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  },

  async get(id) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readonly");
      const store = tx.objectStore(this.storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  },

  async delete(id) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readwrite");
      const store = tx.objectStore(this.storeName);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  },

  async clear() {
    const db = await this.init();
    const tx = db.transaction(this.storeName, "readwrite");
    tx.objectStore(this.storeName).clear();
  }
};

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

const handleClearStorage = (storageKey) => {
  if (window.confirm("Are you sure you want to clear the chat history for this context? This will free up storage space but cannot be undone.")) {
    localStorage.removeItem(storageKey);
    dbStorage.clear().catch(console.error);
    window.location.reload();
  }
};



const ChatBot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingFiles, setPendingFiles] = useState([]);
  // 1. Extract Client Data & Assignment ID securely
  const clientName = location.state?.name || location.state?.client || "Guest";
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [popupMessages, setPopupMessages] = useState([]);
  const [tempDocsMap, setTempDocsMap] = useState({}); // { rootDocId: [tempDocs] }
  const [rootDocId, setRootDocId] = useState(null);
  const assignmentId = location.state?.assignmentId || "general";
  const clientId = location.state?.clientId || "anonymous";

  // 2. Create a UNIQUE Storage Key per Client or Assignment
  // If we have an assignment, use it. Otherwise, use the clientId to keep client chats separate.
  const contextId = assignmentId !== "general" ? assignmentId : `client_${clientId}`;
  const storageKey = `chatbot_messages_${contextId.replace('#', '')}`;

  // 3. Initialize State from LocalStorage using the UNIQUE Key
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  // Sync messages from LocalStorage & Hydrate from IndexedDB
  useEffect(() => {
    const loadMessages = async () => {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        setMessages(INITIAL_MESSAGES);
        return;
      }

      try {
        const parsed = JSON.parse(saved);
        // Hydrate documents from IndexedDB
        const hydrated = await Promise.all(parsed.map(async (msg) => {
          if (msg.type === "document" && msg.fileUrl === "(IDB_LINK)") {
            const blob = await dbStorage.get(msg.id);
            return { ...msg, fileUrl: blob || null };
          }
          return msg;
        }));
        setMessages(hydrated);
      } catch (e) {
        console.error("Failed to load messages:", e);
        setMessages(INITIAL_MESSAGES);
      }
    };

    loadMessages();
  }, [storageKey]);

  // Sync popupMessages with selectedDoc and manage temporary additions per root document
  useEffect(() => {
    if (!selectedDoc) {
      setPopupMessages([]);
      setRootDocId(null);
      return;
    }

    const realDoc = messages.find(m => m.id === selectedDoc.id);
    if (realDoc) {
      // We clicked a real document, set it as the new root
      setRootDocId(realDoc.id);
      const extras = tempDocsMap[realDoc.id] || [];
      setPopupMessages([realDoc, ...extras]);
    } else {
      // We are navigating within temporary files or switched selection
      // Ensure the current selection is reflected in popupMessages if it was just added
      setPopupMessages(prev => {
        if (prev.find(m => m.id === selectedDoc.id)) return prev;
        return [...prev, selectedDoc];
      });
    }
  }, [selectedDoc, messages, tempDocsMap]);

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
    try {
      localStorage.setItem(tasksStorageKey, JSON.stringify(tasks));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn("Tasks storage quota exceeded.");
      }
    }
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
    if (task.completed) return; // Prevent editing completed tasks
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

  // Remove body scrollbar on mount, restore on unmount
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

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
  // Now with IndexedDB fallback for large files
  useEffect(() => {
    const saveMessages = async () => {
      try {
        // 1. Prepare messages for LocalStorage (extract heavy blobs to IDB)
        const strippedMessages = await Promise.all(messages.map(async (msg) => {
          if (msg.type === "document" && msg.fileUrl && msg.fileUrl.length > 500) {
            // Save to IDB
            await dbStorage.save(msg.id, msg.fileUrl);
            // Return stripped version for LocalStorage
            return { ...msg, fileUrl: "(IDB_LINK)" };
          }
          return msg;
        }));

        localStorage.setItem(storageKey, JSON.stringify(strippedMessages));
      } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
          console.warn("LocalStorage quota exceeded.");
          if (!window._storageToastShown) {
            toast.error("Storage limit reached! Please clear your history.", {
              position: "top-center",
              autoClose: 5000
            });
            window._storageToastShown = true;
          }
        }
      }
    };

    if (messages.length > 0) {
      saveMessages();
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
  const activeDocs = documentMessages.filter(d => !d.inDepository).reverse();
  const depositoryDocs = documentMessages.filter(d => d.inDepository).reverse();
  const displayDocs = docTab === "documents" ? activeDocs : depositoryDocs;

  // Contextual Filtered Lists
  const filteredActiveTasks = activeTasks.filter(t =>
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCompletedTasks = completedTasks.filter(t =>
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDisplayDocs = displayDocs.filter(d =>
    d.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      setPopupMessages(prev => prev.filter(m => m.id !== id));
      setTempDocsMap(prev => {
        const newMap = { ...prev };
        Object.keys(newMap).forEach(key => {
          newMap[key] = newMap[key].filter(m => m.id !== id);
        });
        return newMap;
      });
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

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (activeRequestId) {
      // Handle document request upload (persists to messages)
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newDoc = {
            id: activeRequestId,
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

          setMessages(prev => prev.map(m => m.id === activeRequestId ? newDoc : m));
          if (selectedDoc && selectedDoc.id === activeRequestId) {
            setSelectedDoc(newDoc);
          }
        };
        reader.readAsDataURL(file);
      });
      setActiveRequestId(null);
    } else if (selectedDoc) {
      // Handle popup plus icon (temporary for popup only, linked to current root doc)
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newDoc = {
            id: Date.now() + Math.random(),
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

          if (rootDocId) {
            setTempDocsMap(prev => ({
              ...prev,
              [rootDocId]: [...(prev[rootDocId] || []), newDoc]
            }));
          }
          setSelectedDoc(newDoc);
        };
        reader.readAsDataURL(file);
      });
    } else {
      // Chat context: add to pending
      setPendingFiles(prev => [...prev, ...files]);
    }
    e.target.value = '';
  };

  const filteredMessages = searchQuery
    ? messages.filter((m) =>
      (m.type === "text" && m.text?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.type === "document" && m.fileName?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
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

  const handleExpandAll = () => {
    const allExpanded = groups.length > 0 && groups.every(g => expandedGroups[g.id]);
    if (allExpanded) {
      setExpandedGroups({});
    } else {
      const newExpanded = {};
      groups.forEach(g => {
        newExpanded[g.id] = true;
      });
      setExpandedGroups(newExpanded);
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
    <div className="flex flex-col w-full h-[calc(100vh-48px)] bg-white font-poppins text-slate-900 flex flex-col overflow-hidden ">
      <main className="flex-1 flex flex-col w-full min-h-0">

        {/* Removed wrapper padding, rounded corners, shadows, and max-widths */}
        <div className="flex-1 bg-white flex flex-col relative min-h-0">

          {/* Chat Header */}
          <div className=" sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2 flex items-center justify-between shrink-0 z-50">
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
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-medium px-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full border border-[#cad4e4] shadow-sm">
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
                className={`relative flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors  ${taskIconOn ? 'bg-[#1c90bb] hover:bg-[#1c90bb]' : 'hover:bg-white/10'
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
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-medium px-1 min-w-[19px] h-[18px] flex items-center justify-center rounded-full border border-[#cad4e4] shadow-sm">
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
                className={`relative flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors ${docSidebarOpen ? 'bg-amber-600 hover:bg-amber-600' : 'hover:bg-white/10'
                  }`}
              >
                <FolderPlus size={18} className={docSidebarOpen ? "text-white" : "text-white/80"} />
                <span className={docSidebarOpen ? "text-white text-[12px] font-medium" : "text-white/80 text-[12px] font-medium"}>
                  Documents
                </span>
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-medium px-1 min-w-[19px] h-[18px] flex items-center justify-center rounded-full border border-[#cad4e4] shadow-sm">
                    {pendingCount}
                  </span>
                )}
              </button>
              <span className="inline-block h-8 border-l-1 border border-white/60 mx-3"></span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-blue-500" size={16} />
                <input
                  type="text"
                  placeholder={
                    taskIconOn ? "Search tasks..." :
                      docSidebarOpen ? "Search documents..." :
                        "Search in conversation..."
                  }
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
              <TasksView
                taskTab={taskTab}
                setTaskTab={setTaskTab}
                activeTasks={activeTasks}
                completedTasks={completedTasks}
                filteredActiveTasks={filteredActiveTasks}
                filteredCompletedTasks={filteredCompletedTasks}
                newTaskInput={newTaskInput}
                setNewTaskInput={setNewTaskInput}
                handleAddTask={handleAddTask}
                handleToggleTask={handleToggleTask}
                handleDeleteTask={handleDeleteTask}
                editingTaskId={editingTaskId}
                editTaskText={editTaskText}
                setEditTaskText={setEditTaskText}
                saveEditTask={saveEditTask}
                startEditTask={startEditTask}
              />
            )}

            {/* Chat Area */}
            {!taskIconOn && !docSidebarOpen && (
              <ChatView
                messages={messages}
                filteredMessages={filteredMessages}
                messagesEndRef={messagesEndRef}
                setSelectedDoc={setSelectedDoc}
                setDocSidebarOpen={setDocSidebarOpen}
                handleDocAction={handleDocAction}
                handleToggleSelection={handleToggleSelection}
                selectedDocIds={selectedDocIds}
                isTyping={isTyping}
                clientName={clientName}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                handleKeyDown={handleKeyDown}
                pendingFiles={pendingFiles}
                setPendingFiles={setPendingFiles}
                fileInputRef={fileInputRef}
                inputRef={inputRef}
                QUICK_REPLIES={QUICK_REPLIES}
                handleQuickReply={handleQuickReply}
                PdfIcon={PdfIcon}
              />
            )}

            {/* Document Sidebar Tracker */}
            {docSidebarOpen && (
              <DocumentsView
                docTab={docTab}
                setDocTab={setDocTab}
                activeDocs={activeDocs}
                depositoryDocs={depositoryDocs}
                displayDocs={displayDocs}
                filteredDisplayDocs={filteredDisplayDocs}
                selectedDocIds={selectedDocIds}
                setSelectedDocIds={setSelectedDocIds}
                setSelectedDoc={setSelectedDoc}
                setIsRequestModalOpen={setIsRequestModalOpen}
                handleDocAction={handleDocAction}
                handleDeleteDoc={handleDeleteDoc}
                setDocSidebarOpen={setDocSidebarOpen}
                fileInputRef={fileInputRef}
                setActiveRequestId={setActiveRequestId}
                setMessages={setMessages}
              />
            )}
          </div>
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
      <DocumentPreviewModal
        selectedDoc={selectedDoc}
        setSelectedDoc={setSelectedDoc}
        messages={messages}
        handleDeleteDoc={handleDeleteDoc}
        fileInputRef={fileInputRef}
        setActiveRequestId={setActiveRequestId}
        previewBlobUrl={previewBlobUrl}
        PdfIcon={PdfIcon}
      />

      {/* --- REQUEST DOCUMENTS MODAL --- */}
      <RequestDocumentsModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        modalSearch={modalSearch}
        setModalSearch={setModalSearch}
        groups={groups}
        selectedItems={selectedItems}
        handleToggleSelect={handleToggleSelect}
        customDocInput={customDocInput}
        setCustomDocInput={setCustomDocInput}
        handleAddCustomDoc={handleAddCustomDoc}
        handleRemoveItem={handleRemoveItem}
        handleRequestDocuments={handleRequestDocuments}
        expandedGroups={expandedGroups}
        toggleExpand={toggleExpand}
        isSelected={isSelected}
      />
    </div>
  );
};

export default ChatBot;