import type { SVGProps } from "react";

/** Shared props for every icon. Spread onto the <svg>, so you can pass
 *  className, style, onClick, etc. `size` sets width & height (px), default 20. */
export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: string | number;
}
