<script setup lang="ts">
import { invoke } from "@tauri-apps/api";
import {
  exists,
  createDir,
  writeFile,
  BaseDirectory,
} from "@tauri-apps/api/fs";
import { onMounted, ref } from "vue";

// TODO:
// add the Project type of Record<string, Project>
const projects = ref<any>(null); // no project type yet

// example of saving to the file system
// https://www.matthewtao.com/blog/post/glipma-devlog-2/

async function loadData() {
  // currently tauri
  // does not allow writing
  // to arbitrary directories inside appDir
  // like appDir/vislit-data
  // so using the appDir/ with writing .json in there
  // but MUST figure out how, or else it won't work.
  // need the /projects/id/{date}.html
  console.log("load data");
  try {
    const doesVislitDataExist = await exists("projects.json", {
      dir: BaseDirectory.AppData,
    });
    if (doesVislitDataExist) {
      console.log("vislit data exists!");
      // read appDataDir, projects.json
      // set that data to state
    } else {
      console.log("vislit data does NOT exist");
      await writeFile("projects.json", "{}", {
        dir: BaseDirectory.AppData,
      });
      // createDir vislit-data
      // then create file projects.json inside of that
      // then set projects to an empty {}
      // as we know we will have no data in there
    }

    // const appDataDirPath = await appDataDir();
    // const path = await join(appDataDirPath, 'users', 'tauri', 'avatar.png');
  } catch (error) {
    console.error(error);
  }
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
  <!-- TODO
    see how the main content moves with toggle-able columns.
    see how it responds to layout changes in main content
  -->
  <v-layout>
    <v-app-bar class="pl-5">VISLIT TAURI EXPIREMENT</v-app-bar>
    <v-navigation-drawer permanent class="pt-5"> Side nav </v-navigation-drawer>
    <v-main
      ><h1>What to test</h1>

      <div class="mb-10 px-10">
        <v-alert color="info">
          Project data is:
          <strong>{{ projects }}</strong>
        </v-alert>
      </div>

      <v-list class="text-left">
        <v-list-item>Writing JSON files with Rust API</v-list-item>
        <v-list-item>Reading JSON from those files with Rust API</v-list-item>
        <v-list-item>
          Using Faker (or a similar project), create a simple way to generate
          project objects and update them. Like two or three dozen or so at a
          time so I can test how quickly tauri handles reading larger json
          files. Like 100mb would be ideal, potentially. Would want to display a
          count of the data + parts of the data. Along with some logging on
          speeds. Then test with a production version of tauri
        </v-list-item>
        <v-list-item>How does the frontend look across OSes?</v-list-item>
      </v-list>
    </v-main>
  </v-layout>
</template>
