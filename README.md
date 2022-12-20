# Vislit Tauri Experiment

To see how Tauri performs as opposed to Electron. The Electron version needs its database structure refactored. But if I can do essentially the same work in Tauri, the performance and security improvements would be awesome.

# Todo

1. Can I write `.json` files with data then read those from the frontend?
2. If yes, how easy is it to write tests for this?
3. If these are good, how does localStorage work?
4. How does the frontend look across Linux, Mac, and Windows?

Why do I want to do this? Electron uses more resources, has large bundle sizes, and a complex build process. I'm also tightly coupled to some projects like lowdb. It would be better to use a handful of "core" dependencies that are not from solo-devs.

- Attempt to write `.json` files for each "project", "notes", etc. in a `"id": {project}` format. That way making edits and re-saving the entire .json would be as easy as:

```
await saveProjects({...projects, newProject})
```

- if I could find a way to do some performance testing on how quick rust's fs is, that would be great. "progress" will have the most data most likely, so if I could create a way to test with thousands of json data and see if it's noticeably slow (on reading and writing and displaying that dataset), that'd be great. Also what the memory consumption would be? If it takes "years" worth of data to have noticeable slow downs, that's fine. And then there's always moving data manipulation from the JS code to Rust. Which that would be an optimization years down the line if it takes thousands of data to "start" getting slow

## Pros and Cons

### Tauri

- more secure by default
- good DX and export pipelines by default
- smaller footprint
- would require re-writing backend
- would be more parsing on the client, but this also makes it easier to test, as mocking tauri apis is supported by default. Mocking + testing Electron is not simple

### Staying with Electron

- Chromium UI is shared by all OS's
- vue dev tools
- tightly reliant on many open-source projects like `lowdb` and an electron `template`. Electron requires a bit of setup to get a good dev workflow
- more resource overhead

## Running the project

Start dev environment:

```
pnpm tauri dev
```

## Updating project dependencies (non-UI)

Tauri tooling:
https://tauri.app/v1/guides/development/updating-dependencies

Update rust with

```
rust update
```
