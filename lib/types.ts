export type ChildStatus = "active" | "archived";

export interface Room {
  id: string;
  daycare_id: string;
  name: string;
  created_at: string;
}

export interface Child {
  id: string;
  room_id: string;
  full_name: string;
  birth_date: string;
  enrolled_at: string;
  medical_notes: string | null;
  allergy_tags: string[];
  photo_consent: boolean;
  status: ChildStatus;
  created_at: string;
  updated_at: string;
}

export interface ChildWithRoom extends Child {
  rooms: { name: string } | null;
}

export type ChildBadge = {
  label: string;
  bg: string;
  color: string;
};

export type LinkedParent = {
  name: string;
  role: string;
  status: "active" | "pending";
  avatarBg: string;
  avatarColor: string;
  initial: string;
  invitationCode?: string;
};

const AVATAR_PALETTES = [
  { bg: "#A9D9E8", color: "#1F7A93" },
  { bg: "#F4B8CC", color: "#C44A7A" },
  { bg: "#B9DEC4", color: "#3E8B62" },
  { bg: "#F4DC8E", color: "#9A7B1E" },
  { bg: "#C9B6E8", color: "#7B5FC0" },
  { bg: "#E8D5C4", color: "#8B7355" },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getChildAvatar(childId: string) {
  const palette = AVATAR_PALETTES[hashString(childId) % AVATAR_PALETTES.length];
  return { avatarBg: palette.bg, avatarColor: palette.color };
}

export function getChildInitial(fullName: string): string {
  return fullName.charAt(0).toUpperCase();
}

export function getChildAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
    years--;
  }
  return years === 1 ? "1 año" : `${years} años`;
}

export function getChildBadge(allergyTags: string[]): ChildBadge | null {
  if (allergyTags.length === 0) return null;
  const tag = allergyTags[0].toUpperCase();
  return { label: tag, bg: "#FBD8CC", color: "#D9684A" };
}

export function formatDateEnrolled(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", { month: "short", year: "numeric" });
}

export function formatDateBirth(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}
