"use client"
import { signOut, useSession } from 'next-auth/react';
import {useEffect} from 'react';
import {redirect} from "next/navigation";

import { ReactNode } from 'react';

interface AuthWatcherProps {
  children: ReactNode;
}

export const AuthWatcher = ({ children }: AuthWatcherProps) => {
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) redirect('/auth/login');

    if((session as any).error === 'jwt-expired') {
      console.log('-- JWT Expired -> logging out');
      signOut();
    }
    
  }, [session, status]);

  return (<>{children}</>)
}
