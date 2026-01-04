import  { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import PropTypes from 'prop-types';

export default function DateTimePicker  ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  minDate,
})  {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    const minDateObj = minDate ? new Date(minDate) : today;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (date >= minDateObj) {
        dates.push({
          date: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }),
          isToday: i === 0,
          dayOfWeek: date.getDay()
        });
      }
    }
    return dates;
  };

  const calendarDates = generateCalendarDates();

  const formatSelectedDate = (dateStr) => {
    if (!dateStr) return 'Select date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSelectedTime = (timeStr) => {
    if (!timeStr) return 'Select time';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-4">
      {/* Date Picker */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="inline h-4 w-4 mr-1" />
          Select Date
        </label>
        <button
          type="button"
          onClick={() => {
            setShowCalendar(!showCalendar);
            setShowTimeSlots(false);
          }}
          className="w-full px-4 py-3 text-left border border-gray-300 rounded-md focus:ring-black focus:border-black bg-white hover:bg-gray-50"
        >
          <span className={selectedDate ? 'text-gray-900' : 'text-gray-500'}>
            {formatSelectedDate(selectedDate)}
          </span>
        </button>

        {showCalendar && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="grid grid-cols-1 gap-1">
                {calendarDates.map((dateObj) => (
                  <button
                    key={dateObj.date}
                    type="button"
                    onClick={() => {
                      onDateChange(dateObj.date);
                      setShowCalendar(false);
                    }}
                    className={`p-3 text-left rounded-md hover:bg-gray-100 ${
                      selectedDate === dateObj.date
                        ? 'bg-primary-100 text-black font-medium'
                        : 'text-gray-900'
                    } ${dateObj.isToday ? 'border border-primary-100' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{dateObj.display}</span>
                      {dateObj.isToday && (
                        <span className="text-xs bg-black text-white px-2 py-1 rounded">
                          Today
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time Picker */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="inline h-4 w-4 mr-1" />
          Select Time
        </label>
        <button
          type="button"
          onClick={() => {
            setShowTimeSlots(!showTimeSlots);
            setShowCalendar(false);
          }}
          disabled={!selectedDate}
          className="w-full px-4 py-3 text-left border border-gray-300 rounded-md focus:ring-black focus:border-black bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <span className={selectedTime ? 'text-gray-900' : 'text-gray-500'}>
            {formatSelectedTime(selectedTime)}
          </span>
        </button>

        {showTimeSlots && selectedDate && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        onTimeChange(time);
                        setShowTimeSlots(false);
                      }}
                      className={`p-2 text-center rounded-md border hover:bg-gray-100 ${
                        isSelected
                          ? 'bg-primary-100 text-black'
                          : 'bg-white text-gray-900 border-gray-200'
                      }`}
                    >
                      {formatSelectedTime(time)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {selectedDate && selectedTime && (
        <div className="p-4 bg-primary-50 rounded-md border border-primary-200">
          <h4 className="font-medium text-primary-900 mb-2">Selected Appointment</h4>
          <p className="text-primary-700">
            <Calendar className="inline h-4 w-4 mr-1" />
            {formatSelectedDate(selectedDate)}
          </p>
          <p className="text-primary-700">
            <Clock className="inline h-4 w-4 mr-1" />
            {formatSelectedTime(selectedTime)}
          </p>
        </div>
      )}
    </div>
  );
};

DateTimePicker.propTypes = {
  selectedDate: PropTypes.string.isRequired,
  selectedTime: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onTimeChange: PropTypes.func.isRequired,
  minDate: PropTypes.string,
};


