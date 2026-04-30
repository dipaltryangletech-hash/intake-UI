import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Edit2, Briefcase, UserPlus, ClipboardList, CheckCircle2, Check, X } from 'lucide-react';

const UserDetails = ({ user, onBack, onUpdate }) => {
    const [isActive, setIsActive] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // लोकल फॉर्म स्टेट
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || ''
    });

    // नाम से Initials निकालने के लिए फंक्शन (जैसे Alex Rivera -> AR)
    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name[0].toUpperCase();
    };

    // जब पैरेंट से 'user' डेटा बदले, तो लोकल स्टेट को सिंक करें
    useEffect(() => {
        setFormData({
            name: user?.name || '',
            phone: user?.phone || ''
        });
    }, [user]);

    const handleUpdate = () => {
        // नया डेटा तैयार करना जिसमें नए Initials भी शामिल हैं
        const updatedData = {
            ...formData,
            initials: getInitials(formData.name)
        };

        // पैरेंट के handleUpdateUser फंक्शन को कॉल करना
        onUpdate(user.id, updatedData);
        setIsEditing(false);
    };

    const permissions = [
        { id: 'client', title: 'Client Creation', desc: 'Add and manage new institutional clients', icon: <UserPlus size={18} className="text-blue-600" />, checked: user?.rights?.includes("Client Creation") },
        { id: 'user', title: 'User Creation', desc: 'Create and manage internal user accounts', icon: <UserPlus size={18} className="text-blue-600" />, checked: user?.rights?.includes("User Creation") },
        { id: 'checklist', title: 'Master Checklist Creation', desc: 'Set up standard compliance checklists', icon: <ClipboardList size={18} className="text-blue-600" />, checked: user?.rights?.includes("Master Checklist Creation") },
        { id: 'assignment', title: 'Assignment Creation', desc: 'Create Assignment and assign tasks', icon: <CheckCircle2 size={18} className="text-blue-600" />, checked: user?.rights?.includes("Assignment Creation") },
    ];

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-[#f8fafc] font-poppins text-slate-900">
            {/* HEADER */}
            <header className="h-12 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-1 text-sm">
                    <button onClick={onBack} className="hover:bg-slate-100 p-1 rounded-full transition-colors">
                        <ChevronLeft size={20} className='-ml-1 rounded-full' />
                    </button>
                    <span onClick={onBack} className="text-sm font-medium cursor-pointer text-slate-500 hover:text-slate-800 transition-colors mr-4">
                        Users
                    </span>
                    <span className="text-slate-300">|</span>
                    <h1 className="text-sm font-medium text-slate-800 ml-4">{user?.name} Details</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Quick Search..." className="bg-slate-100 rounded-lg py-2 pl-10 pr-4 text-sm w-50 outline-none" />
                    </div>
                </div>
            </header>

            <main className="p-6 space-y-3 w-full">
                {/* Profile Summary Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start justify-between">
                    <div className="flex gap-6">
                        <div className="relative">
                            {/* अवतार अब सीधे user.initials का उपयोग करेगा जो अपडेट हो चुके हैं */}
                            <div className={`w-20 h-20 rounded-xl flex items-center justify-center ${user?.color || 'bg-slate-100'}`}>
                                <span className="text-2xl font-bold">{user?.initials}</span>
                            </div>
                            <div className={`absolute bottom-6 -right-0.5 w-4 h-4 border-2 border-white rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
                                <p className="text-slate-500 text-[12px] font-medium">Internal System User</p>
                            </div>
                            <div className="flex gap-10">
                                <InfoItem label="Email Address" value={user?.email} />
                                <InfoItem label="User Identifier" value={`USR-00000${user?.id}`} />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                        <button onClick={() => setIsActive(!isActive)} className={`w-11 h-6 rounded-full transition-colors relative ${isActive ? 'bg-green-500' : 'bg-slate-300'}`}>
                            <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${isActive ? 'right-1' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Basic Information</h3>
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px] uppercase">
                                        <Edit2 size={12} /> Edit
                                    </button>
                                ) : (
                                    <div className="flex gap-3">
                                        <button onClick={() => setIsEditing(false)} className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">CANCEL</button>
                                        <button onClick={handleUpdate} className="text-blue-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                                            <Check size={14} /> UPDATE
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                    {isEditing ? (
                                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-2 py-1.5 bg-white border border-blue-200 rounded-lg text-sm font-bold text-slate-800 outline-none" />
                                    ) : (
                                        <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Number</p>
                                    {isEditing ? (
                                        <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-2 py-1.5 bg-white border border-blue-200 rounded-lg text-sm font-bold text-slate-800 outline-none" />
                                    ) : (
                                        <p className="text-sm font-bold text-slate-800">{user?.phone || 'N/A'}</p>
                                    )}
                                </div>
                                <div className="flex justify-between border-t border-slate-50 pt-2">
                                    <StaticInfo label="Joined System" value="Oct 12, 2023" />
                                    <StaticInfo label="Last Login" value={user?.lastLogin} alignRight />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-7">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase">Role & Permissions Management</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                {permissions.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">{p.icon}</div>
                                            <div><p className="text-sm font-bold text-slate-800">{p.title}</p><p className="text-xs text-slate-400">{p.desc}</p></div>
                                        </div>
                                        <input type="checkbox" defaultChecked={p.checked} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const InfoItem = ({ label, value }) => (<div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p><p className="text-sm font-bold text-slate-700">{value || 'N/A'}</p></div>);
const StaticInfo = ({ label, value, alignRight = false }) => (<div className={alignRight ? 'text-right' : ''}><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p><p className="text-sm font-bold text-slate-800">{value || 'N/A'}</p></div>);

export default UserDetails;