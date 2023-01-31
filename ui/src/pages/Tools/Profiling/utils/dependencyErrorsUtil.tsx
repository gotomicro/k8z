import type { DependencyError } from '@/services/dependency';

export function getErrorMsg(errors: DependencyError[]) {
  return (
    <span>
      [Error]:&nbsp;依赖检测未通过，详情如下
      <ol>
        {errors.map((error) => {
          return (
            <li key={error.dependency}>
              依赖缺失：<strong>{error.dependency}</strong>，请参考
              <a onClick={() => window.electron?.openInBrowser?.(error?.refer)}>
                &nbsp;{error.refer}&nbsp;
              </a>
              解决
            </li>
          );
        })}
      </ol>
    </span>
  );
}
