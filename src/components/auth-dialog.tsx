
'use client';

import { useState, useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { login, signup, type AuthState } from '@/app/auth-actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

function SubmitButton({ isLogin }: { isLogin: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (isLogin ? 'Logging in...' : 'Creating Account...') : (isLogin ? 'Login' : 'Create an account')}
    </Button>
  );
}

export default function AuthDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Reset initial state to avoid carrying over old errors
  const loginInitialState: AuthState = { message: null, errors: {} };
  const signupInitialState: AuthState = { message: null, errors: {} };
  
  const [loginState, loginAction] = useActionState(login, loginInitialState);
  const [signupState, signupAction] = useActionState(signup, signupInitialState);
  
  useEffect(() => {
    // If the user is successfully authenticated (either by login or signup),
    // and the dialog is open, close it and redirect.
    if (user && open) {
        setOpen(false);
        router.push('/bookings');
    }
  }, [user, open, router]);

  // This effect handles closing the dialog ONLY if the auth state becomes successful.
  // The redirection is now implicitly handled by the parent context detecting the user change.
  useEffect(() => {
    if (loginState.success || signupState.success) {
      if (open) {
        // The onAuthStateChanged listener in AuthProvider will pick up the change,
        // update the `user` context, and the effect above will trigger the redirect.
        setOpen(false);
      }
    }
  }, [loginState.success, signupState.success, open]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">Login</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <DialogHeader>
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
             <DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}
