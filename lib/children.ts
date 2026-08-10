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
};

export interface Child {
  id: string;
  name: string;
  age: string;
  room: string;
  initial: string;
  avatarBg: string;
  avatarColor: string;
  badge?: ChildBadge;
  parents: LinkedParent[];
  birthDate: string;
  joinDate: string;
  allergyNotes?: string;
}

export const children: Child[] = [
  {
    id: "mateo-fernandez",
    name: "Mateo Fernández",
    age: "3 años",
    room: "Soles",
    initial: "M",
    avatarBg: "#A9D9E8",
    avatarColor: "#1F7A93",
    badge: { label: "MANÍ", bg: "#FBD8CC", color: "#D9684A" },
    parents: [
      { name: "Lucía Fernández", role: "Mamá", status: "active", avatarBg: "#C9B6E8", avatarColor: "#fff", initial: "L" },
      { name: "Diego Fernández", role: "Papá", status: "pending", avatarBg: "#A9C7E8", avatarColor: "#fff", initial: "D" },
    ],
    birthDate: "12 mar 2022",
    joinDate: "feb 2025",
    allergyNotes: "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
  },
  {
    id: "sofia-mendez",
    name: "Sofía Méndez",
    age: "2 años",
    room: "Soles",
    initial: "S",
    avatarBg: "#F4B8CC",
    avatarColor: "#C44A7A",
    parents: [
      { name: "Padre de Sofía", role: "Padre", status: "active", avatarBg: "#A9C7E8", avatarColor: "#fff", initial: "P" },
    ],
    birthDate: "15 jun 2023",
    joinDate: "mar 2025",
  },
  {
    id: "benjamin-ruiz",
    name: "Benjamín Ruiz",
    age: "3 años",
    room: "Soles",
    initial: "B",
    avatarBg: "#B9DEC4",
    avatarColor: "#3E8B62",
    parents: [
      { name: "Madre de Benjamín", role: "Madre", status: "active", avatarBg: "#F4B8CC", avatarColor: "#fff", initial: "M" },
      { name: "Padre de Benjamín", role: "Padre", status: "active", avatarBg: "#A9C7E8", avatarColor: "#fff", initial: "P" },
    ],
    birthDate: "3 ene 2022",
    joinDate: "ene 2025",
  },
  {
    id: "valentina-soto",
    name: "Valentina Soto",
    age: "2 años",
    room: "Soles",
    initial: "V",
    avatarBg: "#F4DC8E",
    avatarColor: "#9A7B1E",
    badge: { label: "VINCULAR", bg: "#F9D2DE", color: "#C56486" },
    parents: [],
    birthDate: "20 abr 2023",
    joinDate: "abr 2025",
  },
  {
    id: "tomas-diaz",
    name: "Tomás Díaz",
    age: "3 años",
    room: "Soles",
    initial: "T",
    avatarBg: "#C9B6E8",
    avatarColor: "#7B5FC0",
    badge: { label: "LACTOSA", bg: "#FBD8CC", color: "#D9684A" },
    parents: [
      { name: "Madre de Tomás", role: "Madre", status: "active", avatarBg: "#F4B8CC", avatarColor: "#fff", initial: "M" },
    ],
    birthDate: "8 sep 2022",
    joinDate: "sep 2025",
  },
  {
    id: "emma-castro",
    name: "Emma Castro",
    age: "2 años",
    room: "Soles",
    initial: "E",
    avatarBg: "#F4B8CC",
    avatarColor: "#C44A7A",
    parents: [
      { name: "Madre de Emma", role: "Madre", status: "active", avatarBg: "#C9B6E8", avatarColor: "#fff", initial: "M" },
    ],
    birthDate: "1 nov 2023",
    joinDate: "nov 2025",
  },
  {
    id: "lucas-romero",
    name: "Lucas Romero",
    age: "3 años",
    room: "Soles",
    initial: "L",
    avatarBg: "#A9D9E8",
    avatarColor: "#1F7A93",
    parents: [
      { name: "Madre de Lucas", role: "Madre", status: "active", avatarBg: "#F4B8CC", avatarColor: "#fff", initial: "M" },
    ],
    birthDate: "22 feb 2022",
    joinDate: "feb 2025",
  },
  {
    id: "olivia-vega",
    name: "Olivia Vega",
    age: "2 años",
    room: "Soles",
    initial: "O",
    avatarBg: "#B9DEC4",
    avatarColor: "#3E8B62",
    parents: [
      { name: "Madre de Olivia", role: "Madre", status: "active", avatarBg: "#F4B8CC", avatarColor: "#fff", initial: "M" },
    ],
    birthDate: "5 jul 2023",
    joinDate: "jul 2025",
  },
];
