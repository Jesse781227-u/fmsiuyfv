import { useLocation } from 'wouter';

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
      <span className="text-5xl opacity-30">🕊️</span>
      <h1 className="font-serif text-2xl text-primary">Page Not Found</h1>
      <p className="text-sm text-primary/50">This page doesn't exist, Sister.</p>
      <button onClick={() => setLocation('/')} className="bg-primary text-accent px-6 py-2.5 rounded-xl font-serif hover:bg-primary/90 transition-colors">
        Go Home
      </button>
    </div>
  );
}
