import { readTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { join } from "@tauri-apps/api/path";
import { Projects, PROJECTS_JSON, VISLIT_DATA } from "./types";

/**
 * Non-exported helper for quickly getting projects
 */
async function getAllProjects(): Promise<Projects> {
  const contents = await readTextFile(await join(VISLIT_DATA, PROJECTS_JSON), {
    dir: BaseDirectory.AppData,
  });
  return JSON.parse(contents) as Projects;
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
export { getAllProjects, getFileSize };
