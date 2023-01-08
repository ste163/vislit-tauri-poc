<script setup lang="ts">
import { invoke } from "@tauri-apps/api";
import {
  ItemMetadataPerformance,
  Project,
  Projects,
  Progress,
  KeyedProgress,
  measurePerformance,
  initializeApi,
  getAllProgressWithMetaData,
  createProgress,
  putProject,
  deleteProject,
} from "./api";
import { computed, onMounted, ref, watch } from "vue";
/**
 * For POC:
 * faker is being used as a real dependency instead of a devDep
 * as it will be used in the production build for real testing
 */
import { faker } from "@faker-js/faker/locale/en";

/**
 * NOTE:
 * Attempted to run api in web workers,
 * so that writes to the file system
 * would be on a separate thread. This is not allowed by Tauri
 * due to limitations with web views
 * https://github.com/tauri-apps/tauri/discussions/3922
 *
 * If the UI begins to hang frequently during progress writes,
 * will need to move that logic to the Rust layer
 */

/**
 * TODO
 * - Adding putting 1 day of Progress
 * - Add Removing 1 Progress
 * - Rendering in table for '~ 1 year, 4 months'
 * - Add TipTap and test creating large HTML files (to test read/write/delete performance on full projects)
 * - Super basic unit tests for UI and API and mocking Tauri APIs
 */
const projects = ref<Projects | null>(null);
const selectedProject = ref<Project | null>(null);
const selectedProjectProgress = ref<KeyedProgress | null>(null);
const isOperatingOnProject = ref<boolean>(false);
const isOperatingOnProgress = ref<boolean>(false);

/**
 * Performance dashboard state
 */
const operationLog = ref<ItemMetadataPerformance[]>([]);
const mostRecentProjectOperation = ref<ItemMetadataPerformance | null>(null);
const mostRecentProgressOperation = ref<ItemMetadataPerformance | null>(null);
const initialLoadData = ref<ItemMetadataPerformance | null>(null);
const selectedProgressInitialLoadData = ref<ItemMetadataPerformance | null>(
  null
);

const expansionPanelTitle = computed(() =>
  selectedProject.value
    ? `Selected Project - ${selectedProject.value.title}`
    : "Select Project"
);

async function addProject() {
  try {
    if (!isOperatingOnProject.value) {
      isOperatingOnProject.value = true;
      const id = faker.datatype.uuid();
      const project = {
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
      };
      const response = await measurePerformance(
        async () => await putProject(project)
      );
      projects.value = response.projects || null;
      mostRecentProjectOperation.value = response;
    }
  } catch (error) {
    console.log("addProject error - ", error);
  } finally {
    isOperatingOnProject.value = false;
  }
}

async function removeProject(id: string | undefined) {
  try {
    if (!isOperatingOnProject.value && id) {
      isOperatingOnProject.value = true;
      const response = await measurePerformance(
        async () => await deleteProject(id)
      );
      projects.value = response.projects || null;
      mostRecentProjectOperation.value = response;
      selectedProject.value = null;
    }
  } catch (error) {
    console.log("removeProject error - ", error);
  } finally {
    isOperatingOnProject.value = false;
  }
}

async function addMonthOfProgress(projectId: string | undefined) {
  // NOTE:
  // this task begins to block the main thread
  // and lag the UI when we start to get 2+ years of progress data
  // RECOMMENDED SOLUTION:
  // move long-running tasks into a web-worker
  // ie: the entire api should be a web-worker
  // need to experiment with how it can work
  // as workers use event messages to pass data
  // instead of invoking the functions like I'm currently doing
  try {
    if (projectId && !isOperatingOnProgress.value) {
      isOperatingOnProgress.value = true;
      let monthOfProgress: KeyedProgress = {};
      for await (let _count of Array(30).keys()) {
        const date = faker.date.past();
        const progress: Progress = {
          date,
          projectId: selectedProject.value?.id || faker.datatype.uuid(),
          goalId: faker.datatype.uuid(),
          count: faker.datatype.number(),
          edited: faker.datatype.boolean(),
          proofread: faker.datatype.boolean(),
          revised: faker.datatype.boolean(),
          completed: faker.datatype.boolean(),
        };
        monthOfProgress = {
          ...monthOfProgress,
          [date.toISOString()]: progress,
        };
      }
      const response = await measurePerformance(
        async () =>
          await createProgress({ projectId, progress: monthOfProgress })
      );
      mostRecentProgressOperation.value = response;
      selectedProjectProgress.value = response.progress || null;
    }
  } catch (error) {
    console.log("addMonthOfProgress - ", error);
  } finally {
    isOperatingOnProgress.value = false;
  }
}

// TODO:
// add 1 progress
// remove 1 progress

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
  const result = await measurePerformance(initializeApi);
  initialLoadData.value = result;
  mostRecentProjectOperation.value = result;
  projects.value = result.projects || null;
  if (result.projects)
    // select first project on load if one exists
    selectedProject.value = Object.values(result.projects)[0];
});

watch(mostRecentProjectOperation, (mostRecentProjectOperation) => {
  if (mostRecentProjectOperation)
    operationLog.value = [...operationLog.value, mostRecentProjectOperation];
});

