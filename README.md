# wp2md

Convert WordPress Posts to markdown files.

## FAQ

- Q: How to use?
- A: After `npm install`, you can use `./wp2md your_export_json_file_path` to convert your WordPress data..

- Q: How to get my export json file?
- A: Use Ghost export plugin, i support use the plugin which i upload.

- Q: Why not suggest me use offcial ghost export plugin?
- A: It remove lots of post content when exporting.

- Q: Where should i find my export posts?
- A: `./export`


- Q: Why not put ```to-markdown.js``` to ```package.json```?
- A: L52@`lib/gfm-converters.js` has a problem with tr elements, i'll send a pr later.