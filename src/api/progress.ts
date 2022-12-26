import {
  writeFile,
  join,
  BaseDirectory,
  readTextFile,
} from "./allowed-tauri-apis";
import { getFileSize } from "./helpers";
import { Paths, Actions, ItemMetadata, KeyedProgress } from "./types";

async function createProgress({
  projectId,
  progress,
}: {
  projectId: string;
  progress: KeyedProgress;
}): Promise<ItemMetadata> {
  await writeProgressState(projectId, progress);

  const allProgress = await getAllProgress(projectId);
  // this is broken!
  const totalProgressCount = Object.keys(allProgress).length;

  return {
    progress,
    action: Actions.AddProgress,
    itemsAffectedByAction: progress ? Object.keys(progress).length : 0,
    totalItems: totalProgressCount,
    yearsWorthOfProgress: totalProgressCount / 12,
    fileSize: getFileSize(progress),
  };
}

async function getAllProgress(projectId: string): Promise<KeyedProgress> {
  const contents = await readTextFile(
    await join(Paths.VislitData, Paths.Projects, projectId, Paths.ProgressJson),
    {
      dir: BaseDirectory.AppData,
    }
  );
  return JSON.parse(contents) as KeyedProgress;
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

export { createProgress };
