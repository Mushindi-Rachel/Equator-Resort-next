
import type { Metadata } from 'next';
import { Suspense } from 'react';
import BookNow from './BookNow';

export const metadata: Metadata = {
  title: 'Book a Room',
  description:
    'Book your stay at Equator Christian Retreat & Conference Centre in Gambogi, Vihiga County, Kenya. Choose from Standard, Deluxe, and Executive rooms.',
  alternates: {
    canonical: '/booking',
  },
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookNow />
    </Suspense>
  );
}