watch(mostRecentProgressOperation, (mostRecentProgressOperation) => {
  if (mostRecentProgressOperation)
    operationLog.value = [...operationLog.value, mostRecentProgressOperation];
});

watch(selectedProject, async (projectState) => {
  if (projects.value && !projectState)
    // if no project is selected, then select first
    // (used to select first project if you delete a project)
    selectedProject.value = Object.values(projects.value)[0];

  /**
   * User selects a new project,
   * fetch progress for that project id
   */
  if (projectState) {
    const response = await measurePerformance(
      async () => await getAllProgressWithMetaData(projectState.id)
    );
    selectedProjectProgress.value = response.progress || null;
    selectedProgressInitialLoadData.value = response;
    mostRecentProgressOperation.value = response;
  }
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
    <v-main>
      <div class="my-10 px-10">
        <v-alert>
          <h4 class="mb-2">Test Operations</h4>
          <p>
            <strong>Goal:</strong> five years of progress data with "acceptable"
            speeds on low-high end machines
          </p>
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
              @click="() => removeProject(selectedProject?.id)"
              class="mx-2 my-2"
              :loading="isOperatingOnProject"
              :disabled="selectedProject ? false : true"
            >
              Delete Project
            </v-btn>

            <v-btn
              @click="() => addMonthOfProgress(selectedProject?.id)"
              class="mx-2 my-2"
              :loading="isOperatingOnProgress"
              :disabled="selectedProject ? false : true"
            >
              Add month of Progress
            </v-btn>
          </div>
        </v-alert>
        <v-alert class="mt-5 d-flex" compact color="info">
          <div v-if="projects" class="d-flex flex-column">
            <div class="d-flex flex-column mb-4">
              <h4 class="mb-2">Project Operations</h4>
              <div class="d-flex">
                <div>
                  <h5>Initial project load time</h5>
                  {{ initialLoadData?.timeToComplete || 0 }}
                  seconds
                </div>
                <v-divider vertical class="mx-4" />
                <div>
                  <h5>Last operation</h5>
                  {{ mostRecentProjectOperation?.action }}
                </div>
                <v-divider vertical class="mx-4" />
                <div>
                  <h5>Time to complete last operation</h5>
                  {{ mostRecentProjectOperation?.timeToComplete }} seconds
                </div>
                <v-divider vertical class="mx-4" />
                <div>
                  <h5>Total Project count</h5>
                  {{ Object.keys(projects).length }}
                </div>
                <v-divider vertical class="mx-4" />
                <div>
                  <h5>projects.json file size</h5>
                  ~ {{ mostRecentProjectOperation?.projectsJsonSize || 0 }} mb
                </div>
              </div>
            </div>

            <v-divider class="my-4"></v-divider>

            <h4 class="mb-2">Progress Operations</h4>
            <sub class="mb-4">(on the selected project)</sub>
            <div class="d-flex">
              <div>
                <h5>Initial progress load time</h5>
                {{ selectedProgressInitialLoadData?.timeToComplete || 0 }}
                seconds
              </div>
              <v-divider vertical class="mx-4" />
              <div>
                <h5>Last operation</h5>
                {{ mostRecentProgressOperation?.action }}
              </div>
              <v-divider vertical class="mx-4" />
              <div>
                <h5>Time to complete last operation</h5>
                {{ mostRecentProgressOperation?.timeToComplete }} seconds
              </div>
              <v-divider vertical class="mx-4" />
              <div>
                <h5>Total progress count</h5>
                {{ Object.keys(selectedProjectProgress || {}).length }}
              </div>
              <v-divider vertical class="mx-4" />
              <div>
                <h5>Years of progress</h5>
                {{ mostRecentProgressOperation?.yearsWorthOfProgress || "N/A" }}
              </div>
              <v-divider vertical class="mx-4" />
              <div>
                <h5>progress.json file size</h5>
                ~ {{ mostRecentProgressOperation?.progressJsonSize || 0 }} mb
              </div>
            </div>

            <v-divider class="my-4"></v-divider>

            <h4 class="mb-2">Performance per operation</h4>
            <v-table density="compact" fixed-header>
              <thead>
                <tr>
                  <th class="text-left">Operation</th>
                  <th class="text-left">Count of Items Affected</th>
                  <th class="text-left">Total Items</th>
                  <th class="text-left">Time to Complete</th>
                  <th class="text-left">projects.json size</th>
                  <th class="text-left">progress.json size</th>
                  <th class="text-left">~ Years of Progress</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(operation, index) in operationLog" :key="index">
                  <td>{{ operation.action }}</td>
                  <td>{{ operation.itemsAffectedByAction }}</td>
                  <td>{{ operation.totalItems }}</td>
                  <td>{{ operation.timeToComplete }}</td>
                  <td>~ {{ operation.projectsJsonSize }} mb</td>
                  <td>~ {{ operation.progressJsonSize }} mb</td>
                  <td>{{ operation.yearsWorthOfProgress || "N/A" }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-alert>
      </div>
    </v-main>
  </v-layout>
</template>
