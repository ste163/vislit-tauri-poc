import { ItemMetadataPerformance, ItemMetadata } from "./types";

/**
 * Wrapper function that takes any async function
 * and returns performance data about that function
 */
async function measurePerformance(
  fn: (any?: any) => Promise<ItemMetadata>
): Promise<ItemMetadataPerformance> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    ...result,
    projectsJsonSize: roundUpToTwoDecimalPlaces(result?.projectsJsonSize || 0),
    progressJsonSize: roundUpToTwoDecimalPlaces(result?.progressJsonSize || 0),
    yearsWorthOfProgress: result.yearsWorthOfProgress
      ? roundUpToTwoDecimalPlaces(result.yearsWorthOfProgress)
      : undefined,
    timeToComplete: roundUpToTwoDecimalPlaces(
      convertMillisecondsToSeconds(end - start)
    ),
  };
}

/**
 * Gets the estimated file size of a json string object.
 * Because storing everything as JSON, this should be
 * pretty accurate.
 * Returns size in megabytes or 0 if an error.
 */
function getFileSize(any: any) {
  try {
    const length = new TextEncoder().encode(JSON.stringify(any)).length;
    const sizeInKiloBytes = length / 1024;
    const sizeInMegaBytes = sizeInKiloBytes / 1024;
    return sizeInMegaBytes;
  } catch (error) {
    console.log("error getting file size for", any);
    console.error(error);
    return 0;
  }
}

/**
 * Performance.now() returns milliseconds.
 * For easier rendering, use this to convert to seconds
 */
const convertMillisecondsToSeconds = (number: number) => number / 1000;

/**
 * For easier rendering, round up to nearest tenth.
 * Would be best to do this as a computed prop,
 * but doesn't matter as this is a POC
 */
const roundUpToTwoDecimalPlaces = (number: number) =>
  Math.round(number * 100) / 100;

export { getFileSize, measurePerformance };
