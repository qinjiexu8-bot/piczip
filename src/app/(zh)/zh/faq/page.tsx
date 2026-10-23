import { InfoPage, infoMetadata } from "@/components/site/InfoPage";

export const metadata = infoMetadata("zh", "faq");

export default function Page() {
  return <InfoPage locale="zh" kind="faq" />;
}
