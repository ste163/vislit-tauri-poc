// TODO:
// once I figure out which fs and path APIs I need
// add those to the allow-list
import {
  exists,
  createDir,
  writeFile,
  BaseDirectory,
  readTextFile,
} from "@tauri-apps/api/fs";
import { appDataDir, join } from "@tauri-apps/api/path";

/**
 * NOTE
 * ideally, all interactions with the rust api would happen
 * in this /api directory. That way the client has no idea
 * that it's using rust at all and could just as easily be getting
 * its data from somewhere else.
 *
 * This /api would need to be pure JS without any knowledge of Vue
 */

const VISLIT_DATA = "vislit-data";
const PROJECTS_JSON = "projects.json";

interface Project {
  id: string;
  title: string;
  description: string;
  typeId: string;
  type: any;
  goal: any;
  completed: boolean;
  archived: boolean;
  dateCreated: Date;
  dateModified: Date;
}

type Projects = Record<string, Project> | null;

enum Actions {
  InitialLoad = "Initial Load",
  AddProject = "Add Project",
  AddProgress = "Add Progress",
}

interface ItemMetadata {
  projects?: Projects;
  progress?: any; // TODO: add progress type
  action: Actions;
  itemsAffectedByAction: number;
  totalItems: number;
  fileSize: number;
  yearsWorthOfProgress?: number;
}

interface ItemMetadataPerformance extends ItemMetadata {
  timeToComplete: number;
}

/**
 * For easier rendering, round up to nearest tenth.
 * Would be best to do this as a computed prop,
 * but doesn't matter as this is just testing
 */
function roundUpToTwoDecimalPlaces(number: number) {
  return Math.round(number * 100) / 100;
}

/**
 * Performance.now() returns milliseconds.
 * For easier reading, use to convert to seconds
 */
function convertMillisecondsToSeconds(number: number) {
  return number / 1000;
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
 * Wrapper function that takes any async function
 * and returns the time in seconds, rounded up to 2 decimal points
 */
async function measurePerformance(
  fn: (any?: any) => Promise<any>
): Promise<ItemMetadataPerformance> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    ...result,
    timeToComplete: roundUpToTwoDecimalPlaces(
      convertMillisecondsToSeconds(end - start)
    ),
  };
}

async function loadProjectData(): Promise<ItemMetadata> {
  try {
    const VISLIT_DATA_PATH = await join(await appDataDir(), VISLIT_DATA);
    console.log("PATH TO DATA: ", VISLIT_DATA_PATH);
    const doesVislitDataExist = await exists(VISLIT_DATA_PATH);
    if (doesVislitDataExist) {
      const contents = await readTextFile(
        await join(VISLIT_DATA, PROJECTS_JSON),
        { dir: BaseDirectory.AppData }
      );
      const projects = JSON.parse(contents) as Projects;
      return {
        projects,
        action: Actions.InitialLoad,
        itemsAffectedByAction: 0,
        totalItems: projects ? Object.keys(projects).length : 0,
        fileSize: roundUpToTwoDecimalPlaces(getFileSize(projects)),
      };
    } else {
      await createDir(VISLIT_DATA, {
        dir: BaseDirectory.AppData,
        recursive: true,
      });
      await writeFile(await join(VISLIT_DATA, PROJECTS_JSON), "{}", {
        dir: BaseDirectory.AppData,
      });
      return {
        projects: null,
        action: Actions.InitialLoad,
        itemsAffectedByAction: 0,
        totalItems: 0,
        fileSize: 0,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      projects: null,
      action: Actions.InitialLoad,
      itemsAffectedByAction: 0,
      totalItems: 0,
      fileSize: 0,
    };
  }
}

async function putProject({
  projectsToPut,
  previousProjectState,
}: {
  projectsToPut: Projects;
  previousProjectState: Projects;
}): Promise<ItemMetadata> {
  /**
   * For POC
   * ignoring extra steps for backing up the projects.json
   * incase there is a failure and the file becomes corrupt.
   * In the final version, wrap in a try/catch and restore the backup
   */
  const newProjectState: Projects = {
    ...previousProjectState,
    ...projectsToPut,
  };
  await writeFile(
    await join(VISLIT_DATA, PROJECTS_JSON),
    JSON.stringify(newProjectState),
    {
      dir: BaseDirectory.AppData,
    }
  );
  return {
    projects: newProjectState,
    action: Actions.AddProject,
    itemsAffectedByAction: Object.keys(newProjectState).length,
    totalItems: Object.keys(newProjectState).length,
    fileSize: roundUpToTwoDecimalPlaces(getFileSize(newProjectState)),
  };
}

export { measurePerformance, loadProjectData, putProject };

export type { ItemMetadataPerformance, Project, Projects };
