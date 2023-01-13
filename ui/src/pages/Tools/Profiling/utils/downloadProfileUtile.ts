import { GET_PROFILE_SVG_ZIP_URL } from '@/services/profiling';
import { RequestBaseUrl } from '@/utils/electronRenderUtil';

export function getDownloadProfilePath(url: string) {
  return `${RequestBaseUrl}${GET_PROFILE_SVG_ZIP_URL}?url=${url}`;
}
