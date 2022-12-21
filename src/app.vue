<script setup lang="ts">
import { invoke } from "@tauri-apps/api";
import { Project, Projects, loadProjectData, putProject } from "./api";
import { onMounted, ref } from "vue";
/**
 * For POC:
 * faker is being used as a real dependency instead of a devDep
 * as it will be used in the production build for real testing
 */
import { faker } from "@faker-js/faker/locale/en";

const projects = ref<Projects>(null);

async function addProjects() {
  let fakeProjects: Record<string, Project> = {};
  // create 10 fake projects per button click
  for (let index = 0; index < 10; index++) {
    const id = faker.datatype.uuid();
    fakeProjects = {
      ...fakeProjects,
      [id]: {
        id,
        title: faker.lorem.sentence(),
        description: faker.lorem.sentences(),
        typeId: faker.datatype.uuid(),
        type: "testType",
        goal: "testGoal",
        completed: false,
        archived: false,
        dateCreated: faker.date.past(),
        dateModified: faker.date.past(),
      },
    };
  }
  const response = await putProject({
    projectsToPut: fakeProjects,
    previousProjectState: projects.value,
  });
  projects.value = response;
}

/**
 * Not in POC: (Saving Window state)
 * will need to store window-setting.json data
 * and load that in the Rust backend so I can restore
 * the user's last window size and location on screen.
 * This would need to be saved on the window close event
 * from the backend. But could attempt to set this
 * when the Vue app loads, if it's quick enough
 */

/**
 * Test invoking custom Rust functions not included in the JS api.
 * This allows me to write anything I want and pass JS data to backend.
 */
invoke("greet", { name: "Im the vue app talking to backend!" })
  // `invoke` returns a Promise
  .then((response) => console.log(response));

onMounted(async () => {
  projects.value = await loadProjectData();
});
</script>

<template>
  <!-- TODO UI:
    see how the main content moves with toggle-able columns.
    see how it responds to layout changes in main content
  -->
  <v-layout>
    <v-navigation-drawer permanent class="py-5">
      <h3>Projects</h3>
      <sub>(select to set as active)</sub>
      <div class="d-flex flex-column px-5">
        <v-btn v-for="project in projects" class="text-truncate my-2">
          <!-- Set a specific width with ellipsis overflow -->
          {{ project.title }}
        </v-btn>
      </div>
    </v-navigation-drawer>
    <v-main>
      <!-- TODO
      make this a dashboard
      with information on how many projects
      the json size
      time it takes to startup
      last time it took to do an operation.

      Would be best to have a log of per click:
      50 projects, takes 0.5seconds
      ...
      8000 projects takes 3seconds

      The current slowdown with 1300 projects
      might not be from Tauri but Vue re-rendering
      that many items... Will know when I get an actual table display
    -->
      <div class="my-10 px-10">
        <!-- TODO: loading state for adding a project so I cant add more than 1 at a time -->
        <v-btn @click="addProjects" class="mr-4">Add 10 Projects</v-btn>
        <v-alert class="mt-5 d-flex" color="info">
          <div v-if="projects" class="d-flex flex-column">
            <div>
              <strong>Count of projects:</strong>
              {{ Object.keys(projects).length }}
            </div>

            <div>Make a table with:</div>
            <div>- Action (Add Project)</div>
            <div>- How many were added (10)</div>
            <div>- New Total (30)</div>
            <div>- Time to complete action</div>
          </div>
        </v-alert>
      </div>

      <v-list class="text-left">
        <h2 class="ml-4">Performance Testing</h2>
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
