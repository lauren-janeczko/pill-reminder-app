export enum ScheduleFrequency {
    EveryDay = "Every day",
    EveryOtherDay = "Every other day",
    EveryWeek = "Every week",
    Custom = "Custom",
}

enum Day {
    Monday = "Monday",
    Tuesday = "Tuesday",
    Wednesday = "Wednesday",
    Thursday = "Thursday",
    Friday = "Friday",
    Saturday = "Saturday", 
    Sunday = "Sunday",
}

type TimeOfDay = {
    hours: string | number;
    minutes: string | number;
}

export interface ScheduleSchema {
    id: string,
    user_id: string,
    pill_name: string,
    dosage: string,
    time: TimeOfDay,
    frequency: ScheduleFrequency,
    custom_frequency?: Day[],
}

export const scheduleActions = [
    "create-schedule",
    "edit-schedule",
    "delete-schedule",
    "get-schedules",
] as const
export type ScheduleActionTypes = typeof scheduleActions[number]