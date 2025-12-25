import { ref } from "vue";

const storageKey = "learningtracker.theme";
type Theme = "light" | "dark";

const theme = ref<Theme>("light");
let initialized = false;

const applyTheme = (value: Theme) => {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  root.classList.toggle("dark", value === "dark");
  root.style.colorScheme = value;
};

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = localStorage.getItem(storageKey);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

export const initTheme = () => {
  if (initialized) {
    return;
  }
  const initial = getInitialTheme();
  theme.value = initial;
  applyTheme(initial);
  initialized = true;
};

const setTheme = (value: Theme) => {
  theme.value = value;
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, value);
  }
  applyTheme(value);
};

const toggleTheme = () => {
  setTheme(theme.value === "dark" ? "light" : "dark");
};

export const useTheme = () => {
  initTheme();
  return {
    theme,
    setTheme,
    toggleTheme,
  };
};
