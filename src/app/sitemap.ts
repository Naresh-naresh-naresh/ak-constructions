import type { MetadataRoute } from "next";
import { clientConfig } from "@/config/client";

/**
 * One public page. The homepage is a single-scroll layout with #gallery,
 * #services and the rest as anchors, and Google treats fragments as the same
 * URL — so listing them would just be duplicate entries.
 *
 * When the packages section goes live it stays an anchor too. If AK ever wants
 * separate ranking pages per area ("interior designers in Adyar"), those become
 * real routes and belong here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: clientConfig.siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
