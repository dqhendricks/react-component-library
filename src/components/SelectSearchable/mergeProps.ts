type AnyRecord = Record<string, unknown>;
type AnyFn = (...args: any[]) => any;

function isFn(v: unknown): v is AnyFn {
  return typeof v === "function";
}

function isEventLike(v: unknown): v is { defaultPrevented?: boolean } {
  return !!v && typeof v === "object" && "defaultPrevented" in (v as any);
}

function joinClassNames(a: unknown, b: unknown) {
  const as = typeof a === "string" ? a : "";
  const bs = typeof b === "string" ? b : "";
  const joined = `${as} ${bs}`.trim();
  return joined || undefined;
}

function mergeStyle(a: unknown, b: unknown) {
  const ao = a && typeof a === "object" ? (a as Record<string, unknown>) : null;
  const bo = b && typeof b === "object" ? (b as Record<string, unknown>) : null;
  if (!ao && !bo) return undefined;
  if (!ao) return bo as any;
  if (!bo) return ao as any;

  // User's wins by default
  return { ...bo, ...ao } as any;
}

/**
 * Merges props:
 * - overlapping function props are composed (user first; if event.defaultPrevented, ours won't run)
 * - className is concatenated
 * - style objects are shallow-merged (theirs wins)
 */
export function mergeProps<T extends AnyRecord, U extends AnyRecord>(user: T, ours: U): T & U {
  const out: AnyRecord = { ...user, ...ours };

  // compose functions
  for (const key of Object.keys(user)) {
    if (!(key in ours)) continue;

    const a = (user as AnyRecord)[key];
    const b = (ours as AnyRecord)[key];

    if (isFn(a) && isFn(b)) {
      out[key] = (...args: any[]) => {
        a(...args);
        const first = args[0];
        if (isEventLike(first) && first.defaultPrevented) return;
        b(...args);
      };
    }
  }

  // merge className
  if ("className" in user || "className" in ours) {
    out.className = joinClassNames((user as AnyRecord).className, (ours as AnyRecord).className);
  }

  // merge style
  if ("style" in user || "style" in ours) {
    out.style = mergeStyle((user as AnyRecord).style, (ours as AnyRecord).style);
  }

  return out as T & U;
}