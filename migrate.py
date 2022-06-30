#!/usr/bin/env python3
# Migrate dashboard json from Scalyr plugin v2 to Dataset plugin v3.
# Specifically uses the Grafana api to create new dashboards based on existing ones.
# Can create new dashboards (the default) or overwrite the existing ones.
# Tested with Scalyr plugin v2.3.7 and Dataset plugin v3.0.4 on Grafana 8.5.x.
#
# The config json is expected to be in the following format (json5 comments are supported):
# {
#   // Maps scalyr plugin datasource uids to dataset plugin uids
#   "datasource-uid-mapping": {
#     "<scalyr-plugin-datasource-uid1>": "<dataset-plugin-datasource-uid1">,
#     "<scalyr-plugin-datasource-uid2>": "<dataset-plugin-datasource-uid2">,
#     ...
#   }
# }
#
# This script works with Grafana Cloud accounts however an api key is required.
# The api key is specified along with the special username api_key, ie:
#   ./migrate.py -g grafana.com:443 -t -c api_key:<api-key> config.json
# Ref: https://grafana.com/docs/grafana/latest/developers/http_api/auth/

import requests

import argparse
import io
import json
import logging
import re
import typing

if __name__ == '__main__':
    OLD_PLUGIN = 'scalyr-datasource'
    NEW_PLUGIN = 'sentinelone-dataset-datasource'

    logging.basicConfig(level=logging.INFO)

    parser = argparse.ArgumentParser()
    parser.add_argument('config', help='config json')
    parser.add_argument('--grafana', '-g', default='127.0.0.1:3000', help='grafana server')
    parser.add_argument('--creds', '-c', default='admin:admin', help='grafana api creds')
    parser.add_argument('--tls', '-t', action='store_true', help='use tls?')

    action = parser.add_mutually_exclusive_group()
    action.add_argument('--overwrite', '-w', action='store_true', help='overwrite dashboards')
    action.add_argument('--create', '-r', action='store_true', help='create new dashboards')

    args = parser.parse_args()

    if not any([args.create, args.overwrite]):
        args.create = True

    # Ideally use a json5 module here, avoiding dependencies for now
    with open(args.config) as inputfile, io.StringIO() as modifiedfile:
        for line in inputfile:
            line = re.sub('//.*$', '', line)
            line = re.sub('/\*.*\*/', '', line)
            modifiedfile.write(line)

        modifiedfile.flush()
        modifiedfile.seek(0)
        config = json.load(modifiedfile)

    requests_kwargs = {
           'auth': requests.auth.HTTPBasicAuth(*args.creds.split(':')),
        'timeout': 100,
    }
    grafana_baseurl = f'http{"s" if args.tls else ""}://{args.grafana}'

    #
    # Validate the datasource uid mapping
    #

    resp = requests.get(grafana_baseurl + '/api/datasources', **requests_kwargs)
    resp.raise_for_status()
    datasources = resp.json()
    scalyr_datasource_uids = set([d['uid'] for d in datasources if d['type'] == 'scalyr-datasource'])
    dataset_datasource_uids = set([d['uid'] for d in datasources if d['type'] == 'sentinelone-dataset-datasource'])

    if scalyr_datasource_uids - set(config['datasource-uid-mapping'].keys()):
        logging.warning('there are scalyr plugin datasources in grafana that are not in the datasource-uid-mapping')
    if set(config['datasource-uid-mapping'].keys()) - scalyr_datasource_uids:
        logging.warning('there are scalyr plugin datasources in the datasource-uid-mapping that are not in grafana')
    if dataset_datasource_uids - set(config['datasource-uid-mapping'].values()):
        logging.warning('there are dataset plugin datasources in grafana that are not in the datasource-uid-mapping')
    if set(config['datasource-uid-mapping'].values()) - dataset_datasource_uids:
        logging.warning('there are dataset plugin datasources in the datasource-uid-mapping that are not in grafana')

    #
    # Retrieve the dashboards json
    #

    dashboard_uids = []
    search_params = { 'type': 'dash-db', 'limit': 1000, 'page': 1 }
    while True:
        resp = requests.get(grafana_baseurl + '/api/search', params=search_params, **requests_kwargs)
        resp.raise_for_status()
        resp_json = resp.json()
        dashboard_uids += [d['uid'] for d in resp_json]
        if len(resp_json) < search_params['limit']:
            break
        search_params['page'] += 1

    dashboards = []
    for dashboard_uid in dashboard_uids:
        resp = requests.get(f'{grafana_baseurl}/api/dashboards/uid/{dashboard_uid}', **requests_kwargs)
        resp.raise_for_status()
        dashboards += [resp.json()]
    logging.info(f'retrieved {len(dashboards)} dashboard{"s" if len(dashboards) > 1 else ""} successfully')

    with open('dashboards.json.orig', 'w') as origfile:
        json.dump(dashboards, origfile)

    #
    # Modify the dashboards json
    #

    def update_datasource(datasource: typing.Dict):
        assert datasource.get('uid')

        newuid = config.get('datasource-uid-mapping', {}).get(datasource['uid'])
        if not newuid:
            raise Exception(f'no datasource uid mapping found for {datasource["uid"]}')

        datasource['type'] = NEW_PLUGIN
        datasource['uid'] = newuid

    for dashboard in dashboards:
        dashboard_label = f'"{dashboard["dashboard"]["title"]}" / {dashboard["dashboard"]["uid"]}'

        for annotation in dashboard.get('dashboard', {}).get('annotations', {}).get('list', []):
            annotation_label = f'"{annotation["name"]}"'

            if annotation.get('datasource', {}).get('type') == OLD_PLUGIN:
                update_datasource(annotation['datasource'])

                assert annotation.get('queryText')
                assert annotation.get('textField')

                query = annotation.pop('queryText')
                field = annotation.pop('textField')
                annotation['target'] = {
                    'breakDownFacetValue': '',
                             'expression': f'{query} | columns timestamp, {field}',
                              'queryType': 'Power Query',
                }

                logging.info(f'updated dashboard {dashboard_label}: annotation {annotation_label}')

        for panel in dashboard.get('dashboard', {}).get('panels', []):
            panel_label = (f'"{panel["title"]}"/' if panel.get('title') else '') + f'{panel["id"]}'

            if panel.get('datasource', {}).get('type') == OLD_PLUGIN:
                update_datasource(panel['datasource'])

                for target in panel.get('targets', []):
                    target_label = f'{target["refId"]}'

                    if target.get('datasource', {}).get('type') == OLD_PLUGIN:
                        update_datasource(target['datasource'])

                    querytype = target.get('queryType')
                    assert querytype in ['Standard Query', 'Power Query']

                    if querytype == 'Standard Query':
                        assert target.get('filter')
                        assert target.get('function')

                        target.pop('copyText', None)
                        target.pop('dataLink', None)
                        filter = target.pop('filter')
                        function = target.pop('function')

                        target['queryType'] = 'Standard'
                        target['expression'] = f'{function}({filter})'
                        target['breakDownFacetValue'] = ''

                    elif querytype == 'Power Query':
                        assert target.get('filter')

                        target.pop('copyText', None)
                        target.pop('dataLink', None)

                        target['expression'] = target.pop('filter')
                        target['breakDownFacetValue'] = ''

                    logging.info(f'updated dashboard {dashboard_label}: panel {panel_label}: target {target_label}')

    with open('dashboards.json', 'w') as updatedfile:
        json.dump(dashboards, updatedfile)

    #
    # Deploy the updated dashboards
    #

    if args.create:
        for dashboard in dashboards:
            dashboard['dashboard']['id'] = None
            dashboard['dashboard']['uid'] = None
            dashboard['dashboard']['title'] = 'Migrated: ' + dashboard['dashboard']['title']

    verb = 'created' if args.create else 'updated'
    for dashboard in dashboards:
        resp = requests.post(grafana_baseurl + '/api/dashboards/db', json=dashboard, **requests_kwargs)
        resp.raise_for_status()
        resp_json = resp.json()
        assert resp_json['status'] == 'success'
        
        dashboard_label = f'"{dashboard["dashboard"]["title"]}"' + (f'/ {dashboard["dashboard"]["uid"]}' if args.overwrite else '')
        logging.info(f'successfully {verb} dashboard {dashboard_label} version {resp_json["version"]}')
