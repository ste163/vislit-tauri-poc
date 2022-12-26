import {
  appDataDir,
  BaseDirectory,
  createDir,
  exists,
  join,
  writeFile,
} from "./allowed-tauri-apis";
import { getAllProjects, getFileSize } from "./helpers";
import { Paths, Actions, ItemMetadata } from "./types";

/**
 * Initializes the API by either creating directories and files
 * or loading them if they exist. To be called when App mounts.
 */
async function initializeApi(): Promise<ItemMetadata> {
  try {
    const VISLIT_DATA_PATH = await join(await appDataDir(), Paths.VislitData);
    console.log("PATH TO DATA: ", VISLIT_DATA_PATH);
    const doesVislitDataExist = await exists(VISLIT_DATA_PATH);
    /**
     * First time setup, create all needed .json files and directory structure
     */
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
      /**
       * This user has started the app before, so load their data.
       * TODO after POC: user can select a custom data location, so read
       * where that is first then get the data from there.
       * (This may require writing custom Rust code as this will be a direct path
       * to anywhere on the file system). And depending on how tightly related the endpoints are
       * to file paths, might be best to follow the Class-based structure with dependency injection
       * like the Electron version of Vislit
       */
      await createDir(Paths.VislitData, {
        dir: BaseDirectory.AppData,
        recursive: true,
      });
      await writeFile(await join(Paths.VislitData, Paths.ProjectsJson), "{}", {
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
