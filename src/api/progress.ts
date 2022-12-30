import {
  writeFile,
  join,
  BaseDirectory,
  readTextFile,
} from "./allowed-tauri-apis";
import { getFileSize } from "./metrics";
import { Paths, Actions, ItemMetadata, KeyedProgress } from "./types";

async function getAllProgress(projectId: string): Promise<KeyedProgress> {
  const contents = await readTextFile(
    await join(Paths.VislitData, Paths.Projects, projectId, Paths.ProgressJson),
    {
      dir: BaseDirectory.AppData,
    }
  );
  return JSON.parse(contents) as KeyedProgress;
}

async function getAllProgressWithMetaData(
  projectId: string
): Promise<ItemMetadata> {
  const progress = await getAllProgress(projectId);
  const totalProgressCount = Object.keys(progress).length;
  return {
    progress,
    action: Actions.LoadProgress,
    itemsAffectedByAction: 0,
    totalItems: totalProgressCount,
    yearsWorthOfProgress: totalProgressCount / 30 / 12, // divide from days into months, then years
    progressJsonSize: getFileSize(progress),
  };
}

async function createProgress({
  projectId,
  progress,
}: {
  projectId: string;
  progress: KeyedProgress;
}): Promise<ItemMetadata> {
  const allProgress = await getAllProgress(projectId);
  const newProgressState: KeyedProgress = {
    ...allProgress,
    ...progress,
  };
  const totalProgressCount = Object.keys(newProgressState).length;
  await writeProgressState(projectId, newProgressState);
  return {
    progress: newProgressState,
    action: Actions.AddProgress,
    itemsAffectedByAction: Object.keys(progress).length,
    totalItems: totalProgressCount,
    yearsWorthOfProgress: totalProgressCount / 30 / 12, // divide from days into months, then years
    progressJsonSize: getFileSize(newProgressState),
  };
}

async function writeProgressState(
  projectId: string,
  state: KeyedProgress
): Promise<void> {
  await writeFile(
    await join(Paths.VislitData, Paths.Projects, projectId, Paths.ProgressJson),
    JSON.stringify(state),
    {
      dir: BaseDirectory.AppData,
    }
  );
}

export { getAllProgressWithMetaData, createProgress };
