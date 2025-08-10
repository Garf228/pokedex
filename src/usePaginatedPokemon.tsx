import { useEffect, useState } from "react";

export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  abilities: {
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }[];
}
export function usePaginatedPokemon(startId: number, count: number) {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatch = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = Array.from({ length: count }, (_, i) =>
          fetch(`https://pokeapi.co/api/v2/pokemon/${startId + i}`).then(
            (res) => {
              if (!res.ok)
                throw new Error(`Failed to fetch Pokémon ID ${startId + i}`);
              return res.json();
            }
          )
        );
        const results = await Promise.all(promises);
        setPokemonList(results);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [startId, count]);

  return { pokemonList, loading, error };
}
