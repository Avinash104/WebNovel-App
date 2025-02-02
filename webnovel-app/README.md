# Webnovel App

**A platform for reading, writing, and sharing web novels.**

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [License](#license)

---

## About the Project

The **Webnovel App** aims to make sharing and monetizing web novels easier and more accessible than platforms like Patreon, which aren't tailored for this niche. This app provides tools for both novice writers and avid readers to enjoy and support creative works.

---

## Features

### For Authors:

- **Story Creation**: Create stories with chapters.
- **Chapter Management**: Add, edit, and manage chapters with a rich text editor.
- **Monetization**:
  - Set up subscription tiers with customizable access to advanced chapters.
  - Sell complete story bundles via the author’s store.
- **File Uploads**: Upload images and PDFs for richer story content.

### For Readers:

- **Subscription System with Stripe**: Subscribe to individual stories and access advanced chapters.
- **Stripe Webhook Implementation**: Subscription and purchases can reply on stripe webhook for payment confirmation, creating a reliable and failsafe method to pay online.
- **Support Authors**: Buy early access and directly support your favorite authors.

### General:

- **User Authentication**: Powered by Clerk for secure login and account management.
- **Modern UI**: Built with Tailwind CSS and Shadcn UI for a responsive and clean design.
- **Drag-and-Drop Features**: For chapter sequencing and management.

---

## Tech Stack

- **Frontend**: Next.js (React), TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Prisma ORM, Supabase (SQL Database)
- **Authentication**: Clerk
- **Rich Text Editor**: TipTap
- **Image & File Uploads**: Cloudinary
- **Validation**: React Hook Form, Zod
- **HTTP Requests**: Axios

---

## Installation

Follow these steps to set up the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/Avinash104/WebNovel-App.git
   ```
2. Navigate into the project directory:
   ```bash
   cd webnovel-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Initialize Prisma:
   ```bash
   npx prisma init
   npx prisma generate
   npx prisma db push
   ```

---

## Environment Variables

Create a `.env` file in the root directory of your project and configure the following environment variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
DATABASE_URL=""
```

Ensure you have the required API keys for **Clerk**, **Cloudinary**, and your **Supabase Database**.

---

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

---

## License

---

---
