import { setRequestLocale } from "next-intl/server";
import MapShellLoader from "@/components/map/MapShellLoader";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MapPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MapShellLoader />;
}
