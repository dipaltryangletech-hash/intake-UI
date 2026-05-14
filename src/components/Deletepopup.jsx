import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash, AlertCircle } from 'lucide-react';

const Delete = ({ id, onDelete, itemName = "item" }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setIsOpen(true);
    };

    const handleConfirm = async (e) => {
        e.stopPropagation();
        setIsOpen(false);
        await onDelete(id);
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={handleDeleteClick}
                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
            >
                <Trash size={16} />
            </button>

            {isOpen && createPortal(
                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-blue-900/20 backdrop-blur-sm"
                    onClick={handleCancel}
                >
                    <div
                        className="bg-white rounded-2xl p-4 shadow-2xl min-w-[380px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center gap-2">
                            {/* Icon */}
                            <div className="flex items-center justify-center">
                                <AlertCircle size={30} className="text-red-600" strokeWidth={1.5} />
                            </div>

                            {/* Text Content */}
                            <div className="flex flex-col items-center gap-1.5 text-center">
                                <h3 className="text-xl font-bold text-slate-800">
                                    Delete {itemName.charAt(0).toUpperCase() + itemName.slice(1)}?
                                </h3>
                                <p className="text-[14px] font-medium text-slate-500">
                                    Are you sure you want to delete this {itemName}?
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-center w-full gap-2 mt-2">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 px-4 py-2 text-sm font-semibold border-2 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 px-4 py-2 text-sm font-semibold bg-[#DE3535] hover:bg-[#C92A2A] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white rounded-lg transition-colors shadow-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default Delete;



//  <Delete
// id={item.id}
//  itemName="client"
//  onDelete={async (id) => {
//    const result = await deleteClient(id);
//    if (!result.success) {
//      toast.error(result.message || "Failed to delete client");
//    } else {
//       oast.success("Client deleted successfully!");
//    }
//  }}
///>