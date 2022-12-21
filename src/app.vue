<script setup lang="ts">
import { invoke } from "@tauri-apps/api";
// TODO: once I figure out which fs and path apis I need
// add those to the allow-list
import {
  exists,
  createDir,
  writeFile,
  BaseDirectory,
  readTextFile,
} from "@tauri-apps/api/fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { onMounted, ref } from "vue";
// faker is recommended to be a devDep; however,
// i want to test to do performance testing for writing data
// on the production tauri app, which will require loads of fake data
import { faker } from "@faker-js/faker/locale/en";

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

type Projects = Record<string, Project> | {} | null;

const projects = ref<Projects>(null);

// example of saving to the file system
// https://www.matthewtao.com/blog/post/glipma-devlog-2/

async function loadData() {
  console.log("START - LOADING DATA");
  try {
    const VISLIT_DATA_PATH = await join(await appDataDir(), VISLIT_DATA);
    const doesVislitDataExist = await exists(VISLIT_DATA_PATH);
    if (doesVislitDataExist) {
      console.log("DATA EXISTS - READING FILE");
      const contents = await readTextFile(
        await join(VISLIT_DATA, PROJECTS_JSON),
        { dir: BaseDirectory.AppData }
      );
      const value = JSON.parse(contents) as Projects;
      console.log("END - READ PROJECT DATA FROM FILE", value);
      projects.value = value;
    } else {
      console.log("DATA DOES NOT EXIST - CREATE VISLIT DATA");
      await createDir(VISLIT_DATA, {
        dir: BaseDirectory.AppData,
        recursive: true,
      });
      console.log("VISLIT DATA DIRECTORY CREATED AT: ", VISLIT_DATA_PATH);
      await writeFile(await join(VISLIT_DATA, PROJECTS_JSON), "{}", {
        dir: BaseDirectory.AppData,
      });
      console.log("END - PROJECT.JSON CREATED");
      projects.value = {};
    }
  } catch (error) {
    console.error(error);
  }
}

async function addProjects() {
  console.log("ADD PROJECTS");
  // add faker
  // create 10 fake projects
  // pass those 10 into a "api"
  // wrapper function that writes to projects.json
}

async function removeProjects() {
  console.log("REMOVE PROJECTS");
  // get all the project data from state
  // remove the last five objects
  // pass that into the api to save project state
}

// app data dir and app config dir default to the same location
// what i'd need to do:
// have a /vislit-data directory inside data dir
// have a /vislit-data/window-settings.json that would
// contain the last window position and size
// that would be loaded by Rust backend (we don't want to set this
// from inside vue because there'd be a lag)
// when we get a CLOSE signal, you save the window position

// now we can call our Command!
// Right-click the application background and open the developer tools.
// You will see "Hello, World!" printed in the console!
invoke("greet", { name: "Im the vue app talking to backend!" })
  // `invoke` returns a Promise
  .then((response) => console.log(response));

onMounted(async () => {
  await loadData();
});
</script>

<template>
  <!-- TODO UI:
    see how the main content moves with toggle-able columns.
    see how it responds to layout changes in main content
  -->
  <v-layout>
    <v-navigation-drawer permanent class="pt-5"> Side nav </v-navigation-drawer>
    <v-main>
      <div class="my-10 px-10">
        <v-btn @click="addProjects" class="mr-4">Add 10 Projects</v-btn>
        <v-btn @click="removeProjects">Remove the last 5 Projects</v-btn>
        <v-alert class="mt-5 d-flex" color="info">
          <div v-if="projects">
            <strong>Count of projects:</strong>
            {{ Object.keys(projects).length }}
          </div>
          <div><strong>Project data is:</strong> {{ projects }}</div>
        </v-alert>
      </div>

      <v-list class="text-left">
        <h2 class="ml-4">What to test</h2>
        <v-list-item>Writing JSON files with Rust API</v-list-item>
        <v-list-item>Reading JSON from those files with Rust API</v-list-item>
        <v-list-item>
          Performance testing using Faker: create a simple way to generate
          project objects and update them. Then select those projects and
          generate years worth of progress data. 5 years worth of data would be
          be the ideal "good" amount without slow downs. But keep going until
          slow downs start. Log how quickly writing and reading progress takes.
          snippet that should log how big the file size is:
          https://stackoverflow.com/questions/23318037/size-of-json-object-in-kbs-mbs
        </v-list-item>
        <v-list-item>
          Once all that's working, setup basic unit tests for loading data using
          the Tauri api mocks with Vitest
        </v-list-item>
      </v-list>
    </v-main>
  </v-layout>
</template>
