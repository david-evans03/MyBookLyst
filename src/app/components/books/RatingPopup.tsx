import { useState } from 'react';

interface RatingPopupProps {
  bookId: string;
  currentRating: number;
  onRate: (rating: number) => void;
  onClose: () => void;
}

const RatingPopup = ({ currentRating, onRate, onClose }: RatingPopupProps) => {
  const [rating, setRating] = useState(currentRating);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900/95 p-6 rounded-xl backdrop-blur-md border border-gray-700/50 w-full max-w-sm">
        <h3 className="text-xl font-bold text-cyan-200 mb-4">Rate this book</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between text-gray-400 text-sm">
            <span>1</span>
            <span>10</span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full appearance-none bg-gray-800/60 h-2 rounded-full outline-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 
                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:hover:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            />
          </div>
          
          <div className="text-center text-2xl font-bold text-cyan-200">
            {rating}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onRate(rating)}
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

export default RatingPopup; 