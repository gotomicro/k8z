import type { DependenciesResponse } from '@/services/dependency';
import type { WorkloadKinds } from '@/services/workload';
import { request } from 'umi';

export interface Profile {
  url: string;
  podName: string;
  ctime: number;
}

export interface ProfilesParams {
  cluster: string;
  namespace: string;
  workload: string;
  workloadKind: WorkloadKinds;
  pod?: string;
}

export enum SvgTypes {
  flame = 'flame',
  profile = 'profile',
}

export const SvgTypeMapping: { [key in keyof typeof SvgTypes]: string } = {
  [SvgTypes.flame]: 'Flame',
  [SvgTypes.profile]: 'Profile',
};

export enum GoTypes {
  block = 'block',
  goroutine = 'goroutine',
  heap = 'heap',
  profile = 'profile',
}

export const GoTypeMapping: { [key in keyof typeof GoTypes]: string } = {
  [GoTypes.block]: 'Block',
  [GoTypes.goroutine]: 'Goroutine',
  [GoTypes.heap]: 'Heap',
  [GoTypes.profile]: 'Profile',
};

export enum Modes {
  pod = 'pod',
  ip = 'ip',
}

export const ModeMapping: { [key in keyof typeof Modes]: string } = {
  [Modes.pod]: 'Pod',
  [Modes.ip]: '直连',
};

export interface CreateProfileParams {
  mode: Modes;
  clusterName?: string;
  podName?: string;
  port: number;
  namespace?: string;
  seconds: number;
  workloadKind?: string;
  workload?: string;
  addr?: string;
}

export const GET_PROFILE_SVG_URL = '/api/v1/pprof/graph';
export const GET_PROFILE_DIFF_SVG_URL = '/api/v1/pprof/diff-graph';

export const GET_PROFILE_SVG_ZIP_URL = '/api/v1/pprof/download';

export async function createdProfile(data: CreateProfileParams) {
  return request(`/api/v1/pprof/run`, {
    method: 'POST',
    data,
  });
}

export async function getProfiles(params: ProfilesParams) {
  return request<RES.Res<Profile[]>>(`/api/v1/pprof/profile-list`, {
    method: 'GET',
    params,
  });
}

export async function runProfilesDiff(data: { baseUrl?: string; targetUrl?: string }) {
  return request<RES.Res<string>>(`/api/v1/pprof/run-diff`, {
    method: 'POST',
    data,
  });
}

export async function checkProfilingDependencies() {
  return request<RES.Res<DependenciesResponse>>(`/api/v1/pprof/check-dependencies`, {
    method: 'GET',
  });
}
