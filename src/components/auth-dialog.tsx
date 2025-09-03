
'use client';

import { useState, useActionState, useEffect, ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { login, signup, type AuthState } from '@/app/auth-actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { config } from '@/lib/config';
import Image from 'next/image';

function SubmitButton({ isLogin }: { isLogin: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (isLogin ? 'Logging in...' : 'Creating Account...') : (isLogin ? 'Login' : 'Create an account')}
    </Button>
  );
}

export default function AuthDialog({ children, open, onOpenChange, onAuthSuccess }: { children: ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void, onAuthSuccess?: () => void }) {
  const router = useRouter();

  const loginInitialState: AuthState = { message: null, errors: {} };
  const signupInitialState: AuthState = { message: null, errors: {} };
  
  const [loginState, loginAction] = useActionState(login, loginInitialState);
  const [signupState, signupAction] = useActionState(signup, signupInitialState);

  useEffect(() => {
    if (loginState.success || signupState.success) {
      if (onAuthSuccess) {
        onAuthSuccess();
      } else {
        router.refresh(); 
        router.push('/bookings');
      }
      if(onOpenChange) {
        onOpenChange(false);
      }
    }
  }, [loginState.success, signupState.success, onAuthSuccess, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0">
        <div className="relative h-48 w-full">
            <Image 
                src={config.authImageUrl}
                alt="Authentication background"
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
                data-ai-hint="hotel interior"
            />
        </div>
        <div className="p-6">
            <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <DialogHeader className="mt-4">
                <DialogTitle>Login</DialogTitle>
                <DialogDescription>
                    Enter your email below to login to your account.
                </DialogDescription>
                </DialogHeader>
                <form action={loginAction} className="grid gap-4 py-4">
                {loginState.errors?.general && (
                    <div className="text-sm font-medium text-destructive">
                    {loginState.errors.general.join(', ')}
                    </div>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input
                    id="email-login"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    required
                    />
                    {loginState.errors?.email && (
                        <p className="text-sm font-medium text-destructive">
                        {loginState.errors.email.join(', ')}
                        </p>
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password-login">Password</Label>
                    <Input id="password-login" type="password" name="password" required />
                    {loginState.errors?.password && (
                        <p className="text-sm font-medium text-destructive">
                        {loginState.errors.password.join(', ')}
                        </p>
                    )}
                </div>
                <SubmitButton isLogin={true} />
                </form>
            </TabsContent>
            <TabsContent value="signup">
                <DialogHeader className="mt-4">
                <DialogTitle>Sign Up</DialogTitle>
                <DialogDescription>
                    Enter your information to create an account
                </DialogDescription>
                </DialogHeader>
                <form action={signupAction} className="grid gap-4 py-4">
                {signupState.errors?.general && (
                    <div className="text-sm font-medium text-destructive">
                    {signupState.errors.general.join(', ')}
                    </div>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input
                    id="email-signup"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    required
                    />
                    {signupState.errors?.email && (
                        <p className="text-sm font-medium text-destructive">
                        {signupState.errors.email.join(', ')}
                        </p>
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input id="password-signup" type="password" name="password" required />
                    {signupState.errors?.password && (
                        <p className="text-sm font-medium text-destructive">
                        {signupState.errors.password.join(', ')}
                        </p>
                    )}
                </div>
                <SubmitButton isLogin={false} />
                </form>
            </TabsContent>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
