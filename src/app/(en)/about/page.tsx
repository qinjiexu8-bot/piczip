import { InfoPage, infoMetadata } from "@/components/site/InfoPage";

export const metadata = infoMetadata("en", "about");

export default function Page() {
  return <InfoPage locale="en" kind="about" />;
}
