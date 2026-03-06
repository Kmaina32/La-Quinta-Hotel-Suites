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
    analytics: 'Performance & Growth',
    content: 'Media & Branding',
    rooms: 'Inventory & Units',
    transactions: 'Financial Control',
    users: 'Team & Directory',
    messages: 'Customer Inquiries',
    settings: 'Global Configuration',
  };

  return (
    <header className="sticky top-4 z-40 mb-2">
      <div className="flex justify-between items-center h-16 bg-background/80 backdrop-blur-md border rounded-[1.5rem] shadow-xl px-6 lg:px-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">Master Control</span>
          <h1 className="text-xl font-black tracking-tighter leading-none mt-0.5">
            {tabLabels[activeTab] || 'Control Panel'}
          </h1>
        </div>
        
        <div className="flex items-center gap-3 bg-muted/30 p-1 rounded-full pl-4 border border-border/50 shadow-inner">
          <div className="hidden sm:flex flex-col items-end leading-tight pr-1">
            <p className="text-xs font-black tracking-tight">{user?.displayName || 'Admin'}</p>
            <p className="text-[9px] text-primary uppercase font-black tracking-widest opacity-70">{role}</p>
          </div>
          <Avatar className="h-10 w-10 border-2 border-background shadow-md">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs">
              {user?.displayName?.[0]?.toUpperCase() || <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
