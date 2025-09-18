import { WEEKDAYS } from '../enums/weekDays';

export const createWeekdayOptions = (t: (label: string) => string, short = false) =>
  Object.values(WEEKDAYS).map((day) => ({
    value: day,
    label: t(`common:${short ? 'weekdaysShort' : 'weekdays'}.${day}`),
  }));
