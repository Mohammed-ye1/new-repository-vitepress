import React, { useState } from 'react';
import { Download, Table, CheckCircle2, XCircle } from 'lucide-react';
import type { ShiftEntry, ShiftType, Employee } from '../types';

interface Props {
  entries: ShiftEntry[];
  employees: Record<string, Employee>;
  currentManager: Employee;
  onApprove: (entryId: string) => void;
}

const formatShiftType = (type: ShiftType): string => {
  const labels: Record<ShiftType, string> = {
    '1st_shift': '1st Shift',
    '2nd_shift': '2nd Shift',
    '3rd_shift': '3rd Shift',
    'leave': 'Leave',
    'medical': 'Medical Leave',
    'ot_off_day': 'OT as Off Day',
    'ot_week_off': 'OT as Week Off',
    'ot_public_holiday': 'OT as Public Holiday',
    'other': 'Other'
  };
  return labels[type] || type;
};

export function ManagersDashboard({ entries, employees, currentManager, onApprove }: Props) {
  const [dateFilter, setDateFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState<ShiftType | ''>('');
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved'>('all');

  // Filter entries for the manager's section only
  const sectionEntries = entries.filter(entry => {
    const employee = employees[entry.employeeId];
    return employee?.section === currentManager.section;
  });

  const filteredEntries = sectionEntries.filter((entry) => {
    const matchesDate = !dateFilter || entry.date === dateFilter;
    const matchesEmployee = !employeeFilter || entry.employeeId === employeeFilter;
    const matchesShift = !shiftFilter || entry.shiftType === shiftFilter;
    const matchesApproval = approvalFilter === 'all' 
      ? true 
      : approvalFilter === 'approved' 
        ? entry.approved 
        : !entry.approved;
    return matchesDate && matchesEmployee && matchesShift && matchesApproval;
  });

  const exportData = () => {
    const csvContent = [
      ['Date', 'Employee ID', 'Employee Name', 'Department', 'Section', 'Shift Type', 'Status', 'Approved By', 'Approved At', 'Remark'],
      ...filteredEntries.map((entry) => [
        entry.date,
        entry.employeeId,
        employees[entry.employeeId]?.fullName || 'Unknown',
        employees[entry.employeeId]?.department || 'Unknown',
        employees[entry.employeeId]?.section || '-',
        formatShiftType(entry.shiftType),
        entry.approved ? 'Approved' : 'Pending',
        entry.approvedBy ? employees[entry.approvedBy]?.fullName : '-',
        entry.approvedAt ? new Date(entry.approvedAt).toLocaleString() : '-',
        entry.otherRemark || '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentManager.section}-attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const shiftTypes: ShiftType[] = [
    '1st_shift',
    '2nd_shift',
    '3rd_shift',
    'leave',
    'medical',
    'ot_off_day',
    'ot_week_off',
    'ot_public_holiday',
    'other'
  ];

  const sectionEmployees = Object.values(employees).filter(emp => 
    emp.section === currentManager.section && emp.role !== 'manager'
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Table className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {currentManager.section} Manager Dashboard
            </h2>
            <p className="text-sm text-gray-600">
              Welcome, {currentManager.fullName}
            </p>
          </div>
        </div>
        <button
          onClick={exportData}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Date
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Employee
          </label>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          >
            <option value="">All Employees</option>
            {sectionEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.fullName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Shift
          </label>
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value as ShiftType | '')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          >
            <option value="">All Shifts</option>
            {shiftTypes.map((type) => (
              <option key={type} value={type}>
                {formatShiftType(type)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Approval Status
          </label>
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value as 'all' | 'pending' | 'approved')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          >
            <option value="all">All Entries</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shift Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remark
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEntries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employees[entry.employeeId]?.fullName || 'Unknown'} ({entry.employeeId})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatShiftType(entry.shiftType)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {entry.approved ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <XCircle className="w-4 h-4 mr-1" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.otherRemark || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {!entry.approved && (
                    <button
                      onClick={() => onApprove(entry.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}