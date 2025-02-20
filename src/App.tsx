import React, { useState, useEffect } from 'react';
import { EmployeeRegistration } from './components/EmployeeRegistration';
import { ShiftRegistration } from './components/ShiftRegistration';
import { HRDashboard } from './components/HRDashboard';
import { HRLogin } from './components/HRLogin';
import { ManagersDashboard } from './components/ManagersDashboard';
import { ManagerLogin } from './components/ManagerLogin';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import type { Employee, ShiftEntry, ShiftType, EngineeringSection, PasswordChange } from './types';
import { Building2, AlertCircle } from 'lucide-react';

type ViewType = 'employee' | 'hr' | 'manager' | 'admin';

// Manager passwords
const MANAGER_PASSWORDS: Record<string, string> = {
  'QC_MGR': 'SH123',
  'RTG_MGR': 'AY123',
  'MES_MGR': 'MC123',
  'PLN_MGR': 'SA123',
  'STR_MGR': 'IF123',
  'INF_MGR': 'HD123'
};

// Predefined managers
const MANAGERS: Record<string, Employee> = {
  'QC_MGR': { id: 'QC_MGR', fullName: 'QC Manager', department: 'Engineering', section: 'QC', role: 'manager' },
  'RTG_MGR': { id: 'RTG_MGR', fullName: 'RTG Manager', department: 'Engineering', section: 'RTG', role: 'manager' },
  'MES_MGR': { id: 'MES_MGR', fullName: 'MES Manager', department: 'Engineering', section: 'MES', role: 'manager' },
  'PLN_MGR': { id: 'PLN_MGR', fullName: 'Planning Manager', department: 'Engineering', section: 'Planning', role: 'manager' },
  'STR_MGR': { id: 'STR_MGR', fullName: 'Store Manager', department: 'Engineering', section: 'Store', role: 'manager' },
  'INF_MGR': { id: 'INF_MGR', fullName: 'Infra Manager', department: 'Engineering', section: 'Infra', role: 'manager' }
};

function App() {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('currentEmployee');
    return saved ? JSON.parse(saved) : null;
  });

  const [entries, setEntries] = useState<ShiftEntry[]>(() => {
    const saved = localStorage.getItem('shiftEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [employees, setEmployees] = useState<Record<string, Employee>>(() => {
    const saved = localStorage.getItem('employees');
    const savedEmployees = saved ? JSON.parse(saved) : {};
    // Merge predefined managers with saved employees
    return { ...savedEmployees, ...MANAGERS };
  });

  const [currentView, setCurrentView] = useState<ViewType>('employee');
  const [isHRAuthenticated, setIsHRAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentManager, setCurrentManager] = useState<Employee | null>(null);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    localStorage.setItem('currentEmployee', JSON.stringify(currentEmployee));
  }, [currentEmployee]);

  useEffect(() => {
    localStorage.setItem('shiftEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  const handleRegistration = (data: Employee) => {
    const newEmployee = {
      ...data,
      pendingRegistration: true,
      approved: false
    };
    
    setEmployees(prev => ({
      ...prev,
      [data.id]: newEmployee
    }));
    
    setCurrentEmployee(newEmployee);
  };

  const handleShiftSubmit = (shiftType: ShiftType, date: string, otherRemark?: string) => {
    if (!currentEmployee) return;

    const newEntry: ShiftEntry = {
      id: Date.now().toString(),
      employeeId: currentEmployee.id,
      date,
      shiftType,
      otherRemark,
      timestamp: Date.now(),
      approved: false
    };

    setEntries(prev => [...prev, newEntry]);
  };

  const handleHRLogin = (code: string) => {
    setIsHRAuthenticated(true);
  };

  const handleAdminLogin = (code: string) => {
    setIsAdminAuthenticated(true);
  };

  const handleManagerLogin = (managerId: string, password: string) => {
    const correctPassword = MANAGER_PASSWORDS[managerId];
    if (password === correctPassword) {
      const manager = MANAGERS[managerId];
      if (manager) {
        setCurrentManager(manager);
        setLoginError('');
      }
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleApproval = (entryId: string) => {
    if (!currentManager) return;

    setEntries(prev => prev.map(entry => 
      entry.id === entryId
        ? {
            ...entry,
            approved: true,
            approvedBy: currentManager.id,
            approvedAt: Date.now()
          }
        : entry
    ));
  };

  const handleEmployeeApproval = (employeeId: string) => {
    setEmployees(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        approved: true,
        pendingRegistration: false
      }
    }));
  };

  const handleEmployeeRejection = (employeeId: string) => {
    setEmployees(prev => {
      const newEmployees = { ...prev };
      delete newEmployees[employeeId];
      return newEmployees;
    });

    if (currentEmployee?.id === employeeId) {
      setCurrentEmployee(null);
    }
  };

  const handlePasswordChange = ({ userId, newPassword }: PasswordChange) => {
    if (userId in MANAGER_PASSWORDS) {
      MANAGER_PASSWORDS[userId] = newPassword;
    }
  };

  const handleViewSwitch = (view: ViewType) => {
    setCurrentView(view);
    if (view !== 'hr') {
      setIsHRAuthenticated(false);
    }
    if (view !== 'manager') {
      setCurrentManager(null);
      setLoginError('');
    }
    if (view !== 'admin') {
      setIsAdminAuthenticated(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Employee Attendance System
              </h1>
            </div>
            <div className="w-48">
              <select
                value={currentView}
                onChange={(e) => handleViewSwitch(e.target.value as ViewType)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="employee">Employee View</option>
                <option value="manager">Manager View</option>
                <option value="hr">HR View</option>
                <option value="admin">Admin View</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {currentView === 'admin' ? (
          isAdminAuthenticated ? (
            <AdminDashboard
              employees={employees}
              onApproveEmployee={handleEmployeeApproval}
              onRejectEmployee={handleEmployeeRejection}
              onChangePassword={handlePasswordChange}
            />
          ) : (
            <AdminLogin onLogin={handleAdminLogin} />
          )
        ) : currentView === 'hr' ? (
          isHRAuthenticated ? (
            <HRDashboard entries={entries} employees={employees} isHR={true} />
          ) : (
            <HRLogin onLogin={handleHRLogin} />
          )
        ) : currentView === 'manager' ? (
          currentManager ? (
            <ManagersDashboard
              entries={entries}
              employees={employees}
              currentManager={currentManager}
              onApprove={handleApproval}
            />
          ) : (
            <ManagerLogin
              onLogin={handleManagerLogin}
              managers={Object.values(MANAGERS)}
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-8">
            {!currentEmployee ? (
              <EmployeeRegistration
                onRegister={handleRegistration}
                existingEmployee={null}
              />
            ) : currentEmployee.approved ? (
              <>
                <ShiftRegistration
                  employee={currentEmployee}
                  onSubmit={handleShiftSubmit}
                  entries={entries}
                />
                <HRDashboard 
                  entries={entries.filter(e => e.employeeId === currentEmployee.id)} 
                  employees={employees}
                  isHR={false}
                />
              </>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Registration Pending</h2>
                </div>
                <p className="text-gray-600">
                  Your registration is pending approval from the administrator. Please check back later.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;