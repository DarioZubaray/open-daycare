"use client";

import { useState, useEffect } from "react";

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other?: {
      "official-artwork"?: {
        front_default: string;
      };
    };
  };
  types: {
    slot: number;
    type: {
      name: string;
    };
  }[];
}

function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function PokeballIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-16 w-16 text-subtle animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-[#A8A878]",
  fire: "bg-[#F08030]",
  water: "bg-[#6890F0]",
  electric: "bg-[#F8D030]",
  grass: "bg-[#78C850]",
  ice: "bg-[#98D8D8]",
  fighting: "bg-[#C03028]",
  poison: "bg-[#A040A0]",
  ground: "bg-[#E0C068]",
  flying: "bg-[#A890F0]",
  psychic: "bg-[#F85888]",
  bug: "bg-[#A8B820]",
  rock: "bg-[#B8A038]",
  ghost: "bg-[#705898]",
  dragon: "bg-[#7038F8]",
  dark: "bg-[#705848]",
  steel: "bg-[#B8B8D0]",
  fairy: "bg-[#EE99AC]",
};

export function PokemonCard() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [pokemonId, setPokemonId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPokemon() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
        );

        if (!res.ok) {
          throw new Error("No se encontró el Pokémon");
        }

        const data: Pokemon = await res.json();

        if (!cancelled) {
          setPokemon(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPokemon();

    return () => {
      cancelled = true;
    };
  }, [pokemonId]);

  function handlePrevious() {
    if (pokemonId > 1) {
      setPokemonId((prev) => prev - 1);
    }
  }

  function handleNext() {
    setPokemonId((prev) => prev + 1);
  }

  const artworkUrl =
    pokemon?.sprites.other?.["official-artwork"]?.front_default ??
    pokemon?.sprites.front_default;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="rounded-[18px] border border-line bg-surface shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)] p-6 w-full max-w-sm flex flex-col items-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <PokeballIcon />
            <p className="text-sm text-subtle">Buscando Pokémon...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <p className="text-sm text-accent font-semibold">{error}</p>
            <button
              onClick={() => setPokemonId(1)}
              className="rounded-[14px] bg-linear-to-b from-primary-from to-primary-to px-5 py-2 text-[14px] font-extrabold text-white"
            >
              Volver al inicio
            </button>
          </div>
        ) : pokemon ? (
          <>
            <p className="text-[13px] font-bold tracking-[0.5px] text-subtle">
              #{String(pokemon.id).padStart(3, "0")}
            </p>

            {artworkUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artworkUrl}
                alt={pokemon.name}
                className="w-44 h-44 object-contain drop-shadow-md"
                width={176}
                height={176}
              />
            )}

            <h2 className="font-heading text-[24px] font-semibold text-ink capitalize mt-1">
              {pokemon.name}
            </h2>

            <div className="flex gap-2 mt-2">
              {pokemon.types.map((t) => (
                <span
                  key={t.type.name}
                  className={`rounded-full px-3 py-1 text-[12px] font-extrabold text-white capitalize ${
                    TYPE_COLORS[t.type.name] ?? "bg-[#68A090]"
                  }`}
                >
                  {t.type.name}
                </span>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={pokemonId <= 1 || loading}
          className="flex items-center gap-1 rounded-[14px] border-[1.5px] border-line bg-white px-4 py-2 text-[14px] font-extrabold text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream transition-colors"
          aria-label="Pokémon anterior"
        >
          <ChevronLeftIcon />
          Anterior
        </button>

        <span className="text-[14px] font-bold text-subtle tabular-nums min-w-[3ch] text-center">
          {pokemonId}
        </span>

        <button
          onClick={handleNext}
          disabled={loading}
          className="flex items-center gap-1 rounded-[14px] bg-linear-to-b from-primary-from to-primary-to px-4 py-2 text-[14px] font-extrabold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
          aria-label="Pokémon siguiente"
        >
          Siguiente
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
