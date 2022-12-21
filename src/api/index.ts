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

type Projects = Record<string, Project> | {} | null;

async function loadProjectData() {
  // TODO:
  // log time dif on how long it takes to load data
  // and return that to display
  console.log("START - LOADING DATA");
  try {
    const VISLIT_DATA_PATH = await join(await appDataDir(), VISLIT_DATA);
    const doesVislitDataExist = await exists(VISLIT_DATA_PATH);
    if (doesVislitDataExist) {
      console.log("DATA EXISTS - READING FILE");
      const contents = await readTextFile(
        await join(VISLIT_DATA, PROJECTS_JSON),
        { dir: BaseDirectory.AppData }
      );
      const value = JSON.parse(contents) as Projects;
      console.log("END - READ PROJECT DATA FROM FILE", value);
      return value;
    } else {
      console.log("DATA DOES NOT EXIST - CREATE VISLIT DATA");
      await createDir(VISLIT_DATA, {
        dir: BaseDirectory.AppData,
        recursive: true,
      });
      console.log("VISLIT DATA DIRECTORY CREATED AT: ", VISLIT_DATA_PATH);
      await writeFile(await join(VISLIT_DATA, PROJECTS_JSON), "{}", {
        dir: BaseDirectory.AppData,
      });
      console.log("END - PROJECT.JSON CREATED");
      return {};
    }
  } catch (error) {
    console.error(error);
    return {};
  }
}

async function putProject({
  projectsToPut,
  previousProjectState,
}: {
  projectsToPut: Projects;
  previousProjectState: Projects;
}) {
  /**
   * For POC
   * ignoring extra steps for backing up the projects.json
   * incase there is a failure and the file becomes corrupt.
   * In the final version, wrap in a try/catch and restore the backup
   */
  const newProjectState = { ...previousProjectState, ...projectsToPut };
  await writeFile(
    await join(VISLIT_DATA, PROJECTS_JSON),
    JSON.stringify(newProjectState),
    {
      dir: BaseDirectory.AppData,
    }
  );

  // if the operation was fully successful, then we know that the
  // data written to json was:
  // TODO:
  // return:
  // {
  // project state
  // how long it took to run the function
  // how many projects were added
  // }
  return newProjectState;
}

export { loadProjectData, putProject };

export type { Project, Projects };
