const colors = ["#2563eb", "#f97316", "#22c55e", "#facc15", "#ec4899"];

export function burstConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  for (let index = 0; index < 28; index += 1) {
    const piece = document.createElement("span");
    const size = 6 + Math.random() * 6;
    const x = 50 + (Math.random() - 0.5) * 30;
    const y = 42 + (Math.random() - 0.5) * 12;
    const dx = (Math.random() - 0.5) * 260;
    const dy = 120 + Math.random() * 190;
    const rotate = (Math.random() - 0.5) * 720;

    piece.setAttribute("aria-hidden", "true");
    piece.style.position = "fixed";
    piece.style.left = `${x}vw`;
    piece.style.top = `${y}vh`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 1.6}px`;
    piece.style.borderRadius = "2px";
    piece.style.background = colors[index % colors.length];
    piece.style.pointerEvents = "none";
    piece.style.zIndex = "9999";
    piece.style.transform = "translate(-50%, -50%)";

    document.body.appendChild(piece);
    piece
      .animate(
        [
          { opacity: 1, transform: "translate(-50%, -50%) rotate(0deg)" },
          {
            opacity: 0,
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rotate}deg)`,
          },
        ],
        {
          duration: 900 + Math.random() * 350,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        },
      )
      .finished.finally(() => piece.remove());
  }
}
