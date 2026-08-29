import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sdnimomiabxddwkcadyt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbmltb21pYWJ4ZGR3a2NhZHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0ODYzMzgsImV4cCI6MjEwMzA2MjMzOH0.RTjXtKPiqv3utS0RZL0mFlrUss1LPIoGKpXR1d-ov5A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);