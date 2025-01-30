import { useState, useEffect } from 'react';
import { Book } from '@/lib/types';
import { X } from 'lucide-react';

interface ProgressPopupProps {
  book: Book;
  onProgress: (currentPage: number, totalPages: number) => void;
  onClose: () => void;
}

const ProgressPopup = ({ book, onProgress, onClose }: ProgressPopupProps) => {
  const [currentPage, setCurrentPage] = useState(book.currentPage || 0);
  const [totalPages, setTotalPages] = useState(book.totalPages || 0);

  useEffect(() => {
    if (book.totalPages) {
      setTotalPages(book.totalPages);
    }
  }, [book.totalPages]);

  const handleSave = () => {
    if (totalPages <= 0) {
      alert('Please enter the total number of pages');
      return;
    }
    onProgress(currentPage, totalPages);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900/95 p-6 rounded-xl backdrop-blur-md border border-gray-700/50 w-full max-w-sm relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-cyan-200 transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-cyan-200 mb-8">Update Progress</h3>
        
        <div className="space-y-8">
          <div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max={totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-full appearance-none bg-gray-800/60 h-1.5 rounded-full outline-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 
                  [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                  [&::-webkit-slider-thumb]:hover:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                style={{
                  background: `linear-gradient(to right, rgb(34 211 238 / 0.3) 0%, rgb(34 211 238 / 0.3) ${(currentPage/totalPages)*100}%, rgb(31 41 55 / 0.6) ${(currentPage/totalPages)*100}%, rgb(31 41 55 / 0.6) 100%)`
                }}
              />
            </div>
            <div className="flex justify-between text-sm mt-3">
              <span className="text-cyan-200 font-medium">{currentPage}</span>
              <span className="text-gray-400">of {totalPages} pages</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Total Pages</label>
            <input
              type="number"
              value={totalPages}
              onChange={(e) => setTotalPages(Number(e.target.value))}
              className="w-full bg-gray-800/60 border border-gray-700 text-gray-200 rounded px-3 py-2
                focus:ring-1 focus:ring-cyan-400/30 focus:border-cyan-400/30"
              min="1"
              placeholder="Enter total pages"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-8 py-2.5 rounded bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 
            transition-colors text-sm font-medium tracking-wide"
        >
          Save Progress
        </button>
      </div>
    </div>
  );
};

export default ProgressPopup; 