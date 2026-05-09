import React, { useState, useRef, useEffect } from 'react';
import {
    User,
    Mail,
    Phone,
    Lock,
    Building2,
    Eye,
    EyeOff,
    Camera,
    CheckCircle2,
    Save,
    KeyRound,
    PencilLine,
    Image as ImageIcon
} from 'lucide-react';
import { useAuth } from './Context/Auth/AuthContext';
import { toast } from 'react-toastify';

// MOVED OUTSIDE to prevent re-mounting on every keystroke
const EditableInput = ({ name, value, icon: Icon, placeholder, onChange, onDoubleClick, isEditing, type = "text", disabled = false, className = "" }) => {
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            // Move cursor to end of text
            const length = inputRef.current?.value.length || 0;
            inputRef.current?.setSelectionRange(length, length);
        }
    }, [isEditing]);

    return (
        <div className={`relative group ${className}`} onDoubleClick={() => !disabled && onDoubleClick(name)}>
            <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? 'text-blue-600' : 'text-slate-300'}`} size={16} />
            <input
                ref={inputRef}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                readOnly={!isEditing && !disabled}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full border rounded-lg pl-10 pr-10 py-2.5 text-xs outline-none transition-all font-medium
                    ${disabled ? 'bg-slate-100/50 border-slate-200 text-slate-500 cursor-not-allowed' :
                        isEditing ? 'bg-white border-blue-500 ring-4 ring-blue-500/10 shadow-md' :
                            'bg-slate-50/30 border-slate-200 text-slate-700 cursor-default hover:bg-slate-50'}`}
            />
            {!isEditing && !disabled && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <PencilLine size={12} className="text-slate-400" />
                </div>
            )}
        </div>
    );
};

