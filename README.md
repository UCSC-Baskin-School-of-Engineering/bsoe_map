# Baskin School of Engineering Map
An interactive web app for navigating the BSOE floorplans
- Type into the search bar and submit to search for a room
- Use the floors and quick nav buttons to navigate
- Zoom and pan on the interactive map


## Setup:
- Install ```node v8.x.x```
- ```$ npm install```
## Webpage Development
- ```$ npm run dev```
- Open browser to ```localhost:8080```
- Updating any code in ```./src``` will update localhost (may need to refresh page)

Edit ```./src/quicknav.json``` to add/remove/modify quick navigation buttons
## Build
- ```$ npm run build```
## Update Map Svgs
- Add any amount of map dxf files to ```./map_extract```
- ```$ npm run convert``` to convert the files to svgs and extract their room data

See the comments in ```./map_extract/convert.js``` to learn how to modify layers, colors, etc.

## Other Notes
- I used ```eslint``` as a barebones style-guide for the javascript. ```$ npm run lint``` will manually lint ```./src```, or you can download an ```eslint``` editor plugin.