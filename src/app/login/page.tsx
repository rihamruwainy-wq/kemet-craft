'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
      prompt: 'select_account',
    },
      },
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-8 shadow-sm text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">KemetCraft</h1>
          <p className="text-sm text-slate-500">Sign in to continue</p>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition cursor-pointer"
        >
          Continue with Google
        </button>
      </div>
    </main>
  )
}