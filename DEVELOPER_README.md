# Building

1. Clone the [plugin repository](https://github.com/scalyr/scalyr-grafana-datasource-plugin) from GitHub.

    ```bash
    git  clone https://github.com/scalyr/scalyr-grafana-datasource-plugin.git
    ```

2. Build the Golang backend (with the version defined in go.mod, currently 1.16) using Mage.

    ```bash
    mage
    ```

    This will build the executables in `dist/`.

    To install Mage (Golang make-like build tool):

    ```bash
    git clone https://github.com/magefile/mage $GOPATH/src/github.com/magefile/mage
    cd $GOPATH/src/github.com/magefile/mage
    git checkout tags/v1.12.1 # Specified in go.mod
    go run bootstrap.go
    ```

    A `mage` executable should now be in `$GOPATH/bin/`.

3. Build the Typescript frontend using LTS Node (>= v14) and Yarn.

    ```bash
    yarn install --pure-lockfile # Install dependencies into node_modules
    yarn build
    ```

    This will build and the frontend files in `dist/`.

    To install Yarn: `npm install --global yarn`.


5. For development versions, simply copy the files to the Grafana server plugin directory.

    ```bash
    mkdir /var/lib/grafana/plugins/dataset
    # copy files from dist/ into /var/lib/grafana/plugins/dataset
    ```

    Note that this is an unsigned plugin, and you must update your `grafana.ini` file to allow it adding the following line:

   ```bash
   allow_loading_unsigned_plugins = sentinelone-dataset-datasource
   ```

6. Adding plugins requires a restart of your grafana server.

    For init.d based services you can use the command:

    ```bash
    sudo service grafana-server restart
    ```

    For systemd based services you can use the following:

    ```bash
    systemctl restart grafana-server
    ```

# Signing and Packaging

To sign and package the plugin for distribution:

```bash
export GRAFANA_API_KEY=<YOUR_API_KEY>
npx @grafana/toolkit plugin:sign # This creates dist/MANIFEST.txt

cp -r dist sentinelone-dataset-datasource
zip -r sentinelone-dataset-datasource-$(jq -r .info.version sentinelone-dataset-datasource/plugin.json).zip sentinelone-dataset-datasource
rm -rf sentinelone-dataset-datasource # Cleanup
```

References
- https://grafana.com/docs/grafana/latest/developers/plugins/package-a-plugin/
- https://grafana.com/docs/grafana/latest/developers/plugins/sign-a-plugin/

Note that updates must be submitted to Grafana support for review, if approved the updated plugin will be hosted by the Grafana API and be accessible via `grafana-cli`.

