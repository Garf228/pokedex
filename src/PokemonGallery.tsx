import { useState } from "react";
import { usePaginatedPokemon } from "./usePaginatedPokemon";

function PokemonGallery() {
  const [page, setPage] = useState(0);
  const startId = page * 10 + 1;
  const { pokemonList, loading, error } = usePaginatedPokemon(startId, 10);
  const [expandedAbility, setExpandedAbility] = useState<string | null>(null);

  const [activeAbility, setActiveAbility] = useState<string | null>(null);
  const [abilityEffect, setAbilityEffect] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleAbilityClick = async (
    e: React.MouseEvent,
    url: string,
    abilityName: string
  ) => {
    e.stopPropagation();

    if (activeAbility === abilityName) {
      setActiveAbility(null);
      setAbilityEffect(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.bottom });

    try {
      const res = await fetch(url);
      const data = await res.json();
      const englishEntry = data.effect_entries.find(
        (entry: any) => entry.language.name === "en"
      );
      setActiveAbility(abilityName);
      setAbilityEffect(englishEntry?.short_effect || "No effect found.");
    } catch {
      setAbilityEffect("Failed to load effect.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="p-6 max-w-3xl mx-auto ">
        <h1 className="text-3xl font-bold mb-8 text-center">Pokémon Gallery</h1>

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        <div className="space-y-6">
          {activeAbility && tooltipPosition && abilityEffect && (
            <div
              className="absolute z-50 bg-white text-gray-800 shadow-lg rounded p-4 w-64 text-sm"
              style={{
                top: tooltipPosition.y + window.scrollY + 8,
                left: tooltipPosition.x - 128,
              }}
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg font-bold"
                onClick={() => setActiveAbility(null)}
                aria-label="Close"
              >
                ×
              </button>
              <p className="font-semibold mb-2">Effect:</p>
              <p>{abilityEffect}</p>
            </div>
          )}
          {pokemonList.map((pokemon) => (
            <div
              key={pokemon.id}
              className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-6"
            >
              <img
                src={pokemon.sprites.front_default}
                alt={pokemon.name}
                className="w-20 h-20"
              />
              <div className="flex justify-between items-center w-full">
                <p className="text-lg font-semibold capitalize text-gray-800">
                  {pokemon.name}
                </p>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-600 mb-1">
                    Abilities
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1 relative">
                    {pokemon.abilities.map((ability) => (
                      <li
                        key={ability.ability.name}
                        className="cursor-pointer hover:underline text-blue-500"
                        onClick={(e) =>
                          handleAbilityClick(
                            e,
                            ability.ability.url,
                            ability.ability.name
                          )
                        }
                      >
                        {ability.ability.name}
                      </li>
                    ))}
                  </ul>

                  {expandedAbility &&
                    pokemon.abilities.some(
                      (a) => a.ability.name === expandedAbility
                    ) && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-gray-700 text-sm">
                        <p className="font-semibold mb-1">Effect:</p>
                        <p>{abilityEffect}</p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default PokemonGallery;
