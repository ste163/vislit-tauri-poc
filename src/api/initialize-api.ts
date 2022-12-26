import {
  exists,
  createDir,
  BaseDirectory,
  writeFile,
} from "@tauri-apps/api/fs";
import { join, appDataDir } from "@tauri-apps/api/path";
import { getAllProjects, getFileSize } from "./helpers";
import { Actions, ItemMetadata, PROJECTS_JSON, VISLIT_DATA } from "./types";

/**
 * Initializes the API by either creating directories and files
 * or loading them if they exist. To be called when App mounts.
 */
async function initializeApi(): Promise<ItemMetadata> {
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
        fileSize: getFileSize(projects),
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

export { initializeApi };
