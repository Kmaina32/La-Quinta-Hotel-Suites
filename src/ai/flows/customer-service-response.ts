'use server';

/**
 * @fileOverview AI-powered customer service response flow.
 *
 * - generateCustomerServiceResponse - A function that generates responses to customer inquiries using booking details.
 * - CustomerServiceInput - The input type for the generateCustomerServiceResponse function.
 * - CustomerServiceOutput - The return type for the generateCustomerServiceResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomerServiceInputSchema = z.object({
  bookingDetails: z.string().describe('The details of the booking.'),
  customerInquiry: z.string().describe('The customer inquiry about the booking.'),
});
export type CustomerServiceInput = z.infer<typeof CustomerServiceInputSchema>;

const CustomerServiceOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the customer inquiry.'),
});
export type CustomerServiceOutput = z.infer<typeof CustomerServiceOutputSchema>;

export async function generateCustomerServiceResponse(input: CustomerServiceInput): Promise<CustomerServiceOutput> {
  return customerServiceResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customerServicePrompt',
  input: {schema: CustomerServiceInputSchema},
  output: {schema: CustomerServiceOutputSchema},
  prompt: `You are an AI-powered customer service agent for La Quita Hotel & Suites in Nakuru.

You will use the provided booking details to answer the customer inquiry.

Booking Details: {{{bookingDetails}}}
Customer Inquiry: {{{customerInquiry}}}

Response:`,
});

const customerServiceResponseFlow = ai.defineFlow(
  {
    name: 'customerServiceResponseFlow',
    inputSchema: CustomerServiceInputSchema,
    outputSchema: CustomerServiceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
