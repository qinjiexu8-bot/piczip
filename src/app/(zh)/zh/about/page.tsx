import { InfoPage, infoMetadata } from "@/components/site/InfoPage";

export const metadata = infoMetadata("zh", "about");

export default function Page() {
  return <InfoPage locale="zh" kind="about" />;
}
