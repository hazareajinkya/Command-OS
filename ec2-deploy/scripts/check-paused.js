#!/usr/bin/env node

/**
 * Check if Mission Control squad is paused.
 * Exit 0 = paused (do not wake agents)
 * Exit 1 = not paused (proceed with heartbeat)
 *
 * Used by heartbeat-wrapper.sh. Requires CONVEX_URL in env.
 */

const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("check-paused: CONVEX_URL required");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

client
  .query("system:get")
  .then((result) => {
    process.exit(result?.paused ? 0 : 1);
  })
  .catch((err) => {
    console.error("check-paused:", err.message);
    process.exit(1); // On error, assume not paused (allow heartbeat)
  });
