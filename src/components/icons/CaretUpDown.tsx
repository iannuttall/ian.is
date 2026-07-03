import type { IconProps } from "./types";

export function CaretUpDown({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M183.39,172.94a8,8,0,0,1-1.73,8.72l-48,48a8,8,0,0,1-11.32,0l-48-48A8,8,0,0,1,80,168h96A8,8,0,0,1,183.39,172.94ZM80,88h96a8,8,0,0,0,5.66-13.66l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,80,88Z"/>
    </svg>
  );
}
