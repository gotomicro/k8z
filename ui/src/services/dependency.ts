export interface DependencyError {
  dependency: string;
  refer: string;
}

export interface DependenciesResponse {
  success: string;
  dependencyErrors: DependencyError[];
}
