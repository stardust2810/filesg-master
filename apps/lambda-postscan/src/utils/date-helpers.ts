import format from 'date-fns/format';

export function transformSecondsToDateString(secs: number) {
  return format(new Date(secs * 1000), 'yyyy/MM/dd HH:mm:ss');
}
