# Dataset data source for Grafana

[![Marketplace](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=marketplace&prefix=v&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22sentinelone-dataset-datasource%22%29%5D.version&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/sentinelone-dataset-datasource)
[![Downloads](https://img.shields.io/badge/dynamic/json?logo=grafana&color=F47A20&label=downloads&query=%24.items%5B%3F%28%40.slug%20%3D%3D%20%22sentinelone-dataset-datasource%22%29%5D.downloads&url=https%3A%2F%2Fgrafana.com%2Fapi%2Fplugins)](https://grafana.com/grafana/plugins/sentinelone-dataset-datasource)

The Dataset Grafana data source plugin allows you to create and visualize graphs
and dashboards in Grafana using data in Dataset. You may want to use this plugin
to allow you to visualize Dataset data next to other data sources, for instance
when you want to monitor many feeds on a single dashboard.

![SystemDashboard](https://raw.githubusercontent.com/scalyr/scalyr-grafana-datasource-plugin/master/src/img/SystemDashboard.png)

With the Dataset plugin, you will be able to create and visualize your log-based
metrics along side all of your other data sources. It's a great way to have a
single pane of glass for today's complex systems. You can leverage Grafana
alerts based on Dataset data to notify you when there are possible issues. More
importantly, you'll soon be able to jump to Dataset's fast, easy and intuitive
platform to quickly identify the underlying causes of issues that may arise.

## Prerequisites

* **An installed Grafana server instance with write access**: This document
assumes that an existing instance of Grafana already exists. If you need help
bringing up a Grafana instance, please refer to the [documentation provided by
Grafana](https://grafana.com/docs/installation/).
* **A Dataset read log API Key**: A Dataset API key is required for Grafana to
pull data from Dataset. You can obtain one by going to your account in the
Dataset product and selecting the “API Keys” from the menu in the top right
corner. You can find documentation on API Keys
[here](https://www.scalyr.com/help/api#scalyr-api-keys).

## Installation

Using grafana-cli: `grafana-cli plugins install sentinelone-dataset-datasource`

Alternatively can download it
[here](https://github.com/scalyr/scalyr-grafana-datasource-plugin/releases/latest/)
and unzip it manually into the Grafana plugins directory (eg
`/var/lib/grafana/plugins`).  A restart of the Grafana server is required
afterwards.

## Configuration

1. Log in to your grafana instance and navigate to **Configuration Settings ->
   Data sources**.

    ![ConfigDataSource](https://raw.githubusercontent.com/scalyr/scalyr-grafana-datasource-plugin/master/src/img/ConfigDataSource.png)

2. This will take you into the configuration page. If you already have other
   data sources installed, you will see them show up here. Click on the **Add
   data source** button:

    ![DatasetConfig](https://raw.githubusercontent.com/scalyr/scalyr-grafana-datasource-plugin/master/src/img/DatasetConfig.png)

3. If you enter "Dataset" in the search bar on the resulting page you should see
   "Dataset" grafana plugin show up as an option.

    ![SearchForPlugin](https://raw.githubusercontent.com/scalyr/scalyr-grafana-datasource-plugin/master/src/img/SearchForPlugin.png)

4. Click on **Select**. This will take you to a configuration page where you
   insert your API key mentioned in the prerequisite section.

    ![PluginConfig](https://raw.githubusercontent.com/scalyr/scalyr-grafana-datasource-plugin/master/src/img/PluginConfig.png)

5. Enter these settings:

    | Field Name | Value |
    | --- | --- |
    | Dataset API Key | Your Scalyr Read Logs API Key |
    | Dataset URL | `https://app.scalyr.com` or `https://app.eu.scalyr.com` for EU users. |

6. Click **Save & Test** to verify these settings are correct.

## Using the Dataset Datasource

Now that you’ve completed installing and configuring the Dataset data source
plugin, lets go through an example of how you can start using it to create a
dashboard using Scalyr data.

1. Create a new dashboard by click **Create -> Dashboard**.

    ![CreateDashboard](https://raw.githubusercontent.com/scalyr/scalyr-grafana-datasource-plugin/master/src/img/CreateDashboard.png)

2. In the **New dashboard** box, select the **Add a new panel** icon.

3. From the Data source dropdown, select **Dataset**.

    ![DataSetPlugin](https://raw.githubusercontent.com/scalyr/scalyr-grafana-datasource-plugin/master/src/img/DatasetPlugin.png)

4. A **Query Type** field allows to choose the type of query you wanted to
   search for.

    ![QueryType](https://raw.githubusercontent.com/scalyr/scalyr-grafana-datasource-plugin/master/src/img/QueryType.png)

5. **Standard Query** - A standard query allows to search on Graph view. You can
   enter graph functions into the expression box and visualize the results. You
   can even enter and visualize complex expressions.
   [This](https://www.scalyr.com/help/dashboards#graphFunctions) is a good
   resource to see the list of supported functions.

   Enter an expression and click the save button. In the image below, we've
   added a query to graph the number of log messages that contain the word
   "error".

     ![StandardQuery](https://raw.githubusercontent.com/scalyr/scalyr-grafana-datasource-plugin/master/src/img/StandardQuery.png)

6. **Power Query** - Works similar to PQ search in Dataset app. You can enter
   rich set of commands for transforming and manipulating data. Data can be
   viewed in table format. Visit
   [this page](https://app.scalyr.com/help/power-queries) for more information
   on building Power Queries.

     ![PowerQuery](https://raw.githubusercontent.com/scalyr/scalyr-grafana-datasource-plugin/master/src/img/PowerQuery.png)

You’ve successfully installed, configured and created a graph in Grafana using
Dataset data!

Note: you can add multiple queries to a visualization to plot multiple series on
the same graph.

## Variables

For general information on Grafana variables see the documentation on
[variable syntax](https://grafana.com/docs/grafana/latest/variables/syntax/) and
[variable format options](https://grafana.com/docs/grafana/latest/variables/advanced-variable-format-options/)

Queries support all Grafana variable substitution syntaxes, for example:

```bash
$varname
${varname}
${varname:<format>}
```

For multi-value variables use the singlequote or doublequote formatting option:

```bash
${varname:singlequote} => 'value1','value2','value3'
${varname:doublequote} => "value1","value2","value3"
```

The expected use of multi-value variables is for `in` queries, for example:

```bash
$serverHost in (${host:singlequote})
```

