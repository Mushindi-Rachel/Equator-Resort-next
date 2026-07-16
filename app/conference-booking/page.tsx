'use client'
import { Suspense } from 'react';
import ConferenceBookNow from './conferencebooknow';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConferenceBookNow />
    </Suspense>
  );
}