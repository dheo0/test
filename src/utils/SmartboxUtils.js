import _ from 'lodash';

export function createPartitionKey(code, folder) {
  return `${code}|${folder}`
}

export function getSourcesFromPartitionKey(partitionKey) {
  return _.split(partitionKey, '|');
}
