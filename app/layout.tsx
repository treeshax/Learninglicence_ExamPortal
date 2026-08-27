import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'LL Proctor | Demo', description: 'Reliable learner licence examination demo' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
