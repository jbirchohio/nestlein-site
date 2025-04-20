'use client';

export default function HomeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-10">
      {children}
    </div>
  );
}
