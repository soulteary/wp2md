![wp2md](./logo.png)

# wp2md

Convert WordPress Posts to markdown files.

Split post meta into json and content into markdown.

## example

```
./wp2md --export=/path_to_your_export_data/wp2ghost_export.json --timezone=on
```

## export result

![export result](./wp2md-export.png)

## FAQ

- Q: **How to use?**
- A: After `npm install`, you can use `./wp2md your_export_json_file_path` to convert your WordPress data..

- Q: **How to get my export json file?**
- A: Use Ghost export plugin, i support use the plugin which i upload. [PLUGIN](./wordpress-export-plugin.zip)/[HOW](./export-data.png)

- Q: **Why not suggest me use offcial ghost export plugin?**
- A: It remove lots of post content when exporting.

- Q: **Where should i find my export posts?**
- A: `./export` [HERE](./export)


- Q: **Why not put ```to-markdown.js``` to ```package.json```?**
- A: L52@`lib/gfm-converters.js` has a problem with tr elements, i'll send a pr later.

- Q: **Why my export post's date is not correct? **
- A: check your WordPress export data timestamp timezone setting, if you doesn't want to use timezone fix, use `./wp2md your_export_json_file_path timezone=off`.

