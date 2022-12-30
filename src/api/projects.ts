import {
  writeFile,
  BaseDirectory,
  createDir,
  removeDir,
  join,
  readTextFile,
} from "./allowed-tauri-apis";
import { getFileSize } from "./metrics";
import { Project, ItemMetadata, Projects, Paths, Actions } from "./types";

async function getAllProjects(): Promise<Projects> {
  const contents = await readTextFile(
    await join(Paths.VislitData, Paths.ProjectsJson),
    {
      dir: BaseDirectory.AppData,
    }
  );
  return JSON.parse(contents) as Projects;
}

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
  await createDir(await join(Paths.VislitData, Paths.Projects, project.id), {
    dir: BaseDirectory.AppData,
    recursive: true,
  });

  await createDir(
    await join(Paths.VislitData, Paths.Projects, project.id, "documents"),
    {
      dir: BaseDirectory.AppData,
      recursive: true,
    }
  );

  await createDir(
    await join(Paths.VislitData, Paths.Projects, project.id, "notes"),
    {
      dir: BaseDirectory.AppData,
      recursive: true,
    }
  );

  await writeFile(
    await join(Paths.VislitData, Paths.Projects, project.id, "goals.json"),
    JSON.stringify({}),
    {
      dir: BaseDirectory.AppData,
    }
  );

  await writeFile(
    await join(
      Paths.VislitData,
      Paths.Projects,
      project.id,
      Paths.ProgressJson
    ),
    JSON.stringify({}),
    {
      dir: BaseDirectory.AppData,
    }
  );

  await writeFile(
    await join(Paths.VislitData, Paths.Projects, project.id, "notes.json"),
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
    projectsJsonSize: getFileSize(newProjectState),
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

  await removeDir(await join(Paths.VislitData, Paths.Projects, id), {
    dir: BaseDirectory.AppData,
    recursive: true,
  });

  await writeProjectState(projects);

  return {
    projects,
    action: Actions.DeleteProject,
    itemsAffectedByAction: projects ? Object.keys(projects).length : 0,
    totalItems: projects ? Object.keys(projects).length : 0,
    projectsJsonSize: getFileSize(projects),
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
    await join(Paths.VislitData, Paths.ProjectsJson),
    JSON.stringify(state),
    {
      dir: BaseDirectory.AppData,
    }
  );
}

export { getAllProjects, putProject, deleteProject };
