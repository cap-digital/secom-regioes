// Campaign goals (metas) per region & platform.
// PERÍODO DA CAMPANHA: 12/06 a 30/06.

export const CAMPAIGN_PERIOD = { inicio: "12/06", fim: "30/06" };

export type MetaUnit = "impressions" | "views" | "completes" | "disparos";

export interface MetaItem {
  label: string; // strategy / sub-goal label
  unit: MetaUnit;
  unitLabel: string; // "Impressões" | "Visualizações" | "Escutas completas"
  goal: number;
  investimento: number;
  // For Google (two goals per region) the data strategy that scopes this item.
  // Matches the `Estratégia ` value in the data: "Visualização Pulável" /
  // "Visualização Shorts" (accent-insensitive, substring match).
  dataStrategy?: "pulavel" | "shorts";
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
        { label: "Visualização — YouTube Pulável", unit: "views", unitLabel: "Visualizações", goal: 110000, investimento: 15400, dataStrategy: "pulavel" },
        { label: "Visualização — YouTube Shorts", unit: "views", unitLabel: "Visualizações", goal: 91667, investimento: 11000, dataStrategy: "shorts" },
      ],
    },
    { platform: "tvConectada", items: [{ label: "Visualização — TV Conectada", unit: "views", unitLabel: "Visualizações", goal: 5500, investimento: 11000 }] },
    { platform: "spotify", items: [{ label: "Escutas", unit: "completes", unitLabel: "Escutas completas", goal: 6600, investimento: 13200 }] },
    { platform: "programaticaDeVideo", items: [{ label: "Visualização — Programática", unit: "views", unitLabel: "Visualizações", goal: 102667, investimento: 15400 }] },
    { platform: "pushNotification", items: [{ label: "Disparos — Push Notification", unit: "disparos", unitLabel: "Disparos", goal: 9429, investimento: 13200 }] },
  ],
  "REGIÃO 12": [
    {
      platform: "google",
      items: [
        { label: "Visualização — YouTube Pulável", unit: "views", unitLabel: "Visualizações", goal: 65000, investimento: 9100, dataStrategy: "pulavel" },
        { label: "Visualização — YouTube Shorts", unit: "views", unitLabel: "Visualizações", goal: 54167, investimento: 6500, dataStrategy: "shorts" },
      ],
    },
    { platform: "tvConectada", items: [{ label: "Visualização — TV Conectada", unit: "views", unitLabel: "Visualizações", goal: 3250, investimento: 6500 }] },
    { platform: "spotify", items: [{ label: "Escutas", unit: "completes", unitLabel: "Escutas completas", goal: 3900, investimento: 7800 }] },
    { platform: "programaticaDeVideo", items: [{ label: "Visualização — Programática", unit: "views", unitLabel: "Visualizações", goal: 60667, investimento: 9100 }] },
    { platform: "pushNotification", items: [{ label: "Disparos — Push Notification", unit: "disparos", unitLabel: "Disparos", goal: 5571, investimento: 7800 }] },
  ],
  "REGIÃO 14": [
    {
      platform: "google",
      items: [
        { label: "Visualização — YouTube Pulável", unit: "views", unitLabel: "Visualizações", goal: 75000, investimento: 10500, dataStrategy: "pulavel" },
        { label: "Visualização — YouTube Shorts", unit: "views", unitLabel: "Visualizações", goal: 62500, investimento: 7500, dataStrategy: "shorts" },
      ],
    },
    { platform: "tvConectada", items: [{ label: "Visualização — TV Conectada", unit: "views", unitLabel: "Visualizações", goal: 3750, investimento: 7500 }] },
    { platform: "spotify", items: [{ label: "Escutas", unit: "completes", unitLabel: "Escutas completas", goal: 4500, investimento: 9000 }] },
    { platform: "programaticaDeVideo", items: [{ label: "Visualização — Programática", unit: "views", unitLabel: "Visualizações", goal: 70000, investimento: 10500 }] },
    { platform: "pushNotification", items: [{ label: "Disparos — Push Notification", unit: "disparos", unitLabel: "Disparos", goal: 6429, investimento: 9000 }] },
  ],
};

export const PLATFORM_LABEL: Record<string, string> = {
  google: "Google",
  tvConectada: "TV Conectada",
  spotify: "Spotify",
  programaticaDeVideo: "Programática de Vídeo",
  pushNotification: "Push Notification",
};
