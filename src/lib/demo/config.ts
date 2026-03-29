/**
 * Demo Mode Configuration
 *
 * When NEXT_PUBLIC_DEMO_MODE=true, the app runs entirely without Supabase.
 * All data is mocked client-side. This is used for the job case demo
 * so the evaluator can navigate the full flow without a backend.
 *
 * To enable: set NEXT_PUBLIC_DEMO_MODE=true in .env.local (or Vercel env vars)
 * To disable: remove or set to false
 */
export const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
