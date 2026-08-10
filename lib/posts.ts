export type PostKind = "milestone" | "activity" | "announcement";

export interface PostAuthor {
  name: string;
  avatarBg: string;
  avatarColor: string;
  initial?: string;
  icon?: "megaphone";
}

export interface Post {
  id: string;
  author: PostAuthor;
  kind: PostKind;
  time: string;
  audience: string;
  body: string;
  photo?: { label: string };
  likeCount: number;
  commentCount: number;
}

export const POST_KIND_STYLES: Record<
  PostKind,
  { label: string; badgeBg: string; dotColor: string; textColor: string }
> = {
  milestone: { label: "LOGRO", badgeBg: "#CFEBD8", dotColor: "#3E9B6C", textColor: "#3E9B6C" },
  activity: { label: "ACTIVIDAD", badgeBg: "#C7E7F1", dotColor: "#2E89A6", textColor: "#2E89A6" },
  announcement: { label: "ANUNCIO", badgeBg: "#CCD8F4", dotColor: "#4E72C8", textColor: "#4E72C8" },
};

export const feedPosts: Post[] = [
  {
    id: "post-mateo-orinal",
    author: {
      name: "Mateo",
      avatarBg: "#A9D9E8",
      avatarColor: "#1F7A93",
      initial: "M",
    },
    kind: "milestone",
    time: "14:20",
    audience: "Para: familia de Mateo",
    body: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    likeCount: 3,
    commentCount: 1,
  },
  {
    id: "post-mateo-temperas",
    author: {
      name: "Mateo",
      avatarBg: "#A9D9E8",
      avatarColor: "#1F7A93",
      initial: "M",
    },
    kind: "activity",
    time: "09:40",
    audience: "Para: familia de Mateo",
    body: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photo: { label: "Foto · pintando con témperas" },
    likeCount: 5,
    commentCount: 2,
  },
  {
    id: "post-anuncio-parque",
    author: {
      name: "Anuncio general",
      avatarBg: "#CCD8F4",
      avatarColor: "#4E72C8",
      icon: "megaphone",
    },
    kind: "announcement",
    time: "07:50",
    audience: "Para: toda la sala",
    body: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    likeCount: 8,
    commentCount: 0,
  },
];
