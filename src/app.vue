<script setup lang="ts">
import { invoke } from "@tauri-apps/api";
import {
  PerformanceTestItem,
  Project,
  Projects,
  measurePerformance,
  loadProjectData,
  putProject,
} from "./api";
import { onMounted, ref } from "vue";
/**
 * For POC:
 * faker is being used as a real dependency instead of a devDep
 * as it will be used in the production build for real testing
 */
import { faker } from "@faker-js/faker/locale/en";

const projects = ref<Projects>(null);
const isAddingProject = ref<boolean>(false);
const selectedProject = ref<Project | null>(null);

/**
 * State related to performance dashboard
 */
const mostRecentActionData = ref<PerformanceTestItem | null>(null);
const initialLoadData = ref<PerformanceTestItem | null>(null);

// TODO:
// need a computed property that runs whenever we do an operation
// and then spits out the fully combined table data

async function addProjects() {
  try {
    if (!isAddingProject.value) {
      isAddingProject.value = true;
      let fakeProjects: Record<string, Project> = {};
      // create fake projects per button click
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
      projects.value = await putProject({
        projectsToPut: fakeProjects,
        previousProjectState: projects.value,
      });
    }
  } catch (error) {
    console.log("addProject error - ", error);
  } finally {
    isAddingProject.value = false;
  }
}

function selectProject(id: string) {
  if (projects.value) selectedProject.value = projects.value[id];
  console.log("selected project is", selectedProject.value);
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

onMounted(async () => {
  const result = await measurePerformance(loadProjectData);
  initialLoadData.value = result;
  projects.value = result.projects || null;
  if (result.projects)
    // select first project on load if one exists
    selectedProject.value = Object.values(result.projects)[0];
});

/**
 * Test invoking custom Rust functions not included in the JS api.
 * This allows me to write anything I want and pass JS data to backend.
 */
invoke("greet", { name: "Im the vue app talking to backend!" })
  // `invoke` returns a Promise
  .then((response) => console.log(response));
</script>

<template>
  <!-- TODO UI:
    see how the main content moves with toggle-able columns.
    see how it responds to layout changes in main content
  -->
  <v-layout>
    <!-- TODO have this collapsable for easier table viewing -->
    <v-navigation-drawer class="py-5">
      <h3>Projects</h3>
      <sub>(select to set as active)</sub>
      <div class="d-flex flex-column px-5">
        <!-- <v-btn
          v-for="project in projects"
          class="text-truncate my-2"
          :color="project.id === selectedProject?.id ? 'primary' : ''"
          @click="() => selectProject(project.id)"
        >
          {{ project.title }}
        </v-btn> -->
      </div>
    </v-navigation-drawer>
    <v-main>
      <div class="my-10 px-10">
        <!-- 
        Issue looks to be that you can click multiple times
        before the isLoading triggers. Maybe need a count of how many times it's been called
        and only do once? But that state might not be fast enough
        -->
        <v-btn
          @click="isAddingProject ? null : addProjects()"
          class="mr-4"
          :loading="isAddingProject"
        >
          Add 10 Project
        </v-btn>
        <v-alert class="mt-5 d-flex" color="info">
          <div v-if="projects" class="d-flex flex-column">
            <div class="d-flex flex-column mb-4">
              <h4>Summary of Actively Loaded Data</h4>
              <div class="text-caption">
                (Adding and removing projects or progress data will update this
                section)
              </div>

              <div class="mt-2">
                <h5>Project count:</h5>
                {{ Object.keys(projects).length }}
              </div>

              <!-- TODO: have state for the previous operation to render here -->
              <!-- along with keeping some of the initial load data for quick comparison -->
              <div class="mt-2">
                <h5>projects.json file size:</h5>
                ~ {{ initialLoadData?.fileSize }} mb
              </div>

              <div class="mt-2">
                <h5>Last operation:</h5>
                {{ initialLoadData?.action }}
              </div>

              <div class="mt-2">
                <h5>Time to complete last operation:</h5>
                {{ initialLoadData?.timeToComplete }} seconds
              </div>
            </div>

            <h4>Performance tests per action</h4>
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">Action</th>
                  <th class="text-left">Count of Items Affected</th>
                  <th class="text-left">Total Items</th>
                  <th class="text-left">
                    Time to Complete Action (in Seconds)
                  </th>
                  <th class="text-left">Approximate File Size in MB</th>
                  <th class="text-left">
                    Approximate Years worth of progress data
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr></tr>
              </tbody>
            </v-table>
          </div>
        </v-alert>
      </div>

      <v-list class="text-left">
        <h2 class="ml-4">Performance Testing</h2>
        <v-list-item>
          Performance testing: about 5 years worth of progress data per project
          would be a "safe" amount for using a JSON structure. Also see what the
          "cap" is. Test on a low-end machine for best accuracy.
        </v-list-item>
        <v-list-item>
          Once all that's working, setup basic unit tests for loading data using
          the Tauri api mocks with Vitest
        </v-list-item>
      </v-list>
    </v-main>
  </v-layout>
</template>
