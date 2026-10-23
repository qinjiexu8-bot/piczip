import { InfoPage, infoMetadata } from "@/components/site/InfoPage";

export const metadata = infoMetadata("en", "faq");

export default function Page() {
  return <InfoPage locale="en" kind="faq" />;
}
