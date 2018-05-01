# Floor Maps
An interactive web app for navigating floorplans
- Type into the search bar and submit to search for a room
- Use the floors and quick nav buttons to navigate
- Zoom and pan on the interactive map

## Setup:
1. Install `node 8+`
2. Make sure you are using bash, and that `npm` is configured to use bash
3. `$ npm install`
4. Create a file `.buildingrc` that exports the environment variable `BUILDING`, which should match one of the folders in `./buildings/`. For example:
```bash
export BUILDING=BSOE
```
5. Add/change the configuration file `config.json` in `./buildings/<BUILDING>` to edit the building's webpage (please reference any of the other `config.json` files as examples)

## Live Development
1. `$ npm run dev`
2. Open browser to `localhost:8080`
3. Update any code or static files to update `localhost:8080` (may need to refresh page)

## Build for Production
`$ npm run build`

## Update Map Svgs
1. Add any amount of map dxf files to `./buildings/<BUILDING>`
2. `$ npm run convert` to convert the files to svgs and extract their room data

See the comments in `./map_extract/convert.js` to learn how to modify svg layers, colors, etc.
