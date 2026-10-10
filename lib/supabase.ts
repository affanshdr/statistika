import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tmdbqikqflbeqaqllxge.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZGJxaWtxZmxiZXFhcWxseGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyODY1NTcsImV4cCI6MjA5NTg2MjU1N30.vdDVbecc5S4R2WbX1RuZBoRJP9dcBvhOrBPEtvSa27Q'

/**
 * Browser-side Supabase client.
 * Only use on the client (not in API routes — those use Prisma directly).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 20, // max 20 broadcast events/s per client
    },
  },
})
