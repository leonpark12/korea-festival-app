import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-muted-foreground">404</h1>
        <p className="text-lg text-muted-foreground">Page not found</p>
      </div>
    </div>
  );
}
