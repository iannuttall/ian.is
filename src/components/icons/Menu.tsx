import type { IconProps } from "./types";

/** Two-line hamburger (from Brian Lovin's briOS MenuToggle, static variant).
 *  For the animated open→X version, install `motion` and use motion.path with
 *  `animate={isOpen ? { d: "M6 6L18 18" } : { d: "M5 8H19" }}`. */
export function Menu({ size = 20, strokeWidth = 2.5, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M5 8H19" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M5 16H19" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}
