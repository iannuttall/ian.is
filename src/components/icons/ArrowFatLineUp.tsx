import type { IconProps } from "./types";

export function ArrowFatLineUp({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M231.39,123.06A8,8,0,0,1,224,128H184v56a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V128H32a8,8,0,0,1-5.66-13.66l96-96a8,8,0,0,1,11.32,0l96,96A8,8,0,0,1,231.39,123.06ZM176,208H80a8,8,0,0,0,0,16h96a8,8,0,0,0,0-16Z"/>
    </svg>
  );
}
