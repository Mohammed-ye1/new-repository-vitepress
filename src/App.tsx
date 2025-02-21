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
import { supabase } from './lib/supabase';

type ViewType = 'employee' | 'hr' | 'manager' | 'admin';

// Manager passwords
const MANAGER_PASSWORDS: Record<string, string> = {
  'QC_MGR': 'SH123',
  'RTG_MGR': 'AY123',
  'MES_MGR': 'MC123',
  'PLN_MGR': 'SA123',
  'STR_MGR': 'IF123',
  'INF_MGR': 'HD123',
  'SHIFT_MGR': 'TA123'
};

// Predefined managers
const MANAGERS: Record<string, Employee> = {
  'QC_MGR': { id: 'QC_MGR', fullName: 'QC Manager', department: 'Engineering', section: 'QC', role: 'manager' },
  'RTG_MGR': { id: 'RTG_MGR', fullName: 'RTG Manager', department: 'Engineering', section: 'RTG', role: 'manager' },
  'MES_MGR': { id: 'MES_MGR', fullName: 'MES Manager', department: 'Engineering', section: 'MES', role: 'manager' },
  'PLN_MGR': { id: 'PLN_MGR', fullName: 'Planning Manager', department: 'Engineering', section: 'Planning', role: 'manager' },
  'STR_MGR': { id: 'STR_MGR', fullName: 'Store Manager', department: 'Engineering', section: 'Store', role: 'manager' },
  'INF_MGR': { id: 'INF_MGR', fullName: 'Infra Manager', department: 'Engineering', section: 'Infra', role: 'manager' },
  'SHIFT_MGR': { id: 'SHIFT_MGR', fullName: 'Shift Manager', department: 'Engineering', section: 'Shift Incharge', role: 'manager' }
};

