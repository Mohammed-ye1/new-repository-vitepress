import { supabase } from './supabase';
import type { Employee } from '../types';

export async function checkExistingEmployee(employeeId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, is_approved')
      .eq('id', employeeId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking existing employee:', error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error checking existing employee:', error);
    return null;
  }
}

export async function registerEmployee(employeeData: {
  id: string;
  fullName: string;
  department: string;
  section?: string;
}) {
  try {
    // First check if employee already exists
    const existingEmployee = await checkExistingEmployee(employeeData.id);
    if (existingEmployee) {
      return { success: false, error: { message: 'Employee already exists' } };
    }

    // Create profile first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: employeeData.id,
        full_name: employeeData.fullName,
        department: employeeData.department,
        section: employeeData.section,
        role: 'employee',
        is_approved: false
      }])
      .select()
      .single();

    if (profileError) {
      if (profileError.code === '23505') { // Duplicate key error
        return { success: false, error: { message: 'Employee ID already exists' } };
      }
      console.error('Error creating profile:', profileError);
      return { success: false, error: profileError };
    }

    // Generate credentials
    const email = `${employeeData.id.toLowerCase()}@company.com`;
    const password = `${employeeData.id}@123`; // Default password format

    return { 
      success: true, 
      profile,
      credentials: {
        email,
        password
      }
    };
  } catch (error) {
    console.error('Error in registration:', error);
    return { success: false, error };
  }
}

export async function signIn(employeeId: string, password: string) {
  try {
    const email = `${employeeId.toLowerCase()}@company.com`;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error signing in:', error);
      return { success: false, error };
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', employeeId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return { success: false, error: profileError };
    }

    return {
      success: true,
      user: data.user,
      profile
    };
  } catch (error) {
    console.error('Error in sign in:', error);
    return { success: false, error };
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    return { success: false, error };
  }
  return { success: true };
}