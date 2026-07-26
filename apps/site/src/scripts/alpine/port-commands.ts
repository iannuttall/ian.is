import type { AlpineRuntime } from "./types";

const DEFAULT_PORT = "3000";
const MAX_PORT = 65535;

type PortCommandsState = {
  port: string;
  readonly value: string;
  readonly valid: boolean;
};

export function registerPortCommands(Alpine: AlpineRuntime) {
  Alpine.data(
    "portCommands",
    (): PortCommandsState => ({
      port: DEFAULT_PORT,

      get valid() {
        return /^\d+$/.test(this.port) && Number(this.port) > 0 && Number(this.port) <= MAX_PORT;
      },

      get value() {
        return this.valid ? this.port : DEFAULT_PORT;
      },
    }),
  );
}