function App() {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [entries, setEntries] = useState<ShiftEntry[]>([]);
  const [employees, setEmployees] = useState<Record<string, Employee>>(MANAGERS);
  const [currentView, setCurrentView] = useState<ViewType>('employee');
  const [isHRAuthenticated, setIsHRAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentManager, setCurrentManager] = useState<Employee | null>(null);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [registrationStep, setRegistrationStep] = useState<'registration' | 'date' | 'shift'>('registration');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');
      
      if (profiles) {
        const profilesMap = profiles.reduce((acc, profile) => ({
          ...acc,
          [profile.id]: {
            id: profile.id,
            fullName: profile.full_name,
            department: profile.department,
            section: profile.section,
            role: profile.role,
            approved: profile.is_approved
          }
        }), {});
        
        setEmployees(prev => ({ ...prev, ...profilesMap }));
      }

      // Fetch shift entries
      const { data: shiftEntries } = await supabase
        .from('shift_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (shiftEntries) {
        setEntries(shiftEntries.map(entry => ({
          id: entry.id,
          employeeId: entry.employee_id,
          date: entry.date,
          shiftType: entry.shift_type as ShiftType,
          otherRemark: entry.other_remark,
          timestamp: new Date(entry.created_at).getTime(),
          approved: entry.approved,
          approvedBy: entry.approved_by,
          approvedAt: entry.approved_at ? new Date(entry.approved_at).getTime() : undefined
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (data: Employee) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert([{
          id: data.id,
          full_name: data.fullName,
          department: data.department,
          section: data.section,
          role: 'employee',
          is_approved: false
        }])
        .select()
        .single();

      if (error) throw error;

      if (profile) {
        const newEmployee = {
          id: profile.id,
          fullName: profile.full_name,
          department: profile.department,
          section: profile.section,
          role: 'employee',
          approved: profile.is_approved
        };
        
        setCurrentEmployee(newEmployee);
        setEmployees(prev => ({ ...prev, [newEmployee.id]: newEmployee }));
      }
    } catch (error) {
      console.error('Error in registration:', error);
    }
  };

  const handleShiftSubmit = async (shiftType: ShiftType, date: string, otherRemark?: string) => {
    if (!currentEmployee) return;

    try {
      const { data: entry, error } = await supabase
        .from('shift_entries')
        .insert([{
          employee_id: currentEmployee.id,
          date,
          shift_type: shiftType,
          other_remark: otherRemark,
          approved: false
        }])
        .select()
        .single();

      if (error) throw error;

      if (entry) {
        setEntries(prev => [{
          id: entry.id,
          employeeId: entry.employee_id,
          date: entry.date,
          shiftType: entry.shift_type as ShiftType,
          otherRemark: entry.other_remark,
          timestamp: new Date(entry.created_at).getTime(),
          approved: entry.approved,
          approvedBy: entry.approved_by,
          approvedAt: entry.approved_at ? new Date(entry.approved_at).getTime() : undefined
        }, ...prev]);

        // Reset to date selection after successful submission
        setRegistrationStep('date');
      }
    } catch (error) {
      console.error('Error submitting shift:', error);
    }
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

  const handleApproval = async (entryId: string) => {
    if (!currentManager) return;

    try {
      const { error } = await supabase
        .from('shift_entries')
        .update({
          approved: true,
          approved_by: currentManager.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (error) throw error;

      setEntries(prev => prev.map(entry => 
        entry.id === entryId
          ? {
              ...entry,
              approved: true,
              approvedBy: currentManager.id,
              approvedAt: new Date().getTime()
            }
          : entry
      ));
    } catch (error) {
      console.error('Error approving shift:', error);
    }
  };

  const handleEmployeeApproval = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_approved: true
        })
        .eq('id', employeeId);

      if (error) throw error;

      setEmployees(prev => ({
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          approved: true
        }
      }));

      // If this is the current employee, move them to date selection
      if (currentEmployee?.id === employeeId) {
        setRegistrationStep('date');
      }
    } catch (error) {
      console.error('Error approving employee:', error);
    }
  };

  const handleEmployeeRejection = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;

      const { [employeeId]: removed, ...rest } = employees;
      setEmployees(rest);

      if (currentEmployee?.id === employeeId) {
        setCurrentEmployee(null);
        setRegistrationStep('registration');
      }
    } catch (error) {
      console.error('Error rejecting employee:', error);
    }
  };

  const handlePasswordChange = ({ userId, newPassword }: PasswordChange) => {
    if (userId in MANAGER_PASSWORDS) {
      MANAGER_PASSWORDS[userId] = newPassword;
    }
  };

  const handleViewSwitch = (view: ViewType) => {
    setCurrentView(view);
    setRegistrationStep('registration');
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

  const handleExistingEmployee = () => {
    setRegistrationStep('date');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            <select
              value={currentView}
              onChange={(e) => handleViewSwitch(e.target.value as ViewType)}
              className="w-48 px-4 py-2 rounded-md border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="employee">Employee View</option>
              <option value="manager">Manager View</option>
              <option value="hr">HR View</option>
              <option value="admin">Admin View</option>
            </select>
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
            {/* Show registration form if no employee or not in date/shift selection */}
            {(!currentEmployee || registrationStep === 'registration') && (
              <EmployeeRegistration
                onRegister={handleRegistration}
                existingEmployee={currentEmployee}
                onExistingEmployee={handleExistingEmployee}
              />
            )}
            
            {/* Show shift registration if employee exists and is approved */}
            {currentEmployee?.approved && registrationStep !== 'registration' && (
              <>
                <ShiftRegistration
                  employee={currentEmployee}
                  onSubmit={handleShiftSubmit}
                  entries={entries}
                  initialStep={registrationStep}
                  onStepChange={setRegistrationStep}
                />
                <HRDashboard 
                  entries={entries.filter(e => e.employeeId === currentEmployee.id)} 
                  employees={employees}
                  isHR={false}
                />
              </>
            )}

            {/* Show pending approval message if employee exists but is not approved */}
            {currentEmployee && !currentEmployee.approved && (
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