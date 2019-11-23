# Docker development environment

You can contribute to this plugin via a Docker development environment.

1. Spin a grafana docker instance and bind a shared volume between your host
   and the grafana container. The shared volume is where you would copy the 
   plugin artifacts to.

    ```bash
    UID=$(id -u) USER=$(whoami) "docker run -d --name grafana --user $UID --volume "/Users/${USER}/Work/var/run/docker/grafana/:/var/lib/grafana" -p 3000:3000 -e "GF_LOG_CONSOLE_LEVEL=debug" -e "GF_DATAPROXY_LOGGING=true" grafana/grafana
    ```

    Note that you can control verbosity of logs by setting log levels to desired
    level. See [grafana documentation](https://grafana.com/docs/installation/configuration/#log) for available levels.

    To follow grafana logs from the server

    ```bash
    docker logs --follow grafana
    ```

2. Edit the plugin sources and when ready build the artifacts and copy it to the
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
