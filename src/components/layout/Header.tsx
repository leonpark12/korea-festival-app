import { useTranslations } from "next-intl";
import Logo from "./Logo";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Header() {
  const t = useTranslations("header");

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex h-14 items-center justify-between bg-white/90 px-4 shadow-sm backdrop-blur-sm lg:px-6">
      <Logo />
      <LocaleSwitcher />
    </header>
  );
}
