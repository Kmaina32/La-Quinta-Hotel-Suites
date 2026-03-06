'use client';

import { useAuth } from '@/hooks/use-auth';
import { useSearchParams } from 'next/navigation';
import { User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export default function AdminHeader() {
  const searchParams = useSearchParams();
  const { role, user, isAdmin } = useAuth();
  const activeTab = searchParams.get('tab') || 'analytics';

  if (!isAdmin) return null;

  const tabLabels: Record<string, string> = {
    analytics: 'Dashboard Analytics',
    content: 'Site Content',
    rooms: 'Rooms & Facilities',
    transactions: 'Bookings & Payments',
    users: 'User Management',
    messages: 'Guest Inquiries',
    settings: 'General Settings',
  };

  return (
    <header className="sticky top-4 z-40">
      <div className="flex justify-between items-center h-20 bg-background/80 backdrop-blur-md border rounded-[2rem] shadow-lg px-8">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Admin Control</span>
          <h1 className="text-2xl font-black tracking-tight">
            {tabLabels[activeTab] || 'Control Panel'}
          </h1>
        </div>
        
        <div className="flex items-center gap-4 bg-muted/30 p-1.5 rounded-full pl-6 border border-border/50">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <p className="text-sm font-bold">{user?.displayName || 'Admin'}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-70">{role}</p>
          </div>
          <Avatar className="h-12 w-12 border-2 border-background shadow-md">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              {user?.displayName?.[0]?.toUpperCase() || <UserIcon className="h-6 w-6" />}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
