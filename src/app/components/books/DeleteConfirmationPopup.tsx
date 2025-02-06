"use client";

interface DeleteConfirmationPopupProps {
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteConfirmationPopup = ({ onConfirm, onClose }: DeleteConfirmationPopupProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-semibold text-cyan-200 mb-4 text-center">
          Delete Book
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Are you sure you want to delete this book from your list?
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 
              rounded-lg transition-all duration-300"
          >
            Yes, Delete
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 
              rounded-lg transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopup; 