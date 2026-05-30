import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pcwqetnwnfczjsodzopb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjd3FldG53bmZjempzb2R6b3BiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDI0NDQsImV4cCI6MjA5NTI3ODQ0NH0.iIyeGz-pobCJfUHsUZJUQDulKIImIj4lc9WT5VU3YMc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
