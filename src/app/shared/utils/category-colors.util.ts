const DEFAULT_CATEGORY_PALETTE = [
  'bg-red-500', 'bg-orange-700', 'bg-violet-500', 'bg-blue-500',
  'bg-teal-600', 'bg-pink-500', 'bg-slate-400'
];

const DEFAULT_CATEGORY_TEXT_PALETTE = [
  'text-red-500', 'text-orange-700', 'text-violet-500', 'text-blue-500',
  'text-teal-600', 'text-pink-500', 'text-slate-400'
];

function buildMap(categories: string[], palette: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  let i = 0;
  for (const c of categories) {
    if (!(c in map)) map[c] = palette[i++ % palette.length];
  }
  return map;
}

export function buildCategoryColorMap(categories: string[], palette: string[] = DEFAULT_CATEGORY_PALETTE): Record<string, string> {
  return buildMap(categories, palette);
}

export function buildCategoryTextColorMap(categories: string[], palette: string[] = DEFAULT_CATEGORY_TEXT_PALETTE): Record<string, string> {
  return buildMap(categories, palette);
}
