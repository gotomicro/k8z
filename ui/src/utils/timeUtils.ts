import dayjs from 'dayjs';

export function unixTimeFormat(time: number) {
  return dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss');
}

export function stringTimeFormat(time: string) {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
}
