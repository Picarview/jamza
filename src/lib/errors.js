export function explain(error) {
  if (['42P01', 'PGRST205', 'PGRST202'].includes(error.code)) {
    return 'Database setup is required. Run supabase/migrations/20261101000000_initial_schema.sql in the Supabase SQL Editor.';
  }
  if (error.code === 'PGRST116') {
    return 'This item changed or access was denied. Refresh the dashboard before trying again.';
  }
  return error.message || 'The request failed. Please try again.';
}
