const DEFAULT_CATEGORY_PALETTE = [
  'bg-red-500', 'bg-orange-700', 'bg-violet-500', 'bg-blue-500',
  'bg-teal-600', 'bg-pink-500', 'bg-slate-400'
];

/** Assigns a stable Tailwind color class to each distinct category, in first-seen order. */
export function buildCategoryColorMap(categories: string[], palette: string[] = DEFAULT_CATEGORY_PALETTE): Record<string, string> {
  const map: Record<string, string> = {};
  let i = 0;
  for (const c of categories) {
    if (!(c in map)) map[c] = palette[i++ % palette.length];
  }
  return map;
}
