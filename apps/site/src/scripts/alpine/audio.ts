const partyHornPath = "/audio/partyhorn.mp3";
const errorPath = "/audio/error.mp3";

function playSound(path: string, volume = 0.75) {
  const audio = new Audio(path);
  audio.volume = volume;
  void audio.play().catch(() => {
    // Browsers can block audio if the response resolves after user activation.
  });
}

export function playPartyHorn() {
  playSound(partyHornPath, 0.75);
}

export function playErrorSound() {
  playSound(errorPath, 0.65);
}
