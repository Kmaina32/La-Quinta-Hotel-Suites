'use server';

import { z } from 'zod';
import { generateCustomerServiceResponse } from '@/ai/flows/customer-service-response';

const FormSchema = z.object({
  bookingDetails: z.string().min(10, { message: 'Please provide more booking details.' }),
  customerInquiry: z.string().min(10, { message: 'Please provide a more detailed inquiry.' }),
});

export type State = {
  errors?: {
    bookingDetails?: string[];
    customerInquiry?: string[];
  };
  message?: string | null;
  response?: string | null;
};

export async function generateResponse(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = FormSchema.safeParse({
    bookingDetails: formData.get('bookingDetails'),
    customerInquiry: formData.get('customerInquiry'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to process request. Please check your inputs.',
    };
  }

  try {
    const result = await generateCustomerServiceResponse(validatedFields.data);
    return {
      message: 'Response generated successfully.',
      response: result.response,
    };
  } catch (error) {
    return {
      message: 'An error occurred while generating the response. Please try again.',
    };
  }
}
