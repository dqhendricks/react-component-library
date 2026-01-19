type AnyRecord = Record<string, unknown>;
type AnyFn = (...args: unknown[]) => unknown;

function isFn(v: unknown): v is AnyFn {
  return typeof v === "function";
}

function isEventLike(v: unknown): v is { defaultPrevented?: boolean } {
  if (!v || typeof v !== "object") return false;
  return "defaultPrevented" in (v as Record<string, unknown>);
}

function joinClassNames(a: unknown, b: unknown): string | undefined {
  const as = typeof a === "string" ? a : "";
  const bs = typeof b === "string" ? b : "";
  const joined = `${as} ${bs}`.trim();
  return joined || undefined;
}

function mergeStyle(a: unknown, b: unknown): unknown | undefined {
  const ao = a && typeof a === "object" ? (a as Record<string, unknown>) : null;
  const bo = b && typeof b === "object" ? (b as Record<string, unknown>) : null;
  if (!ao && !bo) return undefined;
  if (!ao) return bo;
  if (!bo) return ao;

  // User's wins by default
  return { ...bo, ...ao };
}

/**
 * Merges props:
 * - overlapping function props are composed (user first; if event.defaultPrevented, ours won't run)
 * - className is concatenated
 * - style objects are shallow-merged (theirs wins)
 */
export function mergeProps<T extends AnyRecord, U extends AnyRecord>(user: T, ours: U): T & U {
  const out: AnyRecord = { ...user, ...ours };

  for (const key of Object.keys(user)) {
    if (!(key in ours)) continue;

    const a = user[key];
    const b = ours[key];

    if (isFn(a) && isFn(b)) {
      out[key] = (...args: unknown[]) => {
        a(...args);
        const first = args[0];
        if (isEventLike(first) && first.defaultPrevented) return;
        b(...args);
      };
    }
  }

  if ("className" in user || "className" in ours) {
    out.className = joinClassNames(user.className, ours.className);
  }

  if ("style" in user || "style" in ours) {
    out.style = mergeStyle(user.style, ours.style);
  }

  return out as T & U;
}