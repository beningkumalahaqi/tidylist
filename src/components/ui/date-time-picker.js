"use client";

import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { Calendar, X } from "lucide-react";

const DateTimePicker = forwardRef(({ className, value, onChange, ...props }, ref) => {
  // Convert string value to Date object if needed
  const dateValue = value ? (typeof value === 'string' ? new Date(value) : value) : null;

  const handleDateChange = (date) => {
    if (onChange) {
      // Convert to ISO string format for form handling
      onChange(date ? date.toISOString() : null);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <DatePicker
          ref={ref}
          selected={dateValue}
          onChange={handleDateChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="dd/MM/yyyy HH:mm"
          placeholderText="Pilih tanggal dan waktu"
          minDate={new Date()}
          showPopperArrow={false}
          popperPlacement="auto"
          popperProps={{
            strategy: "fixed",
            modifiers: [
              {
                name: "preventOverflow",
                options: {
                  altAxis: true,
                  padding: 16
                }
              },
              {
                name: "offset",
                options: {
                  offset: [0, 12]
                }
              },
              {
                name: "flip",
                options: {
                  fallbackPlacements: ['top', 'left', 'right']
                }
              }
            ]
          }}
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 transition-colors dark:text-black",
            className
          )}
          calendarClassName="react-datepicker-clean"
          wrapperClassName="w-full"
          {...props}
        />
        {dateValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear date"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      <style jsx global>{`
        .react-datepicker-clean {
          font-family: inherit;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          background: white;
          overflow: visible;
          z-index: 1000;
          transform: none !important;
        }
        
        .react-datepicker-clean .react-datepicker__header {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          border-radius: 8px 8px 0 0;
          padding: 16px 0 8px 0;
          position: relative;
        }
        
        .react-datepicker-clean .react-datepicker__current-month {
          color: #1e293b;
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 8px;
          text-align: center;
        }
        
        .react-datepicker-clean .react-datepicker__day-names {
          display: flex;
          justify-content: space-around;
          margin-bottom: 0;
          padding: 0 16px;
        }
        
        .react-datepicker-clean .react-datepicker__day-name {
          color: #64748b;
          font-weight: 500;
          font-size: 12px;
          width: 32px;
          height: 32px;
          line-height: 32px;
          margin: 0;
          text-transform: uppercase;
        }
        
        .react-datepicker-clean .react-datepicker__month {
          margin: 0;
          padding: 8px 16px 16px 16px;
          background: white;
        }
        
        .react-datepicker-clean .react-datepicker__week {
          display: flex;
          justify-content: space-around;
          margin-bottom: 2px;
        }
        
        .react-datepicker-clean .react-datepicker__day {
          color: #475569;
          width: 32px;
          height: 32px;
          line-height: 32px;
          margin: 1px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .react-datepicker-clean .react-datepicker__day:hover {
          background-color: #f1f5f9;
          color: #1e293b;
        }
        
        .react-datepicker-clean .react-datepicker__day--selected {
          background-color: #3b82f6;
          color: white;
          font-weight: 500;
        }
        
        .react-datepicker-clean .react-datepicker__day--selected:hover {
          background-color: #2563eb;
        }
        
        .react-datepicker-clean .react-datepicker__day--keyboard-selected {
          background-color: #dbeafe;
          color: #1d4ed8;
        }
        
        .react-datepicker-clean .react-datepicker__day--today {
          background-color: #fef3c7;
          color: #92400e;
          font-weight: 500;
        }
        
        .react-datepicker-clean .react-datepicker__day--today:hover {
          background-color: #fde68a;
        }
        
        .react-datepicker-clean .react-datepicker__day--outside-month {
          color: #cbd5e1;
        }
        
        .react-datepicker-clean .react-datepicker__day--disabled {
          color: #e2e8f0;
          cursor: not-allowed;
        }
        
        .react-datepicker-clean .react-datepicker__day--disabled:hover {
          background-color: transparent;
        }
        
        .react-datepicker-clean .react-datepicker__navigation {
          position: absolute !important;
          top: 16px !important;
          width: 32px !important;
          height: 32px !important;
          border-radius: 6px !important;
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          cursor: pointer !important;
          transition: all 0.15s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 10 !important;
          outline: none !important;
        }
        
        .react-datepicker-clean .react-datepicker__navigation:hover {
          background-color: #f1f5f9 !important;
          border-color: #cbd5e1 !important;
        }
        
        .react-datepicker-clean .react-datepicker__navigation--previous {
          left: 12px !important;
        }
        
        .react-datepicker-clean .react-datepicker__navigation--next {
          right: 12px !important;
        }
        
        .react-datepicker-clean .react-datepicker__navigation--next--with-time:not(.react-datepicker__navigation--next--with-today-button) {
          right: 12px !important;
        }
        
        .react-datepicker-clean .react-datepicker__navigation-icon {
          position: relative !important;
          top: 0 !important;
          font-size: 0 !important;
          line-height: 0 !important;
          width: 16px !important;
          height: 16px !important;
        }
        
        .react-datepicker-clean .react-datepicker__navigation-icon::before {
          border-color: #64748b !important;
          border-style: solid !important;
          border-width: 2px 2px 0 0 !important;
          content: "" !important;
          display: block !important;
          width: 8px !important;
          height: 8px !important;
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
        }
        
        .react-datepicker-clean .react-datepicker__navigation--previous .react-datepicker__navigation-icon::before {
          transform: translate(-50%, -50%) rotate(-135deg) !important;
        }
        
        .react-datepicker-clean .react-datepicker__navigation--next .react-datepicker__navigation-icon::before {
          transform: translate(-50%, -50%) rotate(45deg) !important;
        }
        
        .react-datepicker-clean .react-datepicker__time-container {
          border-left: 1px solid #e2e8f0;
          width: 100px;
          background: #fafafa;
        }
        
        .react-datepicker-clean .react-datepicker-time__header {
          color: #374151;
          font-weight: 600;
          font-size: 14px;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
          background-color: #f8fafc;
        }
        
        .react-datepicker-clean .react-datepicker__time-list {
          height: 180px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        
        .react-datepicker-clean .react-datepicker__time-list::-webkit-scrollbar {
          width: 4px;
        }
        
        .react-datepicker-clean .react-datepicker__time-list::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .react-datepicker-clean .react-datepicker__time-list::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 2px;
        }
        
        .react-datepicker-clean .react-datepicker__time-list-item {
          color: #475569;
          padding: 6px 8px;
          font-size: 13px;
          cursor: pointer;
          transition: background-color 0.15s ease;
          margin: 1px 4px;
          border-radius: 4px;
        }
        
        .react-datepicker-clean .react-datepicker__time-list-item:hover {
          background-color: #f1f5f9;
        }
        
        .react-datepicker-clean .react-datepicker__time-list-item--selected {
          background-color: #3b82f6;
          color: white;
          font-weight: 500;
        }
        
        .react-datepicker-clean .react-datepicker__time-list-item--selected:hover {
          background-color: #2563eb;
        }
        
        .react-datepicker__tab-loop {
          position: absolute;
          z-index: 9999;
        }
        
        .react-datepicker-wrapper {
          width: 100%;
        }
        
        .react-datepicker__input-container {
          width: 100%;
        }
        
        .react-datepicker-popper {
          z-index: 9999 !important;
          position: absolute !important;
          inset: auto !important;
          transform: none !important;
          max-height: 95vh;
        }
        
        .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle {
          border-bottom-color: #d1d5db;
          z-index: 9999;
        }
        
        .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::before {
          border-bottom-color: white;
          z-index: 9999;
        }
        
        .react-datepicker-popper[data-placement^="top"] .react-datepicker__triangle {
          border-top-color: #d1d5db;
          z-index: 9999;
        }
        
        .react-datepicker-popper[data-placement^="top"] .react-datepicker__triangle::before {
          border-top-color: white;
          z-index: 9999;
        }
        
        /* Ensure calendar container appears above other elements */
        .react-datepicker__month-container {
          z-index: 9999;
          max-height: 400px;
          font-size: 0.95em;
        }
        
        /* Ensure time container appears above other elements */
        .react-datepicker__time-container {
          z-index: 9999;
        }
      `}</style>
    </div>
  );
});

DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker };
