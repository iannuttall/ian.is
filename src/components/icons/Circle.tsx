import type { IconProps } from "./types";

export function Circle({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="128" cy="128" r="104"/>
    </svg>
  );
}
