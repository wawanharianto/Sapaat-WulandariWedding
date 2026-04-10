import React from 'react';
import { cn } from '../lib/utils';

export const Ornament = ({ className }: { className?: string }) => (
  <svg className={cn("w-24 h-24 text-gold/30", className)} viewBox="0 0 100 100" fill="currentColor">
    <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 95C25.2 95 5 74.8 5 50S25.2 5 50 5s45 20.2 45 45-20.2 45-45 45z"/>
    <path d="M50 15c-19.3 0-35 15.7-35 35s15.7 35 35 35 35-15.7 35 35-15.7-35-35-35zm0 65c-16.5 0-30-13.5-30-30s13.5-30 30-30 30 13.5 30 30-13.5 30-30 30z"/>
  </svg>
);

export default React.memo(Ornament);
