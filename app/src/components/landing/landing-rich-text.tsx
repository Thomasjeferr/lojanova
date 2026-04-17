import { Fragment } from "react";

/**
 * Converte trechos **negrito** em <strong>. Uma linha por vez; quebras \\n viram <br />.
 */
export function LandingRichText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const lines = text.split("\n");
  return (
    <span className={className}>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {li > 0 ? <br /> : null}
          <LandingRichLine text={line} />
        </Fragment>
      ))}
    </span>
  );
}

function LandingRichLine({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
