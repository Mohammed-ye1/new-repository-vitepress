import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import type { EmployeeRegistration, Department, EngineeringSection } from '../types';

interface Props {
  onRegister: (data: EmployeeRegistration) => void;
  existingEmployee: EmployeeRegistration | null;
}

const departments: Department[] = [
  'Operations',
  'Engineering',
  'Human Resource',
  'Finance',
  'Safety',
  'IT',
  'Security',
  'Planning',
  'Others'
];

const engineeringSections: EngineeringSection[] = [
  'QC',
  'RTG',
  'MES',
  'Planning',
  'Store',
  'Infra',
  'Others'
];

export function EmployeeRegistration({ onRegister, existingEmployee }: Props) {
  const [employeeId, setEmployeeId] = useState(existingEmployee?.id || '');
  const [fullName, setFullName] = useState(existingEmployee?.fullName || '');
  const [department, setDepartment] = useState<Department>(existingEmployee?.department || 'Operations');
  const [section, setSection] = useState<EngineeringSection | undefined>(existingEmployee?.section);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({ 
      id: employeeId, 
      fullName, 
      department,
      section: department === 'Engineering' ? section : undefined 
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Employee Registration</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
            Employee ID
          </label>
          <input
            type="text"
            id="employeeId"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            required
          />
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            required
          />
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <select
            id="department"
            value={department}
            onChange={(e) => {
              const newDepartment = e.target.value as Department;
              setDepartment(newDepartment);
              if (newDepartment !== 'Engineering') {
                setSection(undefined);
              }
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            required
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {department === 'Engineering' && (
          <div>
            <label htmlFor="section" className="block text-sm font-medium text-gray-700">
              Section
            </label>
            <select
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value as EngineeringSection)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
              required
            >
              <option value="">Select Section</option>
              {engineeringSections.map((sect) => (
                <option key={sect} value={sect}>
                  {sect}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Register
        </button>
      </form>
    </div>
  );
}