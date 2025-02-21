import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, UserX } from 'lucide-react';
import type { ShiftType, Employee, ShiftEntry } from '../types';

interface Props {
  employee: Employee | null;
  onSubmit: (shiftType: ShiftType, date: string, otherRemark?: string) => void;
  entries: ShiftEntry[];
  initialStep?: 'date' | 'shift';
  onStepChange?: (step: 'date' | 'shift') => void;
}

const shiftTypes: { value: ShiftType; label: string; description: string }[] = [
  { value: '1st_shift', label: '1st Shift', description: '6:00 AM - 2:00 PM' },
  { value: '2nd_shift', label: '2nd Shift', description: '2:00 PM - 10:00 PM' },
  { value: '3rd_shift', label: '3rd Shift', description: '10:00 PM - 6:00 AM' },
  { value: 'leave', label: 'Leave', description: 'Full Day Leave' },
  { value: 'medical', label: 'Medical Leave', description: 'Medical Emergency/Appointment' },
  { value: 'ot_off_day', label: 'OT as Off Day', description: 'Overtime on Regular Off Day' },
  { value: 'ot_week_off', label: 'OT as Week Off', description: 'Overtime on Weekly Off' },
  { value: 'ot_public_holiday', label: 'OT as Public Holiday', description: 'Overtime on Public Holiday' },
  { value: 'other', label: 'Other', description: 'Other Types (Please Specify)' },
];

export function ShiftRegistration({ employee, onSubmit, entries, initialStep = 'date', onStepChange }: Props) {
  // If no employee is provided, show an error state
  if (!employee) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <UserX className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-800">No Employee Data</h2>
        </div>
        <p className="text-gray-600">
          Unable to load employee information. Please try again later.
        </p>
      </div>
    );
  }

  const [currentStep, setCurrentStep] = useState<'date' | 'shift'>(initialStep);
  const [selectedDate, setSelectedDate] = useState('');
  const [shiftType, setShiftType] = useState<ShiftType>('1st_shift');
  const [otherRemark, setOtherRemark] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  // Generate calendar dates (current month)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [currentMonth, setCurrentMonth] = useState(today);
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const daysInMonth = Array.from(
    { length: lastDay.getDate() },
    (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)
  );

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const isDateDisabled = (date: Date) => {
    const dateStr = formatDate(date);
    return (
      date < today ||
      entries.some(entry => entry.employeeId === employee.id && entry.date === dateStr)
    );
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateDisabled(date)) {
      setSelectedDate(formatDate(date));
      setCurrentStep('shift');
      setError('');
    }
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    if (newDate.getMonth() >= today.getMonth() || newDate.getFullYear() > today.getFullYear()) {
      setCurrentMonth(newDate);
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    if (shiftType === 'other' && !otherRemark.trim()) {
      setError('Please provide a remark for other shift type');
      return;
    }

    try {
      await onSubmit(shiftType, selectedDate, shiftType === 'other' ? otherRemark : undefined);
      setShowSuccess(true);
      setError('');
      setTimeout(() => {
        setShowSuccess(false);
        setCurrentStep('date');
        setSelectedDate('');
        setShiftType('1st_shift');
        setOtherRemark('');
      }, 3000);
    } catch (err) {
      console.error('Error submitting shift:', err);
      setError('Failed to submit shift. Please try again.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <div className="flex items-center gap-2 mb-6">
        {currentStep === 'date' ? (
          <Calendar className="w-6 h-6 text-blue-600" />
        ) : (
          <Clock className="w-6 h-6 text-blue-600" />
        )}
        <h2 className="text-xl font-semibold text-gray-800">
          {currentStep === 'date' ? 'Select Date' : 'Select Shift'}
        </h2>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">Welcome,</p>
        <p className="font-medium text-gray-800">
          {employee.fullName} (ID: {employee.id})
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Department: {employee.department}
          {employee.section && ` - Section: ${employee.section}`}
        </p>
      </div>

      {currentStep === 'date' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
              disabled={currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-medium text-gray-800">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDay.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}
            {daysInMonth.map(date => {
              const isDisabled = isDateDisabled(date);
              const isSelected = selectedDate === formatDate(date);
              const isToday = formatDate(date) === formatDate(today);

              return (
                <button
                  key={date.getTime()}
                  onClick={() => handleDateSelect(date)}
                  disabled={isDisabled}
                  className={`
                    p-2 rounded-full w-10 h-10 mx-auto flex items-center justify-center text-sm
                    ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50'}
                    ${isSelected ? 'bg-blue-600 text-white' : ''}
                    ${isToday ? 'border-2 border-blue-600' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Selected Date
              </label>
              <button
                type="button"
                onClick={() => setCurrentStep('date')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Change Date
              </button>
            </div>
            <div className="p-3 bg-gray-50 rounded-md text-gray-800 font-medium">
              {new Date(selectedDate).toLocaleDateString('default', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shift Type
            </label>
            <div className="space-y-2">
              {shiftTypes.map(type => (
                <label
                  key={type.value}
                  className={`
                    block p-3 rounded-lg border cursor-pointer transition-colors
                    ${shiftType === type.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="shiftType"
                      value={type.value}
                      checked={shiftType === type.value}
                      onChange={(e) => setShiftType(e.target.value as ShiftType)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {type.label}
                        </p>
                        {shiftType === type.value && (
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {shiftType === 'other' && (
            <div>
              <label htmlFor="otherRemark" className="block text-sm font-medium text-gray-700">
                Specify Reason
              </label>
              <textarea
                id="otherRemark"
                value={otherRemark}
                onChange={(e) => setOtherRemark(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                required
                rows={3}
                placeholder="Please provide details..."
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 relative"
            disabled={showSuccess}
          >
            {showSuccess ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Entry Completed!
              </span>
            ) : (
              'Complete Entry'
            )}
          </button>
        </form>
      )}
    </div>
  );
}