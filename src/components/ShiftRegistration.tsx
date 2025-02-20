import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ShiftType, Employee, ShiftEntry } from '../types';

interface Props {
  employee: Employee;
  onSubmit: (shiftType: ShiftType, date: string, otherRemark?: string) => void;
  entries: ShiftEntry[]; // Add this prop
}

const shiftTypes: { value: ShiftType; label: string }[] = [
  { value: '1st_shift', label: '1st Shift' },
  { value: '2nd_shift', label: '2nd Shift' },
  { value: '3rd_shift', label: '3rd Shift' },
  { value: 'leave', label: 'Leave' },
  { value: 'medical', label: 'Medical Leave' },
  { value: 'ot_off_day', label: 'OT as Off Day' },
  { value: 'ot_week_off', label: 'OT as Week Off' },
  { value: 'ot_public_holiday', label: 'OT as Public Holiday' },
  { value: 'other', label: 'Other' },
];

export function ShiftRegistration({ employee, onSubmit, entries }: Props) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const todayStr = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);

  const [date, setDate] = useState(todayStr);
  const [shiftType, setShiftType] = useState<ShiftType>('1st_shift');
  const [otherRemark, setOtherRemark] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if an entry already exists for this date
    const existingEntry = entries.find(
      entry => entry.employeeId === employee.id && entry.date === date
    );

    if (existingEntry) {
      setError('You have already registered for this date');
      return;
    }

    onSubmit(shiftType, date, shiftType === 'other' ? otherRemark : undefined);
    setShowSuccess(true);
    setError('');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Shift Registration</h2>
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
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <div className="mt-1 relative">
            <select
              id="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError('');
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              required
            >
              <option value={todayStr}>Today ({todayStr})</option>
              <option value={tomorrowStr}>Tomorrow ({tomorrowStr})</option>
            </select>
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="shiftType" className="block text-sm font-medium text-gray-700">
            Shift Type
          </label>
          <select
            id="shiftType"
            value={shiftType}
            onChange={(e) => setShiftType(e.target.value as ShiftType)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            required
          >
            {shiftTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {shiftType === 'other' && (
          <div>
            <label htmlFor="otherRemark" className="block text-sm font-medium text-gray-700">
              Remark
            </label>
            <textarea
              id="otherRemark"
              value={otherRemark}
              onChange={(e) => setOtherRemark(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              required
              rows={3}
              placeholder="Please specify the reason..."
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
    </div>
  );
}