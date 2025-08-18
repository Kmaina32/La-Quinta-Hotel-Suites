
'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login, signup, type AuthState } from '@/app/auth-actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [loginState, loginAction] = useActionState(login, { message: null, errors: {} });
  const [signupState, signupAction] = useActionState(signup, { message: null, errors: {} });


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
