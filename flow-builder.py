import json, boto3

client = boto3.client('appflow', region_name='us-east-1')
flow_name = 'prod-flow'

def build():
  with open('config/source_config.json') as source_config_contents:
    source_config = json.load(source_config_contents)

  with open('config/dest_config.json') as dest_config_contents:
    dest_config = json.load(dest_config_contents)

  with open('config/tasks_config.json') as tasks_config_contents:
    tasks_config = json.load(tasks_config_contents)

  response = client.create_flow(
    flowName = flow_name,
    triggerConfig = {
      'triggerType': 'OnDemand'
    },
    sourceFlowConfig = source_config,
    destinationFlowConfigList = dest_config,
    tasks = tasks_config
  )
  print(response)


if __name__ == '__main__':
  build()
