import type { MetadataRoute } from "next";

// Private tool: nobody is meant to find it. If this app ever goes public, this file and
// `robots: { index: false }` in src/app/layout.tsx are the two switches to change.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
