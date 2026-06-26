
'use client'
import { Suspense } from 'react';
import BookNow from './BookNow';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookNow />
    </Suspense>
  );
}