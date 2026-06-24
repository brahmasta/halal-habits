import { useEffect, useState } from 'react';
import { fetchMosques, Mosque } from '../services/places';

export function useMosques() {
  const [data, setData] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchMosques()
      .then((m) => alive && setData(m))
      .catch((e) => alive && setError(String(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { data, loading, error };
}
