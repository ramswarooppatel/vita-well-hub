
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with Admin permissions
    // Environment variables must be set in your Supabase project
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || '',
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ''
    );

    // Extract authorization header for user validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Verify the user has admin rights
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (userError || !user) {
      throw new Error('Unauthorized access');
    }

    // Get user role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileData?.role !== 'admin') {
      throw new Error('Admin privileges required');
    }

    // Get requested stats type from the query params
    const url = new URL(req.url);
    const statType = url.searchParams.get('type') || 'all';
    
    let result = {};
    
    // Fetch stats based on the requested type
    switch(statType) {
      case 'users_by_role':
        result = await getUsersByRole(supabase);
        break;
      case 'appointment_status':
        result = await getAppointmentStatusCounts(supabase);
        break;
      case 'test_categories':
        result = await getTestCategoryCounts(supabase);
        break;
      case 'activity':
        const days = Number(url.searchParams.get('days')) || 30;
        result = await getActivityData(supabase, days);
        break;
      case 'all':
      default:
        result = await getAllStats(supabase);
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Error in get-user-stats function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
});

// Get users grouped by role
async function getUsersByRole(supabase) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role');
    
  if (error) throw error;
  
  // Count occurrences of each role
  const roleCounts = {};
  data.forEach(profile => {
    const role = profile.role || 'unknown';
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });
  
  // Format for chart display
  return Object.entries(roleCounts).map(([role, count]) => ({
    role,
    count,
  }));
}

// Get appointment counts by status
async function getAppointmentStatusCounts(supabase) {
  const { data, error } = await supabase
    .from('appointments')
    .select('status');
    
  if (error) throw error;
  
  // Count occurrences of each status
  const statusCounts = {};
  data.forEach(appointment => {
    const status = appointment.status || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  // Format for chart display
  return Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));
}

// Get tests counts by category
async function getTestCategoryCounts(supabase) {
  const { data, error } = await supabase
    .from('cognitive_tests')
    .select('category');
    
  if (error) throw error;
  
  // Count occurrences of each category
  const categoryCounts = {};
  data.forEach(test => {
    const category = test.category || 'unknown';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  // Format for chart display
  return Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
  }));
}

// Get activity data over time
async function getActivityData(supabase, days) {
  // This would need a more complex aggregation in a real-world implementation
  // Here we'll generate representative data
  
  // In a real implementation, use SQL like:
  /*
  const { data, error } = await supabase.rpc('get_daily_activity_counts', {
    days_back: days
  });
  */
  
  // For now, return placeholder data
  const result = [];
  const today = new Date();
  
  for (let i = days-1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate realistic looking data with some randomness
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const multiplier = isWeekend ? 0.6 : 1;
    
    result.push({
      date: dateStr,
      logins: Math.floor((10 + Math.random() * 15) * multiplier),
      appointments: Math.floor((5 + Math.random() * 8) * multiplier),
      tests: Math.floor((3 + Math.random() * 6) * multiplier),
    });
  }
  
  return result;
}

// Get all summary statistics
async function getAllStats(supabase) {
  // Get basic counts
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();
  
  // Could use Promise.all for better performance in a real app
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
    
  const { count: newUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgoStr);
    
  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true });
    
  const { count: pendingAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled');
    
  const { count: totalTests } = await supabase
    .from('cognitive_tests')
    .select('*', { count: 'exact', head: true });
    
  const { count: totalTestResults } = await supabase
    .from('test_results')
    .select('*', { count: 'exact', head: true });
    
  const { count: totalRecords } = await supabase
    .from('medical_records')
    .select('*', { count: 'exact', head: true });
    
  const { count: totalLogs } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true });
  
  return {
    totalUsers: totalUsers || 0,
    newUsers: newUsers || 0,
    totalAppointments: totalAppointments || 0,
    pendingAppointments: pendingAppointments || 0,
    totalTests: totalTests || 0,
    totalTestResults: totalTestResults || 0,
    totalRecords: totalRecords || 0,
    totalLogs: totalLogs || 0,
  };
}
