# Developer Documentation

## Contributing

We welcome and appreciate contributions of any kind (code, tests, documentation, ...).

* Please assign issues to your github profile
  * If there are no open issues related to your issues, please create one
    and use appropriate labels to indicate the kind of issue.
* Please fork this repo and create a branch to make your changes
* Please include the issues you are fixing in the commits
* Please add an entry in [CHANGELOG.md](./CHANGELOG.md) in `In Development`
  section along with github issue number and author information. For example:
  `Power queries now support blah (#1234) (Alice Wonderland)`

## Plugin development

1. Install dependencies

    ```bash
    yarn install
    ```

2. Make code changes

3. Run lint and tests

    ```bash
    yarn lint && yarn test
    ```

4. Build artifacts

    ```bash
    yarn build
    ```

## Docker development environment

You can contribute to this plugin via a Docker development environment.

This plugin is tested against [Grafana 6.3.7](https://hub.docker.com/r/grafana/grafana/tags).

**Note**
Use Google chrome for testing. Grafana uses angular and stack traces are better
in Google Chrome.

1. Spin a grafana docker instance and bind a shared volume between your host
   and the grafana container. The shared volume is where you would copy the
   plugin artifacts to.

    ```bash
    UID=$(id -u) USER=$(whoami) docker run -d --name grafana \
        --user $UID \
        --volume "/Users/${USER}/Work/var/run/docker/grafana/:/var/lib/grafana" \
        -p 3000:3000 \
        -e "GF_LOG_CONSOLE_LEVEL=debug" \
        -e "GF_DATAPROXY_LOGGING=true" \
        grafana/grafana:6.3.7
    ```

    Note that you can control verbosity of logs by setting log levels to desired
    level. See [grafana documentation](https://grafana.com/docs/installation/configuration/#log) for available levels.

    To follow grafana logs from the server

    ```bash
    docker logs --follow grafana
    ```

2. Edit the plugin sources and when ready, build the artifacts and copy it to the
   volume shared between host and grafana container.

    ```bash
    npm run build
    ```

    Copy artifacts

    ```bash
    cp -rf dist ~/Work/var/run/docker/grafana/plugins/scalyr/
    ```

    Whenever you edit the source and build a new artifact, you've to hup grafana container.

    ```bash
    docker restart grafana
    ```
