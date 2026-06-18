import {
  IconGrid,
  IconPlay,
  IconTv,
  IconMusic,
  IconVideo,
  IconBell,
  IconTarget,
  IconImage,
} from "./ui/icons";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof IconGrid;
  color: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    title: "Geral",
    items: [
      { href: "/dashboard", label: "Visão Geral", icon: IconGrid, color: "#1351B4" },
    ],
  },
  {
    title: "Plataformas",
    items: [
      { href: "/dashboard/google", label: "Google", icon: IconPlay, color: "#E52207" },
      { href: "/dashboard/tv-conectada", label: "TV Conectada", icon: IconTv, color: "#1351B4" },
      { href: "/dashboard/spotify", label: "Spotify", icon: IconMusic, color: "#168821" },
      { href: "/dashboard/programatica", label: "Programática de Vídeo", icon: IconVideo, color: "#7c3aed" },
      { href: "/dashboard/push", label: "Push Notification", icon: IconBell, color: "#f97316" },
    ],
  },
  {
    title: "Análises",
    items: [
      { href: "/dashboard/metas", label: "Progresso de Metas", icon: IconTarget, color: "#168821" },
      { href: "/dashboard/criativos", label: "Criativos", icon: IconImage, color: "#0c326f" },
    ],
  },
];
