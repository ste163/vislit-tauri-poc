<script setup lang="ts">
import { invoke } from "@tauri-apps/api";
import { appConfigDir, appDataDir } from "@tauri-apps/api/path";

// example of saving to the file system
// https://www.matthewtao.com/blog/post/glipma-devlog-2/

async function logAppConfigDir() {
  const dir = await appConfigDir();
  console.log("APP CONFIG DIR", dir);
}

async function logAppDataDir() {
  const dir = await appDataDir();
  console.log("APP DATA DIR", dir);
}

// now we can call our Command!
// Right-click the application background and open the developer tools.
// You will see "Hello, World!" printed in the console!
invoke("greet", { name: "Im the vue app talking to backend!" })
  // `invoke` returns a Promise
  .then((response) => console.log(response));
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

      <div class="mb-10">
        <h2>Logging buttons</h2>
        <button @click="logAppConfigDir">Log app config dir</button>
        <button @click="logAppDataDir">Log app data dir</button>
      </div>

      <ol class="text-left">
        <li>Writing JSON files with Rust API</li>
        <li>Reading JSON from those files with Rust API</li>
        <li>
          Using Faker (or a similar project), create a simple way to generate
          project objects and update them. Like two or three dozen or so at a
          time so I can test how quickly tauri handles reading larger json
          files. Like 100mb would be ideal, potentially. Would want to display a
          count of the data + parts of the data. Along with some logging on
          speeds. Then test with a production version of tauri
        </li>
        <li>How does the frontend look across OSes?</li>
      </ol>
    </v-main>
  </v-layout>
</template>
