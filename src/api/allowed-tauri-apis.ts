// TODO:
// update tauri.conf.json
// to only allow these apis
import {
  exists,
  writeFile,
  readTextFile,
  BaseDirectory,
  createDir,
  removeDir,
} from "@tauri-apps/api/fs";
import { appDataDir, join } from "@tauri-apps/api/path";

export {
  exists,
  writeFile,
  readTextFile,
  BaseDirectory,
  createDir,
  removeDir,
  appDataDir,
  join,
};
