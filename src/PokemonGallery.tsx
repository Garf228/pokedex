import { useState } from "react";
import { usePaginatedPokemon } from "./usePaginatedPokemon"; // Custom hook to fetch Pokémon data

function PokemonGallery() {
  // Tracks which page of Pokémon we're on (0 = first page)
  const [page, setPage] = useState(0);

  // Calculates the starting Pokémon ID for the current page
  const startId = page * 10 + 1;

  // Custom hook that fetches 10 Pokémon starting from startId
  const { pokemonList, loading, error } = usePaginatedPokemon(startId, 10);

  // Tracks which ability is currently expanded (for tooltip display)
  const [expandedAbility, setExpandedAbility] = useState<string | null>(null);

  // Tracks which ability is actively selected (used to toggle tooltip)
  const [activeAbility, setActiveAbility] = useState<string | null>(null);

  // Stores the effect text of the selected ability
  const [abilityEffect, setAbilityEffect] = useState<string | null>(null);

  // Stores the position on screen where the tooltip should appear
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Handles when a user clicks on an ability name
  const handleAbilityClick = async (
    e: React.MouseEvent,
    url: string,
    abilityName: string
  ) => {
    e.stopPropagation(); // Prevents click from bubbling up

    // If the same ability is clicked again, close the tooltip
    if (activeAbility === abilityName) {
      setActiveAbility(null);
      setAbilityEffect(null);
      return;
    }

    // Get the position of the clicked element to place the tooltip
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.bottom });

    // Optional: Validate the URL to prevent unexpected fetches
    if (!url.startsWith("https://pokeapi.co/api/v2/")) {
      console.warn("Blocked unexpected URL:", url);
      return;
    }

    try {
      // Fetch ability details from the API
      const res = await fetch(url);
      const data = await res.json();

      // Find the English effect description
      const englishEntry = data.effect_entries.find(
        (entry: any) => entry.language.name === "en"
      );

      // Update state to show tooltip with effect
      setActiveAbility(abilityName);
      setAbilityEffect(englishEntry?.short_effect || "No effect found.");
    } catch (err) {
      console.error("Failed to fetch ability effect:", err);
      setAbilityEffect("Failed to load effect.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Pokémon Gallery</h1>

        {/* Show loading or error messages */}
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        <div className="space-y-6">
          {/* Tooltip for ability effect */}
          {activeAbility && tooltipPosition && abilityEffect && (
            <div
              className="absolute z-50 bg-white text-gray-800 shadow-lg rounded p-4 w-64 text-sm"
              style={{
                top: tooltipPosition.y + window.scrollY + 8,
                left: tooltipPosition.x - 128,
              }}
            >
              {/* Close button for tooltip */}
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

          {/* Render each Pokémon card */}
          {pokemonList.map((pokemon) => (
            <div
              key={pokemon.id}
              className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-6"
            >
              {/* Pokémon image */}
              <img
                src={pokemon.sprites.front_default}
                alt={pokemon.name}
                className="w-20 h-20"
              />

              {/* Pokémon name and abilities */}
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

                  {/* Optional expanded ability section (not used in tooltip flow) */}
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

        {/* Pagination buttons */}
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
