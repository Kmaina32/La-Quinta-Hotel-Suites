import Footer from '@/components/footer';
import Header from '@/components/header';
import SupportForm from './support-form';

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-16">
          <div className="mb-8 text-center">
            <h1 className="font-headline text-4xl font-bold">AI-Powered Support</h1>
            <p className="mt-2 text-muted-foreground">
              Have a question about your booking? Provide your booking details and inquiry below, and our AI assistant will help you.
            </p>
          </div>
          <SupportForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
