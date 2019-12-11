# Maintainers Documentation

## Release checklist

* Please make sure CHANGELOG reflects the new version to be released
  (Usually, that's changing the `In Development` items to be reflected under
   new version and leaving `In Development` empty)
* Set the new version to be released in plugin.json and package.json
* Please push a tag using git commands

    ```bash
    git tag -a 0.1.0 -m "0.1.0 - Shiny new features and bug fixes"
    git push upstream 0.1.0
    ```

* Circle CI builds the tag and ships to github releases
* Please ensure the released tar.gz contains the `dist` folder
