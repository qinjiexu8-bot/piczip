import { ContentPage } from "@/components/site/ContentPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "PicZip privacy policy. Image files are compressed locally in the browser and are not uploaded to a server for processing.",
  path: "/privacy",
});

export default function Page() {
  return (
    <ContentPage
      title="Privacy policy"
      description="PicZip is designed around local browser processing, clear privacy boundaries, and minimal data collection."
      locale="en"
      breadcrumbLabel="Privacy"
    >
      <h2>Image files</h2>
      <p>
        PicZip compresses selected images in your browser. The image files you choose are not
        uploaded to a PicZip server for processing. Temporary browser storage is used only when you choose to continue in another tool, as described below.
      </p>
      <h2>Analytics</h2>
      <p>
        We use Vercel Web Analytics to measure page views, referral sources, and browser and device
        types. Page visit data is sent to Vercel for aggregated statistics without third-party
        cookies. We do not send image files, file names, or image hashes to the analytics service.
      </p>
      <p>
        For details, see the{" "}
        <a className="font-medium text-teal-700 underline underline-offset-4" href="https://vercel.com/docs/analytics/privacy-policy">
          Vercel Web Analytics privacy documentation
        </a>.
      </p>
      <h2>Browser storage</h2>
      <p>
        Processing results stay in browser memory. When you choose Continue processing, the selected results and their file names are temporarily stored in this browser to pass them to the next tool. They are removed after receipt. Unused transfers expire after 10 minutes and are cleaned up the next time a tool accesses this storage.
      </p>
      <p>Batch presets store only the name you enter and tool settings in this browser, until you delete them or clear site data. They do not include images and do not sync to other browsers or devices.</p>
      <h2>Contact</h2>
      <p>Questions about privacy can be sent through the public contact channel after it is added.</p>
    </ContentPage>
  );
}
