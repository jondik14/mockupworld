export type Device = "iphone";

export type Environment = "desk" | "cafe" | "transit" | "outdoor" | "dark";

export type UiType =
  | "home"
  | "onboarding"
  | "feed"
  | "settings"
  | "paywall"
  | "empty"
  | "error";

export type Style = "clean" | "glass" | "bold" | "minimal" | "data-heavy";

export type Mood = "calm" | "energetic" | "premium" | "playful";

export interface Mockup {
  id: string;
  title: string;
  device: Device;
  environment: Environment;
  uiType: UiType;
  style: Style;
  mood: Mood;
  image: {
    src: string;
    width: number;
    height: number;
  };
  clusterKey: string;
  /** True only when a matching file exists under public/mockups. */
  hasImage: boolean;
}

export interface Cluster {
  key: string;
  label: string;
  uiLabel: string;
  environment: Environment;
  uiType: UiType;
  mockups: Mockup[];
}

export const ENVIRONMENTS: { value: Environment; label: string }[] = [
  { value: "desk", label: "Desk" },
  { value: "cafe", label: "Cafe" },
  { value: "transit", label: "Transit" },
  { value: "outdoor", label: "Outdoor" },
  { value: "dark", label: "Dark" },
];

export const UI_TYPES: { value: UiType; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "onboarding", label: "Onboarding" },
  { value: "feed", label: "Feed" },
  { value: "settings", label: "Settings" },
  { value: "paywall", label: "Paywall" },
  { value: "empty", label: "Empty" },
  { value: "error", label: "Error" },
];

export const STYLES: Style[] = ["clean", "glass", "bold", "minimal", "data-heavy"];

export const MOODS: Mood[] = ["calm", "energetic", "premium", "playful"];
