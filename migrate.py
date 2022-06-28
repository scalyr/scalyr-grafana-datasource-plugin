#!/usr/bin/env python3
# Migrate dashboard json from Scalyr plugin v2 to Dataset plugin v3
# Tested with Scalyr plugin v2.3.7 and Dataset plugin v3.0.4 on Grafana 8.5.x
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

import argparse
import io
import json
import logging
import re
import typing

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    parser = argparse.ArgumentParser()
    parser.add_argument('input', description='exported dashboard json')
    parser.add_argument('config', description='configuration json')
    args = parser.parse_args()

    with open(args.input) as inputfile:
        inputjson = json.load(inputfile)

    # Ideally use a json5 module here, avoiding dependencies for now
    with open(args.config) as inputfile, io.StringIO() as modifiedfile:
        for line in inputfile:
            line = re.sub('//.*$', '', line)
            line = re.sub('/\*.*\*/', '', line)
            modifiedfile.write(line)

        modifiedfile.flush()
        modifiedfile.seek(0)
        configjson = json.load(modifiedfile)

    OLD_PLUGIN = 'scalyr-datasource'
    NEW_PLUGIN = 'sentinelone-dataset-datasource'

    for input in inputjson.get('__inputs', []):
        if input['pluginId'] == OLD_PLUGIN:
            input['pluginId'] = NEW_PLUGIN
            logging.info(f'updated input pluginid for {input["name"]} input')

    for require in inputjson.get('__requires', []):
        if require['id'] == OLD_PLUGIN:
            require.update({
                     'id': NEW_PLUGIN,
                   'name': 'Dataset',
                'version': '3.0.4',
            })
            logging.info('updated requirement')

    def update_datasource(datasource: typing.Dict):
        datasource['type'] = NEW_PLUGIN

        if datasource.get('uid'):
            newuid = configjson.get('datasource-uid-mapping', {}).get(datasource['uid'])
            if newuid:
                datasource['uid'] = newuid
            else:
                logging.warrning(f'no datasource uid mapping found for {datasource["uid"]}')

    for i in range(len(inputjson.get('annotations', {}).get('list', []))):
        annotate = inputjson['annotations']['list'][i]
        if annotate.get('datasource', {}).get('type') == OLD_PLUGIN:
            update_datasource(annotate['datasource'])

            if annotate.get('queryText') is None or annotate.get('textField') is None: 
                logging.warning(f'no queryText/textField for annotation query {i}')
            else:
                query = annotate.pop('queryText')
                field = annotate.pop('textField')
                annotate['target'] = {
                    'breakDownFacetValue': '',
                             'expression': f'{query} | columns timestamp, {field}',
                              'queryType': 'Power Query',
                }

            logging.info(f'updated annotation {i}')

    for panel in inputjson.get('panels', []):
        if panel.get('datasource', {}).get('type') == OLD_PLUGIN:
            update_datasource(panel['datasource'])
            logging.info(f'updated datasource.type for panel {panel["id"]}')

        for i in range(len(panel.get('targets', []))):
            target = panel['targets'][i]
            if target.get('datasource', {}).get('type') == OLD_PLUGIN:
                update_datasource(target['datasource'])
                logging.info(f'updated datasource.type for target {i} of panel {panel["id"]}')

            querytype = target.get('queryType')
            if querytype == 'Standard Query':
                target.pop('copyText', None)
                target.pop('dataLink', None)

                if target.get('filter') is None:
                    logging.warning(f'no filter for standard query for target {i} of {panel["id"]}')
                    target['expression'] = ''
                else:
                    if target.get('function') is None:
                        logging.warning(f'no function for standard query for target {i} of {panel["id"]}')
                    target['expression'] = f'{target.get("function", "count")}({target["filter"]})'

                target['breakDownFacetValue'] = ''
                logging.info(f'updated standard query for target {i} of panel {panel["id"]}')

            elif querytype == 'Power Query':
                target.pop('copyText', None)
                target.pop('dataLink', None)
                if target.get('filter') is None:
                    logging.warning(f'no filter for power query for target {i} of {panel["id"]}')
                target['expression'] = target.pop('filter', '')
                target['breakDownFacetValue'] = ''
                logging.info(f'updated power query for target {i} of panel {panel["id"]}')

            else:
                logging.warning(f'unhandled query type {querytype} for target {i} of panel {panel["id"]}')

    print(json.dumps(inputjson, indent=2))
