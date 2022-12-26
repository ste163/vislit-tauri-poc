import { Progress, ItemMetadata } from "./types";

async function putProgress(progress: Progress): Promise<ItemMetadata> {
  console.log("PUT", progress);
  // return progress and estimate on how many years
}

export { putProgress };
