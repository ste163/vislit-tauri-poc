enum Paths {
  VislitData = "vislit-data",
  Projects = "projects",
  ProjectsJson = "projects.json",
  ProgressJson = "progress.json",
}

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

// would potentially be best to ALWAYS store dates using the client's timezone
// and then rendering and checking based on that.
// so then there is always the right amount of data. It may fix the issues
// of a user
/**
 * Progress object is
 * [new Date()]: { Progress }
 * and then when we check the Add/Update
 * we check it based on if there is any date for this day
 * regardless of timezone
 */
interface Progress {
  date: Date;
  projectId: string;
  goalId: string;
  count: number; // word count
  edited: boolean;
  proofread: boolean;
  revised: boolean;
  completed: boolean;
}

// new Date.toISOString() will probably be best, but can play around with it
type KeyedProgress = Record<string, Progress>;

type Projects = Record<string, Project>;

enum Actions {
  InitialLoad = "Initial Load",
  AddProject = "Add Project",
  DeleteProject = "Delete Project",
  LoadProgress = "Progress Loaded",
  AddProgress = "Add Progress",
}

interface ItemMetadata {
  projects?: Projects;
  progress?: KeyedProgress;
  action: Actions;
  itemsAffectedByAction: number;
  totalItems: number;
  fileSize: number;
  yearsWorthOfProgress?: number;
}

interface ItemMetadataPerformance extends ItemMetadata {
  timeToComplete: number;
}

export { Paths, Actions };

export type {
  Project,
  Projects,
  Progress,
  KeyedProgress,
  ItemMetadata,
  ItemMetadataPerformance,
};
