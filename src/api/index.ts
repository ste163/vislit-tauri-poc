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

// maybe this would be good?
// '2020-01-01': {
//   ...Progress
// }

interface Progress {
  date: Date; // or should this be in 2020-01-01 without time stamp? That way, the key is the date. But then we don't have the iso timestamp?
  projectId: string;
  goalId: string;
  count: number; // word count
  edited: boolean;
  proofread: boolean;
  revised: boolean;
  completed: boolean;
}

type Projects = Record<string, Project> | null;

enum Actions {
  InitialLoad = "Initial Load",
  AddProject = "Add Project",
  DeleteProject = "Delete Project",
  AddProgress = "Add Progress",
}

interface ItemMetadata {
  projects?: Projects;
  progress?: Progress;
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

async function getAllProjects(): Promise<Projects> {
  try {
    const contents = await readTextFile(
      await join(VISLIT_DATA, PROJECTS_JSON),
      {
        dir: BaseDirectory.AppData,
      }
    );
    return JSON.parse(contents) as Projects;
  } catch (error) {
    console.log("getAllProjects - ", error);
    return null;
  }
}

async function loadProjectData(): Promise<ItemMetadata> {
  try {
    const VISLIT_DATA_PATH = await join(await appDataDir(), VISLIT_DATA);
    console.log("PATH TO DATA: ", VISLIT_DATA_PATH);
    const doesVislitDataExist = await exists(VISLIT_DATA_PATH);
    if (doesVislitDataExist) {
      const projects = await getAllProjects();
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
   * In the final version, wrap in a try/catch and restore the backup.
   *
   * Also adding extra unneeded data for the POC and performance measurements.
   * Reading the raw JSON is extremely fast, so I do not, and should not, pass in previous state
   */
  // NOTE:
  // Because getAllProjects is very fast, do not need to pass in previous project state
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

async function deleteProject(id: string): Promise<ItemMetadata> {
  /**
   * For POC
   * ignoring extra steps for backing up the projects.json
   * incase there is a failure and the file becomes corrupt.
   * In the final version, wrap in a try/catch and restore the backup
   *
   * Also adding extra unneeded data for the POC and performance measurements.
   * Reading the raw JSON is extremely fast, so I do not, and should not, pass in previous state
   */
  // NOTE: reading full project state here, because it loads EXTREMELY quickly
  const projects = await getAllProjects();
  if (projects) delete projects[id];
  await writeFile(
    await join(VISLIT_DATA, PROJECTS_JSON),
    JSON.stringify(projects),
    {
      dir: BaseDirectory.AppData,
    }
  );
  return {
    projects,
    action: Actions.DeleteProject,
    itemsAffectedByAction: projects ? Object.keys(projects).length : 0,
    totalItems: projects ? Object.keys(projects).length : 0,
    fileSize: roundUpToTwoDecimalPlaces(getFileSize(projects)),
  };
}

async function putProgress(progress: Progress): Promise<ItemMetadata> {
  console.log("PUT", progress);
  // return progress and estimate on how many years
}

export {
  measurePerformance,
  loadProjectData,
  putProject,
  deleteProject,
  putProgress,
};

export type { ItemMetadataPerformance, Project, Projects, Progress };
