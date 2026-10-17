import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client";

export function useApi(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (options) => {
      const silent = Boolean(options?.silent);
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const result = await apiClient(endpoint);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load data");
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [endpoint],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
