import type { AlpineRuntime } from "./types";

/**
 * One shared highlight that slides between hovered items instead of each
 * item lighting up on its own. The container is `x-data="hoverGroup"` and
 * `relative`; items carry `data-hover-item`; the highlight element binds
 * `:style="style"` and `:class="{ 'transition-none': instant }"`.
 *
 * On the first hover after the pointer left, the highlight appears in place
 * rather than sliding in from wherever it was last.
 */
type HoverGroupState = {
  style: string;
  visible: boolean;
  instant: boolean;
  init: () => void;
  move: (item: HTMLElement) => void;
  hide: () => void;
};

export function registerHoverGroup(Alpine: AlpineRuntime) {
  Alpine.data(
    "hoverGroup",
    (): HoverGroupState => ({
      style: "opacity:0",
      visible: false,
      instant: false,

      init() {
        const root = (this as unknown as { $el: HTMLElement }).$el;

        root.addEventListener("pointerover", (event) => {
          const item = (event.target as HTMLElement).closest<HTMLElement>("[data-hover-item]");
          if (item && root.contains(item)) this.move(item);
        });
        root.addEventListener("pointerleave", () => this.hide());
        root.addEventListener("focusin", (event) => {
          const item = (event.target as HTMLElement).closest<HTMLElement>("[data-hover-item]");
          if (item && root.contains(item)) this.move(item);
        });
        root.addEventListener("focusout", (event) => {
          const next = event.relatedTarget as HTMLElement | null;
          if (!next || !root.contains(next)) this.hide();
        });
      },

      move(item) {
        const root = (this as unknown as { $el: HTMLElement }).$el;
        const bounds = root.getBoundingClientRect();
        const rect = item.getBoundingClientRect();
        const x = Math.round(rect.left - bounds.left);
        const y = Math.round(rect.top - bounds.top);

        this.instant = !this.visible;
        this.style = `opacity:1;transform:translate(${x}px,${y}px);width:${rect.width}px;height:${rect.height}px`;
        this.visible = true;

        if (this.instant) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              this.instant = false;
            });
          });
        }
      },

      hide() {
        this.visible = false;
        this.style = this.style.replace("opacity:1", "opacity:0");
      },
    }),
  );
}
