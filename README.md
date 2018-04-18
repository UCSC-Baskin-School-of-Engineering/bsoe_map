# Baskin School of Engineering Map
An interactive web app for navigating the BSOE floorplans
- Type into the search bar and submit to search for a room
- Use the floors and quick nav buttons to navigate
- Zoom and pan on the interactive map

## Setup:
- Install `node v8.x.x`
- Make sure you are using bash, and that `npm` is configured to use bash
- `$ npm install`
- Create a file `.buildingrc` that exports the environment variable `BUILDING`, which should match one of the folders in `./buildings/`. For example:
```bash
export BUILDING=BSOE
```
- Add/change the configuration file `config.js` in `./buildings/<BUILDING>` to edit the building's webpage (use can reference `./buildings/BSOE` as an example)

## Live Development
- `$ npm run dev`
- Open browser to `localhost:8080`
- Updating any code or static files will update `localhost:8080` (may need to refresh page)

## Build for Production
- `$ npm run build`

## Update Map Svgs
- Add any amount of map dxf files to `./buildings/<BUILDING>`
- `$ npm run convert` to convert the files to svgs and extract their room data

See the comments in `./map_extract/convert.js` to learn how to modify svg layers, colors, etc.

## Other Notes
- I used `eslint` as a barebones style-guide for the javascript. `$ npm run lint` will manually lint `./src`, or you can download an `eslint` editor plugin.