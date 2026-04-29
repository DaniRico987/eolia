import { useState } from "react";

const PRIMARY_LOGO_PATH = "/logo-eolia.png";
const FALLBACK_LOGO_PATH = "/favicon.svg";

export default function EoliaLogo({
  alt = "Eolia",
  className = "h-10 w-auto",
  fallbackClassName = "text-2xl",
}) {
  const [fallback, setFallback] = useState(false);

  if (fallback) {
    return (
      <span className={fallbackClassName} role="img" aria-label={alt}>
        🌾
      </span>
    );
  }

  return (
    <img
      src={PRIMARY_LOGO_PATH}
      alt={alt}
      className={className}
      onError={(event) => {
        if (event.currentTarget.src.includes(FALLBACK_LOGO_PATH)) {
          setFallback(true);
        } else {
          event.currentTarget.src = FALLBACK_LOGO_PATH;
        }
      }}
    />
  );
}
