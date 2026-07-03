import type { IconProps } from "./types";

export function DotOutline({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M156,128a28,28,0,1,1-28-28A28,28,0,0,1,156,128Z"/>
    </svg>
  );
}
