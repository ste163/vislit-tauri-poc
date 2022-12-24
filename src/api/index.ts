// TODO:
// once I figure out which fs and path APIs I need
// add those to the allow-list
import { writeFile, BaseDirectory } from "@tauri-apps/api/fs";
import { join } from "@tauri-apps/api/path";
import { initializeApi } from "./init";
import { measurePerformance } from "./performance";
import { getAllProjects, getFileSize } from "./helpers";
import {
  VISLIT_DATA,
  PROJECTS_JSON,
  Actions,
  Project,
  Projects,
  Progress,
  ItemMetadata,
  ItemMetadataPerformance,
} from "./types";

// TODO:
// separate the functions out of index into:
// projects.ts
// progress.ts

/**
 * NOTE
 * ideally, all interactions with the rust api would happen
 * in this /api directory. That way the client has no idea
 * that it's using rust at all and could just as easily be getting
 * its data from somewhere else.
 *
 * This /api would need to be pure JS without any knowledge of Vue
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

  const projectExists = projects ? projects[project.id] : false;

  if (projectExists) {
    console.log("attempting to update project - not implemented in POC");
    // doing nothing here because I'm only ever doing POST for POC
    // and not UPDATE
    // not returning anything here either
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
    fileSize: getFileSize(projects),
  };
}

async function putProgress(progress: Progress): Promise<ItemMetadata> {
  console.log("PUT", progress);
  // return progress and estimate on how many years
}

export {
  measurePerformance,
  initializeApi,
  putProject,
  deleteProject,
  putProgress,
};

export type { ItemMetadataPerformance, Project, Projects, Progress };
