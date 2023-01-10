export default {
  'GET /api/v1/k8s/clusters': {
    code: 0,
    msg: '',
    data: [
      {
        name: 'k8s1',
      },
    ],
  },
  '/api/v1/k8s/:cluster/namespaces': {
    code: 0,
    msg: '',
    data: [
      {
        name: 'default',
      },
      {
        name: 'staging',
      },
    ],
  },

  'GET /api/v1/k8s/:cluster/:namespace/workloads': {
    code: 0,
    msg: '',
    data: [
      {
        name: 'ab-test',
        kind: 'deployment',
      },
    ],
  },

  'GET /api/v1/k8s/:cluster/:namespace/:workloadKind/:workload/pods': {
    code: 0,
    msg: '',
    data: [
      {
        name: 'test-xxx-111',
      },
    ],
  },
  'GET /api/v1/pprof/profile-list': {
    code: 0,
    msg: '成功',
    data: [
      {
        url: 'mdp-69949797f6-lww25_1662371785086',
        podName: 'mdp-69949797f6-lww25',
        ctime: 1662371785,
      },
      {
        url: 'mdp-69949797f6-lww25_1662372117500',
        podName: 'mdp-69949797f6-lww25',
        ctime: 1662372117,
      },
    ],
  },
};
