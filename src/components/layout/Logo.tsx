import { Link } from "@/i18n/navigation";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="text-xl">🗺️</span>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Korea Travel Map
      </span>
    </Link>
  );
}
