'use strict';

import task = require('vsts-task-lib/task');
import oc = require('./oc-run');

import * as install from './oc-install';

let version = task.getInput('version');
let endpoint = task.getInput('k8sService');
let kubeConfig = task.getEndpointAuthorizationParameter(
  endpoint,
  'kubeconfig',
  true
);
let argLine = task.getInput('cmd');
let agentOS = task.osType();
let ocPath = '';
install
  .installOc(version, agentOS)
  .then(function(path: string | null) {
    if (path === null) {
      throw 'No oc binary found';
    }
    ocPath = path;
    return install.writeKubeConfig(kubeConfig, agentOS);
  })
  .then(function() {
    return oc.execOc(ocPath, argLine);
  })
  .then(function() {
    task.setResult(
      task.TaskResult.Succeeded,
      'oc command successfully executed.'
    );
  })
  .catch(function(err) {
    task.setResult(task.TaskResult.Failed, err);
    return;
  });
