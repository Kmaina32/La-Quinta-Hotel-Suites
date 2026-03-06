
'use client';

import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { BarChart3, Building2, CreditCard, Home, Image as ImageIcon, LogOut, MessageSquare, Settings, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from './ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAdmin, logoutAdmin, role, loading: authLoading } = useAuth();

  const activeTab = searchParams.get('tab') || 'analytics';

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  const navLinks = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['owner', 'admin'] },
    { id: 'content', label: 'Content', icon: ImageIcon, roles: ['owner', 'admin'] },
    { id: 'rooms', label: 'Rooms', icon: Building2, roles: ['owner', 'admin', 'manager'] },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, roles: ['owner', 'admin', 'manager'] },
    { id: 'users', label: 'Users', icon: UserIcon, roles: ['owner', 'admin'] },
    { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['owner', 'admin', 'manager'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['owner'] },
  ].filter(link => !authLoading && role && link.roles.includes(role));

  if (!isAdmin) return null;

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-16 z-50 flex flex-col items-center py-6 bg-background/80 backdrop-blur-md border rounded-[2rem] shadow-xl gap-6">
      <div className="flex flex-col items-center gap-4 w-full px-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/" className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                <Home className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Go to Website</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="w-8 h-px bg-border/50" />
      </div>

      <nav className="flex-1 flex flex-col items-center gap-3 w-full px-2 overflow-y-auto no-scrollbar">
        <TooltipProvider delayDuration={0}>
          {navLinks.map((link) => (
            <Tooltip key={link.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === link.id ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setTab(link.id)}
                  className={cn(
                    "h-10 w-10 rounded-xl transition-all",
                    activeTab === link.id ? 'shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <link.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-semibold">
                {link.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      <div className="flex flex-col items-center gap-4 w-full px-2">
        <div className="w-8 h-px bg-border/50" />
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logoutAdmin}
                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign Out</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
