"use client";

import { useState } from 'react';

interface SliderProps {
  defaultValue: number[];
  max: number;
  step: number;
  onValueChange: (value: number[]) => void;
}

export function Slider({ defaultValue, max, step, onValueChange }: SliderProps) {
  const [value, setValue] = useState(defaultValue[0]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
    onValueChange([newValue]);
  };

  return (
    <div className="relative w-full">
      <input
        type="range"
        min="0"
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-[#3a3a3a] rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-blue-500
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-blue-500
          [&::-moz-range-thumb]:border-0"
      />
      <div className="absolute -bottom-6 w-full text-center">
        <span className="text-sm text-gray-400">{value}%</span>
      </div>
    </div>
  );
} 