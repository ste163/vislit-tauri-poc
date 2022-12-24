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

export { Actions, VISLIT_DATA, PROJECTS_JSON };
export type {
  Project,
  Projects,
  Progress,
  ItemMetadata,
  ItemMetadataPerformance,
};
