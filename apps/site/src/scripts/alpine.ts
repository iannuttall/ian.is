import { registerAccordion } from "./alpine/accordion";
import { registerAma } from "./alpine/ama";
import { registerConfirmation } from "./alpine/confirmation";
import { registerGithubStars } from "./alpine/github-stars";
import { registerNewsletter } from "./alpine/newsletter";
import { registerPortCommands } from "./alpine/port-commands";
import { registerStars } from "./alpine/stars";
import { registerSubscriberCount } from "./alpine/subscriber-count";
import type { AlpineRuntime } from "./alpine/types";

export default function setup(Alpine: AlpineRuntime) {
  registerAccordion(Alpine);
  registerAma(Alpine);
  registerConfirmation(Alpine);
  registerGithubStars(Alpine);
  registerNewsletter(Alpine);
  registerPortCommands(Alpine);
  registerStars(Alpine);
  registerSubscriberCount(Alpine);
}
