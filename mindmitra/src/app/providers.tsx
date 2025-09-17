"use client";
import { PropsWithChildren } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

export default function Providers({ children }: PropsWithChildren) {
  const supabase = createClient();
  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
}

