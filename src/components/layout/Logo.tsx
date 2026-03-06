import { Link } from "@/i18n/navigation";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="16" fill="#003049" />
        <path
          d="M16 6C12.13 6 9 9.13 9 13c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          fill="#fcbf49"
        />
        <circle cx="16" cy="13" r="3" fill="#003049" />
      </svg>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Tour Korea
      </span>
    </Link>
  );
}
