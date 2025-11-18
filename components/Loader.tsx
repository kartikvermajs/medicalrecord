"use client";
import clsx from "clsx";

type LoaderProps = {
  size?: number;
  thickness?: number;
  speed?: number;
  color?: string;
  className?: string;
};

export default function Loader({
  size = 32,
  thickness = 3,
  speed = 700,
  color = "text-primary",
  className,
}: LoaderProps) {
  return (
    <div
      className={clsx(
        "rounded-full border-solid border-t-transparent animate-spin",
        color,
        className
      )}
      style={{
        width: size,
        height: size,
        borderWidth: thickness,
        animationDuration: `${speed}ms`,
      }}
    />
  );
}
