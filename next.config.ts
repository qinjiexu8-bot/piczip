import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // Guide article images render in a `max-w-4xl` column (896px) minus `sm:px-8`
    // padding, i.e. exactly 832px at desktop widths. Next's default device ladder
    // jumps 828 -> 1080, so a 832px `sizes` claim resolved to the 1080 variant and
    // fetched an unnecessarily wide image on DPR-1 displays. Adding 832 keeps the
    // desktop pick exact.
    deviceSizes: [640, 750, 828, 832, 1080, 1200, 1920, 2048, 3840],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
