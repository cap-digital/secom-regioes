// Raw shapes coming back from the Supabase edge function.

export interface RawGoogleRow {
  date: string;
  campaign: string;
  ad_group_name: string;
  ad_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  engagements: number;
  video_trueview_views: number;
  video_quartile25_rate: number;
  video_quartile50_rate: number;
  video_quartile75_rate: number;
  video_quartile100_rate: number;
  average_video_watch_time_duration_millis: number | string;
  video_title?: string;
  ad_display_url?: string;
  "Região": string;
  "Estratégia ": string;
  Investimento: number;
  thumbnailurl?: string;
}

export interface RawSpotifyRow {
  date: string;
  campaign: string;
  ad_set: string;
  ad: string;
  ad_spend: number;
  ad_impressions: number;
  ad_set_clicks: number;
  ad_paid_listen_reach: number;
  ad_reach: number;
  ad_video_views: number;
  ad_first_quartiles: number;
  ad_midpoints: number;
  ad_third_quartiles: number;
  ad_completes: number;
  ad_listeners: number;
  ad_new_listeners: number;
  "Região": string;
  "Estratégia ": string;
  Investimento: number;
}

export interface RawProgramaticaRow {
  Data: string;
  Campanha: string;
  "Grupo de anúncios": string;
  "Anúncio": string;
  "Impressões": number;
  Cliques: number;
  Custo: number;
  "Trueview views": number;
  "25% Vídeo assistido": number;
  "50% Video assistido": number;
  "75% Video assistido": number;
  "Videos completos 100%": number;
  "Região": string;
  "Estratégia ": string;
  Investimento: number;
}

export interface RawPushRow {
  Data: string;
  "Região ": number | string; // chega como número (8 / 12 / 14)
  "ID do Anúncio": number;
  "Título": string;
  "Descrição": string;
  "Chamada para ação": string;
  "Nome do Anunciante": string;
  "Link de mídia": string;
  "Visualizar link do informante": string;
  Url: string;
  Disparo: number; // métrica contratada (substitui impressões)
  Cliques: number;
  Investimento: number;
  "Estratégia ": string;
}

export interface ApiResponse {
  success: boolean;
  google: RawGoogleRow[];
  tvConectada: RawGoogleRow[];
  spotify: RawSpotifyRow[];
  programaticaDeVideo: RawProgramaticaRow[];
  pushNotification: RawPushRow[];
  timestamp: string;
}

export type PlatformId =
  | "google"
  | "tvConectada"
  | "spotify"
  | "programaticaDeVideo"
  | "pushNotification";

export type Regiao = "REGIÃO 8" | "REGIÃO 12" | "REGIÃO 14";

// Unified, normalized record used across the whole dashboard.
export interface NormalizedRow {
  platform: PlatformId;
  date: string; // YYYY-MM-DD
  campaign: string;
  adGroup: string;
  adName: string;
  videoTitle: string; // human-readable creative title (Google / CTV)
  videoUrl: string; // YouTube video URL (Google / CTV) — from `thumbnailurl`
  region: string;
  strategy: string;
  investimento: number;
  impressions: number;
  disparos: number; // Push Notification: disparos (métrica contratada)
  clicks: number;
  views: number; // platform's "visualizações"/listens metric
  reach: number;
  engagements: number;
  // Video funnel (as absolute counts)
  q25: number;
  q50: number;
  q75: number;
  q100: number; // completes
  watchTimeMillis: number;
}
