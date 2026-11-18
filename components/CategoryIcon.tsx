'use client';

import { DynamicIcon, type IconName } from 'lucide-react/dynamic';

/** Category icons are stored by lucide name in the catalog (e.g. "chart-no-axes-combined"). */
export function CategoryIcon({ name }: { name: string }) {
  return <DynamicIcon name={name as IconName} size={18} strokeWidth={1.5} />;
}
