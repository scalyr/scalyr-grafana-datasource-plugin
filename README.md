# Scalyr data source for Grafana

This is a Scalyr Grafana data source plugin.
The plugin allows you to visualize your data stored in Scalyr in a Grafana instance that you manage.

### Install Scalyr datasource for Grafana

####You'll need:
* Write access to a local or managed Grafana instance
* Scalyr read logs API key. If you need to obtain one, you can find [documentation here]().


#### Getting started

1. Clone the [plugin repository](https://github.com/scalyr/scalyr-grafana-datasource) from GitHub.
2. Copy `scalyr-grafana-datasource/dist/` to the Grafana server at `var/lib/grafana/plugins/<folder_name>/`. `<folder_name>` doesn't matter.
3. Restart your grafana server.
4. Log into your grafana instance and go to Configuration Settings > Data Sources > Scalyr Grafana Datasource.
5. Enter these settings:

    |Field Name | Value|
    | --- | --- |
    |Scalyr API Key | Your Scalyr Read Logs API Key|
    |Scalyr URL | https://www.scalyr.com or https://eu.scalyr.com for EU users.|

6. Click the "Save & Test" button to verify these settings are correct. 

#### Using the Scalyr Datasource
After you've installed and configured the datasource, you're ready to start visualizing your Scalyr data inside Grafana. To create a visualization in Grafana:

1. Create a new dashboard by clicking Create > dashboard
2. Select "Add Query"
3. From the Query dropdown, select "Scalyr Grafana Datasource".
4. A query datasource consist of four parts: 
    * **Function**: You are given a list of the functions that can be applied to the facet values. You can find more documentation [here](https://www.scalyr.com/help/dashboards#graphFunctions)
    * **Facet**: The name of the event field to be graphed
    * **Label**: Label for the query. This is displayed as the series title in the graph legend.
    * **Query**: Query filter to be used. This field supports [Scalyr query syntax](https://www.scalyr.com/help/query-language).
5. Fill out all the fields and click the Save button. 

Note: you can add multiple queries to a visualization to plot multiple series on the same graph.

