
'use server';

import { z } from 'zod';
import { auth } from '@/lib/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    AuthError
} from 'firebase/auth';
import { redirect } from 'next/navigation';

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: 'Password cannot be empty.' }),
});

export type AuthState = {
  errors?: {
    email?: string[];
    password?: string[];
    general?: string[];
  };
  message?: string | null;
};

function handleAuthError(error: AuthError): AuthState {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return { errors: { email: ['This email is already in use.'] } };
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
             return { errors: { general: ['Invalid email or password.'] } };
        case 'auth/weak-password':
            return { errors: { password: ['The password is too weak.'] } };
        default:
            return { errors: { general: ['An unexpected error occurred. Please try again.'] } };
    }
}


export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = SignupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (e) {
    return handleAuthError(e as AuthError);
  }
  
  redirect('/bookings');
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
     return handleAuthError(e as AuthError);
  }
  
  redirect('/bookings');
}