const ProfilePage = () => {
    const { user } = useAuth();
    const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
    const [editingFields, setEditingFields] = useState({});
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [companyLogo, setCompanyLogo] = useState(null);
    const fileInputRef = useRef(null);
    const logoInputRef = useRef(null);

    // Initial state setup
    const [profileData, setProfileData] = useState({
        name: user?.name || "Demo",
        company: "Company",
        email: user?.email || "myoffice.demo@gmail.com",
        phone: "9327092300",
        lockAfterApproval: true
    });

    // Load data from localStorage on component mount
    useEffect(() => {
        const savedData = localStorage.getItem(`profile_${user?.email}`);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setProfileData(parsed.details || profileData);
                setProfilePhoto(parsed.photo || null);
                setCompanyLogo(parsed.logo || null);
            } catch (e) {
                console.error("Error loading profile data", e);
            }
        }
    }, [user?.email]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDoubleClick = (fieldName) => {
        if (fieldName === 'email') return;
        setEditingFields(prev => ({ ...prev, [fieldName]: true }));
    };

    const handleSave = () => {
        try {
            const dataToSave = {
                details: profileData,
                photo: profilePhoto,
                logo: companyLogo,
                updatedAt: new Date().toISOString()
            };

            // Try saving to localStorage
            localStorage.setItem(`profile_${user?.email}`, JSON.stringify(dataToSave));

            // Reset editing states
            setEditingFields({});

            // Show success notification
            toast.success("Your profile saved successfully!");
        } catch (error) {
            console.error("Save error:", error);
            if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                toast.error("Profile image is too large! Please use a smaller photo.");
            } else {
                toast.error("An error occurred while saving. Please try again.");
            }
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePhotoUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'profile') setProfilePhoto(reader.result);
                else setCompanyLogo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 font-poppins">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Profile Settings</h1>
                        <p className="text-xs text-slate-500 mt-1">Manage your personal information and account security</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block">Double click fields to edit</p>
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95"
                        >
                            <Save size={14} /> Save Changes
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Side: Photo & Quick Stats */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center space-y-6">
                            <div className="relative inline-block group">
                                <div className="w-32 h-32 rounded-full border-4 border-slate-50 shadow-inner overflow-hidden bg-slate-100 flex items-center justify-center">
                                    {profilePhoto ? (
                                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-slate-300" />
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute bottom-1 right-1 bg-blue-600 p-2.5 rounded-full text-white shadow-lg hover:bg-blue-700 transition-all active:scale-90"
                                >
                                    <Camera size={16} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => handlePhotoUpload(e, 'profile')}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{profileData.name}</h2>
                                <p className="text-xs font-medium text-blue-600 uppercase tracking-widest mt-1">{user?.role}</p>
                            </div>
                        </div>

                        {/* Company Logo Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-6">
                            <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Company Logo</h3>
                            <div
                                className="w-full h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                                onClick={() => logoInputRef.current.click()}
                            >
                                {companyLogo ? (
                                    <img src={companyLogo} alt="Logo" className="max-h-full p-4 object-contain" />
                                ) : (
                                    <>
                                        <ImageIcon size={24} className="text-slate-300 group-hover:text-blue-400" />
                                        <span className="text-[10px] text-slate-400 font-bold group-hover:text-blue-500">UPLOAD LOGO</span>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={logoInputRef}
                                onChange={(e) => handlePhotoUpload(e, 'logo')}
                                className="hidden"
                                accept="image/*"
                            />
                            <p className="text-[10px] text-slate-400 text-center leading-relaxed">Recommended size: 200px x 48px<br />Format: PNG with transparency</p>
                        </div>
                    </div>

                    {/* Right Side: Detailed Forms */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-10">

                            {/* Personal Information */}
                            <section className="space-y-6">
                                <h2 className="text-[13px] font-bold text-slate-800">Personal Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <EditableInput
                                        className="md:col-span-2"
                                        name="name"
                                        value={profileData.name}
                                        icon={User}
                                        placeholder="Name"
                                        onChange={handleChange}
                                        onDoubleClick={handleDoubleClick}
                                        isEditing={editingFields['name']}
                                    />
                                    <EditableInput
                                        name="email"
                                        value={profileData.email}
                                        icon={Mail}
                                        placeholder="Email"
                                        disabled={true}
                                    />
                                    <EditableInput
                                        name="phone"
                                        value={profileData.phone}
                                        icon={Phone}
                                        placeholder="Phone"
                                        onChange={handleChange}
                                        onDoubleClick={handleDoubleClick}
                                        isEditing={editingFields['phone']}
                                    />
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Update Email */}
                            <section className="space-y-6">
                                <h2 className="text-[13px] font-bold text-slate-800">Change Account Email</h2>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="relative group flex-1">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                                        <input
                                            type="email"
                                            placeholder="New Email Address"
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold px-6 py-2.5 rounded-lg transition-all shadow-sm"
                                    >
                                        Update Email
                                    </button>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Update Password */}
                            <section className="space-y-6">
                                <h2 className="text-[13px] font-bold text-slate-800">Account Security</h2>
                                <div className="space-y-4">
                                    <div className="relative group max-w-md">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                                        <input
                                            type={showPassword.old ? "text" : "password"}
                                            placeholder="Current Password"
                                            className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-10 pr-10 py-2.5 text-xs outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium"
                                        />
                                        <button
                                            onClick={() => togglePasswordVisibility('old')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                        >
                                            {showPassword.old ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                                            <input
                                                type={showPassword.new ? "text" : "password"}
                                                placeholder="New Password"
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-10 pr-10 py-2.5 text-xs outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium"
                                            />
                                            <button
                                                onClick={() => togglePasswordVisibility('new')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                            >
                                                {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
                                            <input
                                                type={showPassword.confirm ? "text" : "password"}
                                                placeholder="Confirm New Password"
                                                className="w-full bg-slate-50/50 border border-slate-200 rounded-lg pl-10 pr-10 py-2.5 text-xs outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-medium"
                                            />
                                            <button
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                            >
                                                {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-blue-200 active:scale-95"
                                >
                                    <KeyRound size={14} /> Update Security Settings
                                </button>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Auto-Lock Settings */}
                            <section className="space-y-6">
                                <h2 className="text-[13px] font-bold text-slate-800">Advanced Workflow</h2>
                                <div className="flex items-center gap-3 group cursor-pointer w-fit">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            name="lockAfterApproval"
                                            checked={profileData.lockAfterApproval}
                                            onChange={handleChange}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-200 bg-slate-50 transition-all checked:border-blue-600 checked:bg-blue-600 focus:outline-none"
                                        />
                                        <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">Auto-lock documents after approval</span>
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={handleSave}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-blue-200 active:scale-95"
                                    >
                                        <Save size={14} /> Save Changes
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;