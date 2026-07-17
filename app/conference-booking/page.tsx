import type { Metadata } from 'next';
import { Suspense } from 'react';
import ConferenceBookNow from './conferencebooknow';

export const metadata: Metadata = {
  title: 'Book Conference Facilities',
  description:
    'Reserve conference and event facilities at Equator Christian Retreat & Conference Centre in Gambogi, Vihiga County, Kenya. Ideal for church events, seminars, and corporate meetings.',
  alternates: {
    canonical: '/conference-booking',
  },
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConferenceBookNow />
    </Suspense>
  );
}