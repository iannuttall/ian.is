import { cn } from '@/lib/utils';
import { ChevronDownIcon } from '@/components/ui/icon';

export { default as Accordion } from './accordion.astro'
export { default as AccordionItem } from './accordion-item.astro'
export { default as AccordionTrigger } from './accordion-trigger.astro'
export { default as AccordionContent } from './accordion-content.astro'

const accordionItemVariants = {
    default: 'border-b',
    card: 'rounded-xl bg-card px-6 shadow-md',
};
