import { ItemMetadataPerformance } from ".";
import { ItemMetadata } from "./types";

/**
 * Wrapper function that takes any async function
 * and returns the time in seconds, rounded up to 2 decimal points
 */
async function measurePerformance(
  fn: (any?: any) => Promise<ItemMetadata>
): Promise<ItemMetadataPerformance> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(result);
  return {
    ...result,
    fileSize: roundUpToTwoDecimalPlaces(result.fileSize),
    timeToComplete: roundUpToTwoDecimalPlaces(
      convertMillisecondsToSeconds(end - start)
    ),
  };
}

/**
 * Performance.now() returns milliseconds.
 * For easier reading, use this to convert to seconds
 */
const convertMillisecondsToSeconds = (number: number) => number / 1000;

/**
 * For easier rendering, round up to nearest tenth.
 * Would be best to do this as a computed prop,
 * but doesn't matter as this is a POC
 */
const roundUpToTwoDecimalPlaces = (number: number) =>
  Math.round(number * 100) / 100;

export { measurePerformance };
