import { useState, useEffect } from 'react';
import { Book } from '@/lib/types';

interface ProgressPopupProps {
  book: Book;
  onProgress: (currentPage: number, totalPages: number) => void;
  onClose: () => void;
}

const ProgressPopup = ({ book, onProgress, onClose }: ProgressPopupProps) => {
  const [currentPage, setCurrentPage] = useState(book.currentPage || 0);
  const [totalPages, setTotalPages] = useState(book.totalPages || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900/95 p-6 rounded-xl backdrop-blur-md border border-gray-700/50 w-full max-w-sm">
        <h3 className="text-xl font-bold text-cyan-200 mb-4">Update Reading Progress</h3>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Pages Read</label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max={totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-full appearance-none bg-gray-800/60 h-2 rounded-full outline-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 
                  [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                  [&::-webkit-slider-thumb]:hover:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
              />
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-400">0</span>
              <span className="text-cyan-200 font-medium">{currentPage}</span>
              <span className="text-gray-400">{totalPages}</span>
            </div>
          </div>

          {!book.totalPages && (
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Total Pages</label>
              <input
                type="number"
                value={totalPages}
                onChange={(e) => setTotalPages(Number(e.target.value))}
                className="w-full bg-gray-800/60 border border-gray-700 text-gray-200 rounded px-3 py-2"
                min="1"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onProgress(currentPage, totalPages)}
            className="flex-1 bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 py-2 rounded transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800/40 hover:bg-gray-700/40 text-gray-300 py-2 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressPopup; 