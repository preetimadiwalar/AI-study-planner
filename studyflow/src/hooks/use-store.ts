import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * `useStore(selector)` is a thin wrapper around React Query that:
 *   - Calls the async selector and returns its resolved value (or a fallback while loading)
 *   - Invalidates on Supabase auth changes
 *
 * The selector should be a stable closure that captures the current user id.
 * Pass a `key` array so caches are scoped properly.
 */
export function useStore<T>(
  key: ReadonlyArray<unknown>,
  selector: () => Promise<T>,
  fallback: T,
): T {
  const qc = useQueryClient();

  // Invalidate everything on sign-in / sign-out so stale data clears.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      qc.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [qc]);

  const { data } = useQuery<T>({
    queryKey: key as unknown[],
    queryFn: selector,
    staleTime: 5_000,
  });

  return (data ?? fallback) as T;
}
