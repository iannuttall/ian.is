import type { AlpineRuntime } from "./types";

type AccordionOptions = {
  type?: "single" | "multiple";
};

type AccordionState = {
  multiple: boolean;
  open: string[];
  isOpen(value: string): boolean;
  toggle(value: string): void;
  roveFocus(event: KeyboardEvent): void;
};

export function registerAccordion(Alpine: AlpineRuntime) {
  Alpine.data(
    "accordion",
    (options: AccordionOptions = {}): AccordionState => ({
      multiple: options.type === "multiple",
      open: [],

      isOpen(value) {
        return this.open.includes(value);
      },

      toggle(value) {
        if (this.isOpen(value)) {
          this.open = this.open.filter((entry) => entry !== value);
          return;
        }

        this.open = this.multiple ? [...this.open, value] : [value];
      },

      roveFocus(event) {
        const trigger = event.currentTarget;
        if (!(trigger instanceof HTMLElement)) return;

        const root = trigger.closest("[data-accordion]");
        if (!root) return;

        const triggers = Array.from(
          root.querySelectorAll<HTMLButtonElement>("[data-accordion-trigger]"),
        );
        const current = triggers.indexOf(trigger as HTMLButtonElement);
        if (current === -1) return;

        let next = current;

        if (event.key === "ArrowDown") next = (current + 1) % triggers.length;
        else if (event.key === "ArrowUp") next = (current - 1 + triggers.length) % triggers.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = triggers.length - 1;
        else return;

        event.preventDefault();
        triggers[next]?.focus();
      },
    }),
  );
}
