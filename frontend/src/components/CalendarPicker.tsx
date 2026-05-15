// frontend/src/components/CalendarPicker.tsx
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarPickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

export default function CalendarPicker({ value, onChange, minDate, maxDate }: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const min = minDate ? new Date(minDate) : today;
    const max = maxDate ? new Date(maxDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return date < min || date > max;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-zinc-800 rounded-xl transition"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-medium">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-zinc-800 rounded-xl transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-400 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-1 text-sm">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            .toISOString()
            .split("T")[0];

          const isSelected = value === dateStr;
          const disabled = isDateDisabled(day);

          return (
            <button
              key={day}
              onClick={() => !disabled && onChange(dateStr)}
              disabled={disabled}
              className={`h-9 flex items-center justify-center rounded-xl transition-all font-medium
                ${isSelected 
                  ? "bg-primary text-black" 
                  : disabled 
                  ? "text-zinc-600 cursor-not-allowed" 
                  : "hover:bg-zinc-800 text-white"
                }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}