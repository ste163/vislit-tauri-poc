import {
  writeFile,
  BaseDirectory,
  createDir,
  removeDir,
  join,
} from "./allowed-tauri-apis";
import { getAllProjects, getFileSize } from "./helpers";
import {
  Project,
  ItemMetadata,
  Projects,
  VISLIT_DATA,
  PROJECTS_JSON,
  Actions,
} from "./types";

/**
 * NOTE: (After POC)
 * Instead of having a putProject that handles both CREATE and UPDATE
 * because these two events are very different, break into two separate functions.
 * As the CREATE event creates much more data instead of updating a single json object
 */
async function putProject(project: Project): Promise<ItemMetadata> {
  /**
   * For POC
   * ignoring extra steps for backing up the projects.json
   * incase there is a failure and the file becomes corrupt.
   * In the final version, wrap in a try/catch and restore the backup.
   *
   * Also adding extra unneeded data for the POC and performance measurements.
   */
  const projects = await getAllProjects();

  const projectExists = projects?.[project.id];

  if (projectExists) {
    console.log("attempting to update project - not implemented in POC");
    // doing nothing here because I'm only ever doing a CREATE and not UPDATE
  }

  const newProjectState: Projects = {
    ...projects,
    [project.id]: project,
  };

  await writeProjectState(newProjectState);

  /**
   * New project, create directory structure and files
   */
  await createDir(await join(VISLIT_DATA, "projects", project.id), {
    dir: BaseDirectory.AppData,
    recursive: true,
  });

  await createDir(
    await join(VISLIT_DATA, "projects", project.id, "documents"),
    {
      dir: BaseDirectory.AppData,
      recursive: true,
    }
  );

  await createDir(await join(VISLIT_DATA, "projects", project.id, "notes"), {
    dir: BaseDirectory.AppData,
    recursive: true,
  });

  await writeFile(
    await join(VISLIT_DATA, "projects", project.id, "goals.json"),
    JSON.stringify({}),
    {
      dir: BaseDirectory.AppData,
    }
  );

  await writeFile(
    await join(VISLIT_DATA, "projects", project.id, "progress.json"),
    JSON.stringify({}),
    {
      dir: BaseDirectory.AppData,
    }
  );

  await writeFile(
    await join(VISLIT_DATA, "projects", project.id, "notes.json"),
    JSON.stringify({}),
    {
      dir: BaseDirectory.AppData,
    }
  );

  return {
    projects: newProjectState,
    action: Actions.AddProject,
    itemsAffectedByAction: Object.keys(newProjectState).length,
    totalItems: Object.keys(newProjectState).length,
    fileSize: getFileSize(newProjectState),
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
   */
  const projects = await getAllProjects();

  delete projects?.[id];

  await removeDir(await join(VISLIT_DATA, "projects", id), {
    dir: BaseDirectory.AppData,
    recursive: true,
  });

  await writeProjectState(projects);

  return {
    projects,
    action: Actions.DeleteProject,
    itemsAffectedByAction: projects ? Object.keys(projects).length : 0,
    totalItems: projects ? Object.keys(projects).length : 0,
    fileSize: getFileSize(projects),
  };
}

// NOTE:
// could potentially have a wrapper for writeFile that takes:
// ({path: string, state: Projects | Progress | etc})
// that way, we have 1 place where we check the base dir: AppData.
// so then I only need 1 place to 'getPathToVislitData' as a user will be able to
// set any data storage location they want
async function writeProjectState(state: Projects): Promise<void> {
  await writeFile(
    await join(VISLIT_DATA, PROJECTS_JSON),
    JSON.stringify(state),
    {
      dir: BaseDirectory.AppData,
    }
  );
}

export { putProject, deleteProject };
