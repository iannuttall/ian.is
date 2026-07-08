import { registerMenu } from "./alpine/menu";
import { registerNewsletter } from "./alpine/newsletter";
import type { AlpineRuntime } from "./alpine/types";

export default function setup(Alpine: AlpineRuntime) {
  registerMenu(Alpine);
  registerNewsletter(Alpine);
}
