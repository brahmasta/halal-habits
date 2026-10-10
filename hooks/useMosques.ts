import { useEffect, useState } from 'react';
import { fetchMosques, seedMosques, Mosque } from '../services/places';

export function useMosques() {
  // Curated places render instantly; live rows replace them when the API answers.
  const [data, setData] = useState<Mosque[]>(() => seedMosques());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchMosques()
      .then((m) => alive && setData(m))
      .catch((e) => alive && setError(String(e))) // seed stays in place
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { data, loading, error };
}
