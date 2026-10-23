// Static at build time: lets the deployment workflow verify the production alias.
export const dynamic = "force-static";

export function GET() {
  return Response.json(
    { sha: process.env.VERCEL_GIT_COMMIT_SHA ?? "local" },
    { headers: { "X-Robots-Tag": "noindex", "Cache-Control": "no-cache" } },
  );
}
