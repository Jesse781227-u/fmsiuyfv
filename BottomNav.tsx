import { Link, useLocation } from 'wouter';
import { Home, MessageCircle, Star, User, Shield, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/session';

const BASE_NAV_ITEMS = [
  { href: '/',         icon: Home,          label: 'Home',     testId: 'nav-home'    },
  { href: '/private',  icon: MessageCircle, label: 'Private',  testId: 'nav-private' },
  { href: '/priority', icon: Star,          label: 'Priority', testId: 'nav-priority' },
  { href: '/profile',  icon: User,          label: 'Profile',  testId: 'nav-profile' },
];

export function BottomNav() {
  const [location] = useLocation();
  const [isAdmin, setIsAdmin] = useState(sessionStorage.getItem('fms_admin') === 'therapist2024');
  const [isMatchmaking, setIsMatchmaking] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsAdmin(sessionStorage.getItem('fms_admin') === 'therapist2024');
      const user = getSession();
      setIsMatchmaking(user?.plan === 'matchmaking');
    };
    window.addEventListener('storage', check);
    check();
    return () => window.removeEventListener('storage', check);
  }, [location]);

  const items = [...BASE_NAV_ITEMS];
  if (isMatchmaking) {
    items.splice(2, 0, { href: '/matchmaking', icon: Heart, label: 'Match', testId: 'nav-matchmaking' });
  }
  if (isAdmin) {
    items.push({ href: '/admin', icon: Shield, label: 'Admin', testId: 'nav-admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-accent/20 flex items-stretch z-40 safe-area-inset-bottom">
      {items.map(item => {
        const active = location === item.href;
        return (
          <Link key={item.href} href={item.href} className="flex-1">
            <div className={cn('w-full h-full flex flex-col items-center justify-center gap-0.5 transition-colors relative', active ? 'text-primary' : 'text-primary/35 hover:text-primary/60')} data-testid={item.testId}>
              <item.icon className={cn('w-5 h-5', active && 'stroke-[2.5px]')} />
              <span className={cn('text-[10px] font-medium', active && 'text-primary')}>{item.label}</span>
              {active && <span className="absolute bottom-0 w-4 h-0.5 bg-accent rounded-t-full" />}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
