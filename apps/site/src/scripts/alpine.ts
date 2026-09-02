import { registerAccordion } from "./alpine/accordion";
import { registerAma } from "./alpine/ama";
import { registerConfirmation } from "./alpine/confirmation";
import { registerGithubStars } from "./alpine/github-stars";
import { registerHoverGroup } from "./alpine/hover-group";
import { registerLastVisit } from "./alpine/last-visit";
import { registerNewsletter } from "./alpine/newsletter";
import { registerPortCommands } from "./alpine/port-commands";
import { registerPostViews } from "./alpine/post-views";
import { registerStars } from "./alpine/stars";
import { registerSubscriberCount } from "./alpine/subscriber-count";
import type { AlpineRuntime } from "./alpine/types";

export default function setup(Alpine: AlpineRuntime) {
  registerAccordion(Alpine);
  registerAma(Alpine);
  registerConfirmation(Alpine);
  registerGithubStars(Alpine);
  registerHoverGroup(Alpine);
  registerLastVisit(Alpine);
  registerNewsletter(Alpine);
  registerPortCommands(Alpine);
  registerPostViews(Alpine);
  registerStars(Alpine);
  registerSubscriberCount(Alpine);
}
