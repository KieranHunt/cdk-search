import { useEffect } from "react";

/**
 * Reads a URL query parameter once on mount and returns its value.
 *
 * The parameter is stripped from the browser address bar immediately after
 * the first render via `history.replaceState`, so the URL stays clean and
 * a page refresh will not re-apply the value.
 *
 * Intended for one-shot "deep-link" scenarios where you want to
 * prepopulate UI state from a shared URL without persisting the
 * parameter beyond the initial load.
 *
 * @param key - The query parameter name to read (e.g. `"q"`).
 * @returns The parameter value, or `null` if it was not present.
 *
 * @example
 * ```tsx
 * const initialQuery = useQueryParam("q");
 * const [query, setQuery] = useState(initialQuery ?? "");
 * ```
 */
export const useQueryParam = (key: string): string | null => {
	const value = new URLSearchParams(window.location.search).get(key);

	useEffect(() => {
		if (value === null) return;
		const url = new URL(window.location.href);
		url.searchParams.delete(key);
		window.history.replaceState({}, "", url.pathname + url.search);
	}, [key, value]);

	return value;
};
