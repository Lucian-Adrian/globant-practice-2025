// Centralized icon size utilities for consistent SVG sizing across the app
// Tailwind-like utility classes with our tw- prefix
export const iconXs = "tw-w-4 tw-h-4";
export const iconSm = "tw-w-5 tw-h-5";
export const iconMd = "tw-w-6 tw-h-6";
export const iconLg = "tw-w-8 tw-h-8";

export type IconSize = typeof iconXs | typeof iconSm | typeof iconMd | typeof iconLg;
