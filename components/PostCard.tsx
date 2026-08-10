import type { Post } from "@/lib/posts";
import { POST_KIND_STYLES } from "@/lib/posts";

function HeartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

export function PostCard({ post }: { post: Post }) {
  const kindStyle = POST_KIND_STYLES[post.kind];

  return (
    <article className="rounded-[20px] border border-line bg-surface px-[22px] py-5 shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)]">
      <div className="mb-3.5 flex items-center gap-3">
        <div
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full font-heading text-[17px] font-semibold"
          style={{ background: post.author.avatarBg, color: post.author.avatarColor }}
        >
          {post.author.icon === "megaphone" ? <MegaphoneIcon /> : post.author.initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-heading text-[16.5px] font-semibold text-ink">{post.author.name}</div>
          <div className="text-[12.5px] text-muted">{post.time} · publicado por vos</div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: kindStyle.badgeBg }}>
          <span className="h-2 w-2 rounded-full" style={{ background: kindStyle.dotColor }} />
          <span className="text-xs font-extrabold tracking-wider" style={{ color: kindStyle.textColor }}>
            {kindStyle.label}
          </span>
        </div>
      </div>

      <div className="mb-2.5 text-[12.5px] text-muted">{post.audience}</div>
      <p className="m-0 text-[15.5px] leading-[1.55] text-[#4A4038]">{post.body}</p>

      {post.photo ? (
        <div className="mt-3.5 flex h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[#B0A290]">
          <PhotoIcon />
          <span className="text-[13.5px]">{post.photo.label}</span>
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-[18px] border-t border-[#F0E6D8] pt-3.5">
        <span className="flex items-center gap-[7px] text-sm font-bold text-[#E0654A]">
          <HeartIcon />
          {post.likeCount}
        </span>
        <a href="#" className="flex items-center gap-[7px] text-sm font-bold text-subtle">
          <CommentIcon />
          {post.commentCount}
        </a>
        <span className="flex-1" />
        <a href="#" className="text-sm font-extrabold text-accent">
          Editar
        </a>
      </div>
    </article>
  );
}
