import type { AlpineRuntime } from "./types";

export function registerMenu(Alpine: AlpineRuntime) {
  Alpine.store("menu", {
    open: false,
    toggle() {
      this.open = !this.open;
    },
    close() {
      this.open = false;
    },
  });

  Alpine.data("menuToggle", () => ({
    get open() {
      return Alpine.store("menu").open;
    },
    toggle() {
      Alpine.store("menu").toggle();
    },
  }));
}
