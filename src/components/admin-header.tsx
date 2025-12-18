
'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Logo } from './logo';
import { LogOut, Home, MessageSquare, Image as ImageIcon, Building2, CreditCard, Settings, Menu, X, User as UserIcon, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAdmin, logoutAdmin, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const activeTab = searchParams.get('tab') || 'analytics';

  const handleSignOut = async () => {
    logoutAdmin();
    router.push('/admin'); 
  };

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathname}?${params.toString()}`);
    setIsMenuOpen(false);
  };

  const navLinks = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['owner', 'admin'] },
    { id: 'content', label: 'Content', icon: ImageIcon, roles: ['owner', 'admin'] },
    { id: 'rooms', label: 'Rooms', icon: Building2, roles: ['owner', 'admin'] },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, roles: ['owner', 'admin', 'manager'] },
    { id: 'users', label: 'Users', icon: UserIcon, roles: ['owner', 'admin'] },
    { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['owner', 'admin', 'manager'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['owner'] },
  ].filter(link => role && link.roles.includes(role));

  return (
    <header className="sticky top-0 z-50 p-2 md:p-3">
      <div className="container mx-auto flex justify-between items-center h-16 bg-background/80 backdrop-blur-sm border rounded-xl shadow-lg px-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo className="h-10 w-40 text-primary" />
             <span className="font-semibold text-lg hidden sm:inline border-l pl-4">Admin Panel</span>
          </Link>
          {isAdmin && (
            <nav className="hidden md:flex items-center gap-1 rounded-lg p-1 bg-muted">
              {navLinks.map(link => (
                <Button
                  key={link.id}
                  variant={activeTab === link.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTab(link.id)}
                  className={cn("transition-all", activeTab === link.id && 'shadow-sm')}
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Button>
              ))}
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="ghost" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">View Site</span>
              </Link>
            </Button>
          {isAdmin && (
            <>
              <div className="hidden md:flex">
                <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
              </div>
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
       {isMenuOpen && isAdmin && (
        <div className="md:hidden absolute top-[calc(100%-0.5rem)] right-0 w-1/2 px-2 z-40">
          <div className="bg-background/95 backdrop-blur-sm border rounded-xl shadow-lg">
            <nav className="flex flex-col items-center gap-2 py-6">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => setTab(link.id)}
                  className={cn(
                    'flex items-center w-full justify-center text-lg transition-colors p-2',
                    activeTab === link.id
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-primary'
                  )}
                >
                  <link.icon className="mr-2 h-5 w-5" />
                  {link.label}
                </button>
              ))}
              <div className="border-t w-full my-2" />
              <Button
                variant="ghost"
                className="w-full text-lg text-muted-foreground hover:text-primary"
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
