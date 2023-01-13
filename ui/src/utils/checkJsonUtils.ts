/**
 *
 * @param jsonStr
 * @param extra checkEmptyStr: 是否检测空字符串
 */
export const checkJsonStrUtils = (jsonStr: string, extra?: { checkEmptyStr?: boolean }) => {
  try {
    if (jsonStr === '' && !extra?.checkEmptyStr) {
      return true;
    }
    return !!JSON.parse(jsonStr);
  } catch (_) {
    return false;
  }
};
