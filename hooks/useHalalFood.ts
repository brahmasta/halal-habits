import { useEffect, useState } from 'react';
import { fetchHalalFood, seedFood, HalalItem } from '../services/places';

export function useHalalFood() {
  // Curated spots render instantly; live rows replace them when the API answers.
  const [data, setData] = useState<HalalItem[]>(() => seedFood());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchHalalFood()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(String(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { data, loading, error };
}
