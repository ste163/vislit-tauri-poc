// TODO:
// once I figure out which fs and path APIs I need
// add those to the allow-list
import { writeFile, BaseDirectory } from "@tauri-apps/api/fs";
import { join } from "@tauri-apps/api/path";
import { getAllProjects, getFileSize } from "./helpers";
import {
  Project,
  ItemMetadata,
  Projects,
  VISLIT_DATA,
  PROJECTS_JSON,
  Actions,
} from "./types";

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

  // TODO:
  // assuming that all projects are CREATE
  // so create the directory structure and JSON files for a project

  const newProjectState: Projects = {
    ...projects,
    [project.id]: project,
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
    fileSize: getFileSize(projects),
  };
}

export { putProject, deleteProject };
