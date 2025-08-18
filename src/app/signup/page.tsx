
'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { signup, type AuthState } from '@/app/auth-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating Account...' : 'Create an account'}
    </Button>
  );
}

export default function SignupPage() {
  const initialState: AuthState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(signup, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <Card className="mx-auto max-w-sm">
        <form action={dispatch}>
          <CardHeader>
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {state.errors?.general && (
              <div className="text-sm font-medium text-destructive">
                {state.errors.general.join(', ')}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
              {state.errors?.email && (
                  <p className="text-sm font-medium text-destructive">
                    {state.errors.email.join(', ')}
                  </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" required />
               {state.errors?.password && (
                  <p className="text-sm font-medium text-destructive">
                    {state.errors.password.join(', ')}
                  </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
             <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

