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

async function putProject({
  newProjects,
  oldProjects,
}: {
  newProjects: any;
  oldProjects: any;
}) {
  // would need to GET all current projects stored in db (for safety)
  // (ignoring this step for now)
  //
  const newProjectState = { ...oldProjects, ...newProjects };
  await writeFile(
    await join(VISLIT_DATA, PROJECTS_JSON),
    JSON.stringify(newProjectState),
    {
      dir: BaseDirectory.AppData,
    }
  );

  // if the operation was fully successful, then we know that the
  // data written to json was:
  return newProjectState;
  // would ALSO be good to wrap this in a try/catch
  // where we make a backup copy of the projects.json before writing
  // so that if the write operation fails, no data is lost. We would just restore the backup
}

export { putProject };
