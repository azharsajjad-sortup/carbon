import { VStack, cn, useDisclosure } from "@carbon/react";
import { Link, useMatches } from "@remix-run/react";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { z } from "zod";
import { useModules, useOptimisticLocation } from "~/hooks";
import type { Authenticated, NavItem } from "~/types";

export const ModuleHandle = z.object({
  module: z.string(),
});

const PrimaryNavigation = () => {
  const navigationPanel = useDisclosure();
  const location = useOptimisticLocation();
  const currentModule = getModule(location.pathname);
  const links = useModules();
  const matchedModules = useMatches().reduce((acc, match) => {
    if (match.handle) {
      const result = ModuleHandle.safeParse(match.handle);
      if (result.success) {
        acc.add(result.data.module);
      }
    }

    return acc;
  }, new Set<string>());
  const hiddenModules: string[] = [];
  return (
    <div className="w-14 h-full flex-col z-50 hidden sm:flex">
      <nav
        data-state={navigationPanel.isOpen ? "expanded" : "collapsed"}
        className={cn(
          "bg-background py-2 group z-10 h-full w-14 data-[state=expanded]:w-[13rem]",
          "flex flex-col justify-between data-[state=expanded]:shadow-xl data-[state=expanded]:border-r data-[state=expanded]:border-border",
          "transition-width duration-200",
          "hide-scrollbar overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-accent"
        )}
        onMouseEnter={navigationPanel.onOpen}
        onMouseLeave={navigationPanel.onClose}
      >
        <VStack
          spacing={1}
          className="flex flex-col justify-between h-full px-2"
        >
          <VStack spacing={1}>
            {links.map((link) => {
              const m = getModule(link.to);
              if (hiddenModules.includes(link.name)) {
                return null;
              }
              const moduleMatches = matchedModules.has(m);

              const isActive = currentModule === m || moduleMatches;
              return (
                <NavigationIconLink
                  key={link.name}
                  link={link}
                  isActive={isActive}
                  isOpen={navigationPanel.isOpen}
                  onClick={navigationPanel.onClose}
                />
              );
            })}
          </VStack>
        </VStack>
      </nav>
    </div>
  );
};

interface NavigationIconButtonProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  link: Authenticated<NavItem>;
  isActive?: boolean;
  isOpen?: boolean;
}

const NavigationIconLink = forwardRef<
  HTMLAnchorElement,
  NavigationIconButtonProps
>(({ link, isActive = false, isOpen = false, onClick, ...props }, ref) => {
  const iconClasses = [
    "absolute left-3 top-3 flex rounded-md items-center items-center justify-center", // Layout
  ];

  const classes = [
    "relative",
    "h-10 w-10 group-data-[state=expanded]:w-full",
    "transition-all duration-200",
    "flex items-center rounded-md",
    "group-data-[state=collapsed]:justify-center",
    "group-data-[state=expanded]:-space-x-2",
    "hover:bg-active/80 hover:text-active-foreground",
    "font-medium shrink-0 group inline-flex items-center justify-center select-none transform-gpu initial:border-none disabled:opacity-50",
    "focus:!outline-none focus:!ring-0 active:!outline-none active:!ring-0",
    "after:pointer-events-none after:absolute after:-inset-[3px] after:rounded-lg after:border after:border-blue-500 after:opacity-0 after:ring-2 after:ring-blue-500/20 after:transition-opacity focus-visible:after:opacity-100 active:after:opacity-0",
    "before:pointer-events-none before:bg-gradient-to-b before:transition-opacity before:from-white/[0.12] before:absolute before:inset-0 before:z-[1] before:rounded before:opacity-0",
    `${
      isActive
        ? "bg-active text-active-foreground hover:text-active-foreground hover:bg-active/90 shadow-button-base"
        : "hover:text-active-foreground"
    }`,
    "group/item",
  ];

  return (
    <Link
      role="button"
      aria-current={isActive}
      ref={ref}
      to={link.to}
      {...props}
      onClick={onClick}
      className={cn(classes, props.className)}
      prefetch="intent"
    >
      <link.icon className={cn(...iconClasses)} />

      <span
        aria-hidden={isOpen || undefined}
        className={cn(
          "min-w-[128px] text-sm",
          "absolute left-7 group-data-[state=expanded]:left-12",
          "opacity-0 group-data-[state=expanded]:opacity-100"
        )}
      >
        {link.name}
      </span>
    </Link>
  );
});
NavigationIconLink.displayName = "NavigationIconLink";

export default PrimaryNavigation;

export function getModule(link: string) {
  return link.split("/")?.[2];
}
