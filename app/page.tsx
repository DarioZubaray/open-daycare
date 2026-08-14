import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SidebarShell } from "@/components/SidebarShell";
import { PostCard } from "@/components/PostCard";
import { feedPosts } from "@/lib/posts";

function formatToday(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(now);
}

export default async function FeedPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

    console.log({profile, user});
  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? " como estás?";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarShell />

      <main className="min-h-screen flex-1 overflow-y-auto sidebar:ml-[248px]">
        <div className="mx-auto w-full max-w-[760px] px-10 py-[34px] pb-20">
          <div className="mb-6">
            <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-accent">
              GUARDERÍA · SALA SOLES
            </div>
            <h1 className="font-heading text-[30px] font-semibold text-ink">
              Buenas, {firstName}
            </h1>
            <p className="mt-1 text-[14.5px] text-subtle">
              12 niños · {formatToday()}
            </p>
          </div>

          <div className="mb-6 cursor-pointer rounded-[20px] border border-line bg-surface px-[22px] py-[18px] shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)]">
            <p className="m-0 text-[15.5px] text-muted">
              Compartí un momento…
            </p>
          </div>

          <div className="mb-4 border-b border-[#F0E6D8] pb-3">
            <span className="text-[11.5px] font-extrabold tracking-[1px] text-subtle">
              PUBLICADO HOY
            </span>
          </div>

          <div className="flex flex-col gap-5">
            {feedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
