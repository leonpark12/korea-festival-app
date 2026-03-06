import { setRequestLocale } from "next-intl/server";
import MapShellLoader from "@/components/map/MapShellLoader";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MapPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <h1 className="sr-only">
        {locale === "ko"
          ? "Tour Korea - 한국 관광 지도"
          : "Tour Korea - Interactive Korea Travel Map"}
      </h1>
      <MapShellLoader />
    </>
  );
}
