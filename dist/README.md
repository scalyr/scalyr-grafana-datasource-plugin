# Scalyr data source for Grafana

This is an official Grafana data source plugin.
The plugin allows you to visualize your data stored in Scalyr in a Grafana instance that you manage.

### Install Scalyr datasource for Grafana

**You'll need**:
Write access to Grafana,
Scalyr API access

#### . Getting started

1. Clone the [plugin repository](https://github.com/scalyr/scalyr-grafana-datasource) from github.
2. Copy `scalyr-grafana-datasource/dist/` to the Grafana server at `var/lib/grafana/plugins/<folder_name>/`. `<folder_name>` doesn't matter.
3. Restart your grafana server.
4. Log into your grafana server and go to Data Sources configuration settings.
5. Enter these settings:
|Field Name|Value|
|Scalyr API Key|Your Scalyr Read Logs API Key|
|Scalyr URL|https://www.scalyr.com or https://eu.scalyr.com for eu users.|
6. Click save and test to verify these settings are correct.