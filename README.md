# La Quita - Hotel, Lounge & Suites

Welcome to the official repository for the La Quita Hotel & Suites booking website. This project is a modern, full-stack web application built with Next.js and Firebase, designed to provide a seamless booking experience for our guests and a powerful management interface for our staff.

This application was built with the assistance of an AI agent in Firebase Studio.

## Key Features

### For Guests:
-   **Homepage:** A beautiful landing page featuring a hero image, a photo gallery, and a list of available rooms and facilities.
-   **Dynamic Room Details:** View specific room details, amenities, and multiple images.
-   **Secure User Authentication:** Easy sign-up and login using email/password or Google Sign-In.
-   **Online Booking System:** An intuitive booking process with date selection and a multi-option payment interface.
-   **View Bookings:** A dedicated page for logged-in users to view their upcoming and past reservations.

### For Administrators:
-   **Password-Protected Admin Panel:** A secure area for site management.
-   **Content Management:** Admins can create, update, and delete rooms and facilities.
-   **Image Management:** Easily update the hero image, gallery, and room photos by uploading files directly from a device or by pasting an image URL.

## Tech Stack

This project is built with a modern, robust, and scalable tech stack:

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [ShadCN UI](https://ui.shadcn.com/) & [Lucide React](https://lucide.dev/guide/packages/lucide-react) for icons.
-   **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation.
-   **Backend & Database:** [Firebase](https://firebase.google.com/)

## Firebase Services

-   **Firestore:** Used as the primary NoSQL database to store information about rooms, bookings, and site content.
-   **Firebase Authentication:** Handles user sign-up, login, and session management.
-   **Cloud Storage for Firebase:** Manages uploads and storage for all images used on the site.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/your-repo-name.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd your-repo-name
    ```
3.  **Install NPM packages:**
    ```sh
    npm install
    ```
4.  **Set up environment variables:**
    This project uses Firebase. The necessary client-side keys and server-side credentials are already included in `src/lib/firebase.ts` and `src/lib/firebase-admin.ts`. No `.env` file is required for the initial setup.

5.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

6.  **Accessing the Admin Panel:**
    The admin panel is located at `/admin`. The password is `38448674`, which can be found and changed in `src/app/admin/page.tsx`.
