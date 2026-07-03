import type { IconProps } from "./types";

export function Rectangle({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="24" y="40" width="208" height="176" rx="16"/>
    </svg>
  );
}
