import { useState } from 'react';
import { X } from 'lucide-react';

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
      <div className="bg-gray-900/95 p-6 rounded-xl backdrop-blur-md border border-gray-700/50 w-full max-w-sm relative">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-cyan-200 transition-colors"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-cyan-200 mb-8">Rate this book</h3>
        
        <div className="space-y-8">
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full appearance-none bg-gray-800/60 h-1.5 rounded-full outline-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 
                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:hover:shadow-[0_0_10px_rgba(34,211,238,0.5)]
                before:absolute before:h-1.5 before:bg-cyan-400/30 before:rounded-full"
              style={{
                background: `linear-gradient(to right, rgb(34 211 238 / 0.3) 0%, rgb(34 211 238 / 0.3) ${(rating/10)*100}%, rgb(31 41 55 / 0.6) ${(rating/10)*100}%, rgb(31 41 55 / 0.6) 100%)`
              }}
            />
          </div>
          
          <div className="text-center text-3xl font-bold text-cyan-200">
            {rating}
          </div>
        </div>

        <button
          onClick={() => onRate(rating)}
          className="w-full mt-8 py-2.5 rounded bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 
            transition-colors text-sm font-medium tracking-wide"
        >
          Save Rating
        </button>
      </div>
    </div>
  );
};

export default RatingPopup; 