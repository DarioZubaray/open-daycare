import { PokemonCard } from "@/components/PokemonCard";

export default function PokemonPage() {
  return (
    <main className="min-h-screen bg-[#FBF4EC] flex flex-col items-center justify-center px-4 py-10">
      <h1 className="font-heading text-[32px] font-semibold text-[#3F362E] mb-2">
        Pokédex
      </h1>
      <p className="text-[15px] text-[#7A6F63] mb-8">
        Explorá los Pokémon uno por uno
      </p>
      <PokemonCard />
    </main>
  );
}
