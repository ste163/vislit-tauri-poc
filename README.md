# Vislit Tauri Experiment/Proof of Concept

Research on how Tauri performs as opposed to Electron. The Electron version needs its database structure refactored. But if I can do essentially the same work in Tauri, the performance and security improvements would be worth it.

Why do I want to do this? Electron uses more resources, has large bundle sizes, and a complex build process. I'm also tightly coupled to some projects like lowdb. It would be better to use a handful of "core" dependencies that are not from solo-devs.

## TODO Performance Testing

- Attempt to write `.json` files for each "project", "notes", etc. in a `"projectId": { project }` format. That way making edits and re-saving the entire .json would be as easy as:

```
await saveProjects({...projects, newProject})
```

### Ideal state

- Able to have dozens of projects with 5+ years worth of writing `progress.json` data mocked without noticeable slow-downs. There will be the `n+1` problem as editing a `json` file rewrites the entire file instead of appending data. `progress` is the one file that would contain the most data, so it's most important to test.

### To test

- Using `faker`, allow for quickly creating and deleting a few dozen projects (with their directories and files)
- Have a way to select an active project and render that to the page
- Have buttons for adding 6-months or so of `progress` data per button click and a way to delete 30 or so records at a time
- Render roughly "how many years" worth of data is in the file.
- Have logging for the time difference for each operation (`get`, `add`, `delete`)

## Potential data structure

Instead of having a SQL database and server running, using `.json` files for faster development and iteration. It's also easy to backup and export and doesn't require any extra dependencies.

By having separate `goals`, `progress`, and `notes` `.json` files, there "shouldn't" be any size issues. Ie, if one project's `progress.json` is 100mb and contains 5 years worth of progress data, that's fine because we only ever load that data once that project is selected. So any potential speed issues due to `n+1` would only occur for that one project. (Hopefully no slow-down occurs with that much data though.)

```
/vislit-data
            /version.json (contains "{ vislit-data-version: 1.0.0 }"
                           so that I could write migration steps
                           based on version number)
            /projects.json
            /types.json
            /window-settings.json
            /projects/{id}
                          question: should these contain '{id}-'?
                          /goals.json
                          /progress.json
                          /notes.json
                          /documents/{id}-{date}.html
                          /notes/{id}-{date}.html
```

### Potential use-case for web workers and minisearch

Will potentially need to index a lot of data that must be created and stored in-memory. Minisearch uses a simple example with 5k top songs from the last 50 years. It runs very quickly. I could potentially setup the search index with a `web worker` that loads all `json` files and `notes` and indexes those. The search bar could be in a `loading` state until the web worker finishes processing. This would not block the main thread. However, this would be an optimization only after things get slow. Which would require testing.

The reason for web workers is because `search` is not something that the should block the user from using the app

## Running the project

Start dev environment (frontend first then backend):

```
pnpm start
```

## Updating project dependencies (non-UI)

Tauri tooling:
https://tauri.app/v1/guides/development/updating-dependencies

Update rust with

```
rust update
```
