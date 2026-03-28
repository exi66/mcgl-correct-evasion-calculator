import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getCssVar(name) {
  if (typeof window === "undefined") return "";
  const styles = getComputedStyle(document.documentElement);
  const value = styles.getPropertyValue(name).trim();

  if (value && !value.includes("oklch") && !value.includes("#")) {
    return `oklch(${value})`;
  }
  return value;
}

export const intl = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export const percentIntl = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
