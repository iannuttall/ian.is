import type { IconProps } from "./types";

export function Square({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="32" y="32" width="192" height="192" rx="16"/>
    </svg>
  );
}
