// Campaign goals (metas) per region & platform.
// PERÍODO DA CAMPANHA: 12/06 a 30/06.

export const CAMPAIGN_PERIOD = { inicio: "12/06", fim: "30/06" };

export type MetaUnit = "impressions" | "views" | "completes";

export interface MetaItem {
  label: string; // strategy / sub-goal label
  unit: MetaUnit;
  unitLabel: string; // "Impressões" | "Visualizações" | "Escutas completas"
  goal: number;
  investimento: number;
}

export interface PlatformMeta {
  platform:
    | "google"
    | "tvConectada"
    | "spotify"
    | "programaticaDeVideo"
    | "pushNotification";
  items: MetaItem[];
}

export type MetasByRegion = Record<string, PlatformMeta[]>;

export const METAS: MetasByRegion = {
  "REGIÃO 8": [
    {
      platform: "google",
      items: [
        { label: "Alcance — YouTube Pulável", unit: "impressions", unitLabel: "Impressões", goal: 2456140, investimento: 15400 },
        { label: "Visualização — YouTube Shorts", unit: "views", unitLabel: "Visualizações", goal: 91667, investimento: 11000 },
      ],
    },
    { platform: "tvConectada", items: [{ label: "Visualização — TV Conectada", unit: "views", unitLabel: "Visualizações", goal: 5500, investimento: 11000 }] },
    { platform: "spotify", items: [{ label: "Escutas", unit: "completes", unitLabel: "Escutas completas", goal: 6600, investimento: 13200 }] },
    { platform: "programaticaDeVideo", items: [{ label: "Visualização — Programática", unit: "views", unitLabel: "Visualizações", goal: 102667, investimento: 15400 }] },
    { platform: "pushNotification", items: [{ label: "Alcance — Push Notification", unit: "impressions", unitLabel: "Impressões", goal: 9429, investimento: 13200 }] },
  ],
  "REGIÃO 12": [
    {
      platform: "google",
      items: [
        { label: "Alcance — YouTube Pulável", unit: "impressions", unitLabel: "Impressões", goal: 1451356, investimento: 9100 },
        { label: "Visualização — YouTube Shorts", unit: "views", unitLabel: "Visualizações", goal: 54167, investimento: 6500 },
      ],
    },
    { platform: "tvConectada", items: [{ label: "Visualização — TV Conectada", unit: "views", unitLabel: "Visualizações", goal: 3250, investimento: 6500 }] },
    { platform: "spotify", items: [{ label: "Escutas", unit: "completes", unitLabel: "Escutas completas", goal: 3900, investimento: 7800 }] },
    { platform: "programaticaDeVideo", items: [{ label: "Visualização — Programática", unit: "views", unitLabel: "Visualizações", goal: 60667, investimento: 9100 }] },
    { platform: "pushNotification", items: [{ label: "Alcance — Push Notification", unit: "impressions", unitLabel: "Impressões", goal: 5571, investimento: 7800 }] },
  ],
  "REGIÃO 14": [
    {
      platform: "google",
      items: [
        { label: "Alcance — YouTube Pulável", unit: "impressions", unitLabel: "Impressões", goal: 1674641, investimento: 10500 },
        { label: "Visualização — YouTube Shorts", unit: "views", unitLabel: "Visualizações", goal: 62500, investimento: 7500 },
      ],
    },
    { platform: "tvConectada", items: [{ label: "Visualização — TV Conectada", unit: "views", unitLabel: "Visualizações", goal: 3750, investimento: 7500 }] },
    { platform: "spotify", items: [{ label: "Escutas", unit: "completes", unitLabel: "Escutas completas", goal: 4500, investimento: 9000 }] },
    { platform: "programaticaDeVideo", items: [{ label: "Visualização — Programática", unit: "views", unitLabel: "Visualizações", goal: 70000, investimento: 10500 }] },
    { platform: "pushNotification", items: [{ label: "Alcance — Push Notification", unit: "impressions", unitLabel: "Impressões", goal: 6429, investimento: 9000 }] },
  ],
};

export const PLATFORM_LABEL: Record<string, string> = {
  google: "Google",
  tvConectada: "TV Conectada",
  spotify: "Spotify",
  programaticaDeVideo: "Programática de Vídeo",
  pushNotification: "Push Notification",
};
