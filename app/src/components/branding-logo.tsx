import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SiteBrandingPublic } from "@/lib/site-branding";

type BrandingLogoProps = {
  branding: Pick<SiteBrandingPublic, "logoDataUrl" | "storeDisplayName">;
  href?: string;
  className?: string;
  /** Classes para o <img> quando há logo */
  imgClassName?: string;
  /** Classes para o texto quando não há logo */
  textClassName?: string;
};

export function BrandingLogo({
  branding,
  href = "/",
  className,
  imgClassName,
  textClassName,
}: BrandingLogoProps) {
  const { logoDataUrl, storeDisplayName } = branding;

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 shrink-0", className)}
    >
      {logoDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoDataUrl}
          alt={storeDisplayName}
          className={cn("h-9 w-auto max-w-[180px] object-contain object-left sm:h-10", imgClassName)}
        />
      ) : (
        <span
          className={cn(
            "text-lg font-bold tracking-tight text-zinc-900 sm:text-xl",
            textClassName,
          )}
        >
          {storeDisplayName}
        </span>
      )}
    </Link>
  );
}
