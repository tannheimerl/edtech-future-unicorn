import NextLink from "next/link";
import type { ComponentProps } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/*
  The one link style in the app: always primary (blue/indigo), never grey,
  text-base (16px) — a size step above the surrounding body copy. An `icon`
  prop renders a Material Symbols glyph before the label; never use a text
  arrow character ("→") for this.
*/
const linkClassName =
  "inline-flex w-fit items-center gap-1 text-base text-primary hover:underline underline-offset-3 focus-visible:underline outline-none";

type IconLinkProps = {
  icon?: string;
  external?: boolean;
} & ComponentProps<typeof NextLink>;

export const IconLink = ({
  icon,
  external,
  className,
  children,
  href,
  ...props
}: IconLinkProps) => {
  const content = (
    <>
      {icon && <Icon name={icon} size={16} className="shrink-0" />}
      {children}
    </>
  );

  if (external) {
    return (
      <a
        href={href.toString()}
        target="_blank"
        rel="noopener noreferrer"
        data-slot="link"
        className={cn(linkClassName, className)}
      >
        {content}
      </a>
    );
  }

  return (
    <NextLink
      href={href}
      data-slot="link"
      className={cn(linkClassName, className)}
      {...props}
    >
      {content}
    </NextLink>
  );
};
