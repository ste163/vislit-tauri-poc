<script setup lang="ts">
import { invoke } from "@tauri-apps/api";
import {
  ItemMetadataPerformance,
  Project,
  Projects,
  measurePerformance,
  loadProjectData,
  putProject,
} from "./api";
import { computed, onMounted, ref } from "vue";
/**
 * For POC:
 * faker is being used as a real dependency instead of a devDep
 * as it will be used in the production build for real testing
 */
import { faker } from "@faker-js/faker/locale/en";

// TODO:
// setup basic unit tests to see how easy it is to work
// with mocking tauri APIs

const projects = ref<Projects>(null);
const isOperatingOnProject = ref<boolean>(false);
const isAddingProgress = ref<boolean>(false);
const selectedProject = ref<Project | null>(null);

/**
 * Performance dashboard state
 */
const mostRecentActionData = ref<ItemMetadataPerformance | null>(null);
const initialLoadData = ref<ItemMetadataPerformance | null>(null);

const expansionPanelTitle = computed(() =>
  selectedProject.value
    ? `Selected Project - ${selectedProject.value.title}`
    : "Select Project"
);

// TODO - table view:
// need a computed property that runs whenever we do an operation
// and then spits out the fully combined table data

// TODO - more operations!: need a delete single project to test removing large amounts of data and directories

async function addProject() {
  try {
    if (!isOperatingOnProject.value) {
      isOperatingOnProject.value = true;
      const id = faker.datatype.uuid();
      const project = {
        [id]: {
          id,
          title: faker.lorem.sentence(2),
          description: faker.lorem.sentences(3),
          typeId: faker.datatype.uuid(),
          type: "testType",
          goal: "testGoal",
          completed: false,
          archived: false,
          dateCreated: faker.date.past(),
          dateModified: faker.date.past(),
        },
      };
      const response = await measurePerformance(
        async () =>
          await putProject({
            projectsToPut: project,
            previousProjectState: projects.value,
          })
      );
      projects.value = response.projects || null;
      mostRecentActionData.value = response;
    }
  } catch (error) {
    console.log("addProject error - ", error);
  } finally {
    isOperatingOnProject.value = false;
  }
}

// pass in id
async function deleteProject() {
  console.log("DELETE PROJECT");
}

// pass in id
async function addProgress() {
  console.log("ADD PROGRESS");
}

function selectProject(id: string) {
  if (projects.value) selectedProject.value = projects.value[id];
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
  mostRecentActionData.value = result;
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
  <v-layout>
    <!-- TODO: only allow for a max of 20 projects -->
    <!-- Then show a list of all projects underneath. Maybe collapsible -->
    <!-- Selecting an active project unlocks the add 30 progress buttons -->

    <v-main>
      <div class="my-10 px-10">
        <v-alert>
          <h4 class="mb-2">Test Operations</h4>
          <p>
            <strong>Goal:</strong> five years of progress data with "acceptable"
            speeds on low-high end machines
          </p>
          <!-- 
          NOTE
          Known issue: can click or press enter multiple times
          and multiple put requests go through.
          -->
          <div class="d-flex mt-2">
            <v-btn
              @click="addProject"
              class="mx-2 my-2"
              :loading="isOperatingOnProject"
            >
              Add a Project
            </v-btn>
          </div>

          <div class="mx-2 my-2">
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title>{{
                  expansionPanelTitle
                }}</v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="d-flex flex-column">
                    <v-btn
                      v-for="project in projects"
                      class="text-truncate my-2"
                      :color="
                        project.id === selectedProject?.id ? 'primary' : ''
                      "
                      @click="() => selectProject(project.id)"
                    >
                      {{ project.title }}
                    </v-btn>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>

          <div class="d-flex">
            <v-btn
              @click="deleteProject"
              class="mx-2 my-2"
              :loading="isOperatingOnProject"
              :disabled="selectedProject ? false : true"
            >
              Delete Project
            </v-btn>

            <v-btn
              @click="addProgress"
              class="mx-2 my-2"
              :loading="isAddingProgress"
              :disabled="selectedProject ? false : true"
            >
              Add month of Progress
            </v-btn>
          </div>
        </v-alert>
        <v-alert class="mt-5 d-flex" compact color="info">
          <div v-if="projects" class="d-flex flex-column">
            <div class="d-flex flex-column mb-4">
              <h4>Performance Data</h4>
              <div class="text-caption">
                (Adding and removing projects or progress updates dashboard)
              </div>

              <div class="my-2">
                <h5>Project count:</h5>
                {{ Object.keys(projects).length }}
              </div>

              <v-divider class="my-4"></v-divider>

              <h4 class="mt-2">Initial load</h4>

              <div class="d-flex">
                <div>
                  <h5>projects.json file size:</h5>
                  ~ {{ initialLoadData?.fileSize }} mb
                </div>

                <div class="mb-2 mx-4">
                  <h5>Time:</h5>
                  {{ initialLoadData?.timeToComplete }} seconds
                </div>
              </div>

              <v-divider class="my-4"></v-divider>

              <h4 class="mt-2">Last operation</h4>

              <div class="d-flex">
                <div>
                  <h5>projects.json file size:</h5>
                  ~ {{ mostRecentActionData?.fileSize }} mb
                </div>

                <div class="mx-4">
                  <h5>Last operation:</h5>
                  {{ mostRecentActionData?.action }}
                </div>

                <div>
                  <h5>Time to complete last operation:</h5>
                  {{ mostRecentActionData?.timeToComplete }} seconds
                </div>
              </div>
            </div>

            <v-divider class="my-4"></v-divider>

            <h4>Performance tests per action</h4>
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">Action</th>
                  <th class="text-left">Count of Items Affected</th>
                  <th class="text-left">Total Items</th>
                  <th class="text-left">Time to Complete</th>
                  <th class="text-left">~ JSON Size in MB</th>
                  <th class="text-left">~ Years of Progress</th>
                </tr>
              </thead>
              <tbody>
                <tr></tr>
              </tbody>
            </v-table>
          </div>
        </v-alert>
      </div>
    </v-main>
  </v-layout>
</template>
