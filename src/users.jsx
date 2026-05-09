import React, { useState, useEffect, useRef } from 'react';
import Pagination from './pagination';
import UserPopup from "./userpopup";
import UserDetails from "./userdetails";
import { useAuth } from "./Context/Auth/AuthContext";
import { Search, UserPlus, ChevronDown, Check, MoreVertical, Eye, SquarePen, Trash } from 'lucide-react';

const USER_RIGHTS_OPTIONS = [
  "Client Creation",
  "User Creation",
  "Master Checklist Creation",
  "Assignment Creation"
];

const Users = () => {
  const [viewMode, setViewMode] = useState('list');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const canManageUsers = isAdmin || currentUser?.rights?.includes("User Creation");
  const totalPages = 3;

  const [searchQuery, setSearchQuery] = useState("");

  // 1. Changed to Array for multiple selection
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('my_app_users');
    if (savedUsers) {
      return JSON.parse(savedUsers);
    } else {
      return [
        { id: 1, name: 'Alex Rivera', initials: 'AR', email: 'a.rivera@doccollect.com', phone: '+1 (555) 123-4567', status: 'Active', lastLogin: '23 Mar, 2026', color: 'bg-slate-200', rights: ["Client Creation", "User Creation"] },
        { id: 2, name: 'Maria Lopez', initials: 'ML', email: 'm.lopez@partner.io', phone: '+1 (555) 987-6543', status: 'Invited', lastLogin: '—', color: 'bg-orange-100 text-orange-700', rights: [] },
        { id: 3, name: 'John doe', initials: 'JD', email: 'J.doe@coder.io', phone: '+1 (555) 568-9754', status: 'Inactive', lastLogin: '12 feb,2026', color: 'bg-slate-200', rights: ["Assignment Creation"] },
      ];
    }
  });

  useEffect(() => {
    localStorage.setItem('my_app_users', JSON.stringify(users));
  }, [users]);

  // 2. Updated Filter Logic for multiple roles
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Matches if user has AT LEAST ONE of the selected roles
    const matchesRole = selectedRoles.length > 0
      ? user.rights && user.rights.some(role => selectedRoles.includes(role))
      : true;

    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Logic to toggle roles in the array
  const toggleRole = (role) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleView = (user) => { setSelectedUser(user); setViewMode('details'); };
  const handleEdit = (user) => { setEditData(user); setIsPopupOpen(true); };
  const handleCreate = () => { setEditData(null); setIsPopupOpen(true); };

  const handleUpdateUser = (id, updatedData) => {
    const newUsers = users.map(u => u.id === id ? { ...u, ...updatedData } : u);
    setUsers(newUsers);

    setSelectedUser(prev => ({ ...prev, ...updatedData }));
  };

  const handleSaveUser = (formData) => {
    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';
    if (editData) {
      setUsers(users.map(u => u.id === editData.id ? { ...u, ...formData, initials: getInitials(formData.name) } : u));
    } else {
      const newUser = { id: Date.now(), ...formData, initials: getInitials(formData.name), status: 'Active', lastLogin: 'Just now', color: 'bg-blue-100 text-blue-700' };
      setUsers([newUser, ...users]);
    }
    setIsPopupOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  if (viewMode === 'details') {
    return (
      <UserDetails
        user={selectedUser}
        onBack={() => setViewMode('list')}
        onUpdate={handleUpdateUser}
      />
    );
  }

  return (
    <div className=" bg-[#f8fafc] font-poppins text-slate-900 pb-10">
      <main className="max-w-[1900px] mx-auto px-6 py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Users</h1>
            <p className="text-slate-500 text-sm mt-1">Manage and monitor internal user access and roles.</p>
          </div>
          {canManageUsers && (
            <button onClick={handleCreate} className="bg-[#1e56d3] hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-lg font-medium flex items-center gap-2 shadow-md transition-all active:scale-95">
              <UserPlus size={18} /> Create User
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 font-medium text-sm px-3 py-1.5 rounded-md transition-colors ${selectedRoles.length > 0 ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                {/* 4. Dynamic text based on selection count */}
                {selectedRoles.length === 0 ? "Filter by Role" :
                  selectedRoles.length === 1 ? selectedRoles[0] :
                    `${selectedRoles.length} Roles Selected`}
                <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] overflow-hidden">
                  <div className="py-2">
                    {USER_RIGHTS_OPTIONS.map((role) => (
                      <div
                        key={role}
                        onClick={() => toggleRole(role)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-[12px] text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        {/* Checkbox UI */}
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedRoles.includes(role) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
                          {selectedRoles.includes(role) && <Check size={12} className="text-white" />}
                        </div>
                        <span className={selectedRoles.includes(role) ? "font-semibold text-slate-900" : ""}>{role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedRoles.length > 0 && (
              <button
                onClick={() => setSelectedRoles([])}
                className="text-[14px] font-medium text-red-500 transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className='border-b'>
              <tr className="bg-slate-50 border-slate-100">
                <th className="px-6 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">User Name</th>
                <th className="px-6 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">Email</th>
                <th className="px-6 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">Phone</th>
                <th className="px-6 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">Status</th>
                <th className="px-6 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">Last Login</th>
                <th className="px-6 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">Assigned Clients</th>
                <th className="px-6 py-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[12px] divide-y divide-slate-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} onClick={() => handleView(user)} className="hover:bg-slate-50 transition-colors py-0.5 cursor-pointer group/row">
                    <td className="px-6 py-1 border-b border-slate-200">
                      <div className="flex items-center">
                        <div className={`size-6 rounded-full flex items-center justify-center font-bold ${user.color}`}>{user.initials}</div>
                        <span className="pl-2 font-bold text-slate-700">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-1 text-slate-500 font-medium border-b border-slate-200">{user.email}</td>
                    <td className="px-6 py-1 text-slate-500 font-medium border-b border-slate-200">{user.phone}</td>
                    <td className="px-6 py-1 border-b border-slate-200">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${user.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-500' : user.status === 'Inactive' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-amber-100 text-amber-700 border-amber-100'}`}>
                        <span className={`w-1 h-1 rounded-full ${user.status === 'Active' ? 'bg-blue-600' : user.status === 'Inactive' ? 'bg-slate-500' : 'bg-amber-600'}`}></span>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-1 text-slate-500 border-b border-slate-200">{user.lastLogin}</td>
                    <td className="px-6 py-1 border-b border-slate-200">
                      <div className="flex items-center group/avatars relative cursor-default">
                        <div className="flex -space-x-2">
                          {user.linkedClients?.slice().sort((a, b) => a.name.localeCompare(b.name)).slice(0, 3).map((client, i) => {
                            const colors = [
                              'bg-blue-50 text-blue-600 border-white/50',
                              'bg-emerald-50 text-emerald-600 border-emerald-100',
                              'bg-amber-50 text-amber-700 border-amber-100',
                              'bg-indigo-50 text-indigo-600 border-indigo-100'
                            ];
                            return (
                              <div key={client.id} className={`size-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 shadow-sm relative ${colors[i % colors.length]}`} style={{ zIndex: 10 - i }}>
                                {client.initials || client.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                              </div>
                            );
                          })}
                          {user.linkedClients?.length > 3 && (
                            <div className="size-7 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center text-[11px] font-bold border-2 border-white shadow-sm relative" style={{ zIndex: 5 }}>
                              +{user.linkedClients.length - 3}
                            </div>
                          )}
                          {(!user.linkedClients || user.linkedClients.length === 0) && (
                            <span className="text-slate-300 italic">—</span>
                          )}
                        </div>

                        {/* Tooltip on hover */}
                        {user.linkedClients?.length > 0 && (
                          <div className="absolute top-full left-4 mt-1 w-max min-w-[140px] px-3 py-2 bg-[#1F2937] text-white/90 text-[11px] font-medium rounded-lg shadow-2xl border border-[#374151] opacity-0 invisible group-hover/avatars:opacity-100 group-hover/avatars:visible transition-all duration-200 z-[100] translate-y-2 group-hover/avatars:translate-y-0">
                            <div className="flex flex-col gap-2">
                              {user.linkedClients.slice().sort((a, b) => a.name.localeCompare(b.name)).map(lc => (
                                <span key={lc.id} className="whitespace-nowrap hover:text-white/90 transition-colors">{lc.name}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 text-left relative border-b border-slate-200" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {/* View Icon */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleView(user); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Edit Icon */}
                        {canManageUsers && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(user); }}
                            className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <SquarePen size={18} />
                          </button>
                        )}

                        {/* Delete Icon */}
                        {canManageUsers && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash size={18} />
                          </button>
                        )}
                      </div>
                    </td>





                    {/* <td className="px-6 text-left relative border-b border-slate-200">
                      <div className="relative inline-block ">
                        <div className="absolute top-0 right-full mr-2 w-36 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div onClick={(e) => { e.stopPropagation(); handleView(user); }} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 text-slate-600 text-sm cursor-pointer rounded-t-xl"><Eye size={16} /> View</div>
                          <div onClick={(e) => { e.stopPropagation(); handleEdit(user); }} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 text-slate-600 text-sm cursor-pointer"><SquarePen size={16} /> Edit</div>
                          <div onClick={(e) => { e.stopPropagation(); handleDelete(user.id); }} className="flex items-center gap-2 px-4 py-2 hover:bg-red-100 text-red-600 text-sm cursor-pointer rounded-b-xl border-t border-slate-50"><Trash size={16} /> Delete</div>
                        </div>
                      </div>
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400">No users found matching your criteria.</td></tr>
              )}
            </tbody>
          </table>

          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-xl">
            <div className="flex items-center gap-8"><span className="text-xs text-slate-500 font-medium">Showing {filteredUsers.length} of {users.length} users</span></div>
            <div className="flex items-center gap-1.5">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        </div>
      </main>

      <UserPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} userData={editData} onSave={handleSaveUser} />
    </div>
  );
};
export default Users;