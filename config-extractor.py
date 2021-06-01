import json, boto3

client = boto3.client('appflow', region_name='us-east-1')
all_config_file_name = 'config/flow_config.json'
flow_name = 's3-flow'

def extract():
  with open(all_config_file_name, 'r') as all_config:
    contents = json.load(all_config)

  with open('config/tasks_config.json', 'w') as tasks_config:
    tasks_config.write(json.dumps(contents['tasks'], indent=2))

  with open('config/source_config.json', 'w') as source_config:
    source_config.write(json.dumps(contents['sourceFlowConfig'], indent=2))

  with open('config/dest_config.json', 'w') as dest_config:
    dest_config.write(json.dumps(contents['destinationFlowConfigList'], indent=2))


def describe_flow():
  flow_config_contents = client.describe_flow(flowName= flow_name)
  with open(all_config_file_name, 'w') as flow_config:
    flow_config.write(json.dumps(flow_config_contents, indent=2, default=str))


if __name__ == '__main__':
  describe_flow()
  extract();
