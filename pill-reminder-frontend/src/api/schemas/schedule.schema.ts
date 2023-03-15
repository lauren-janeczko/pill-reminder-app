export enum ScheduleFrequency {
    EveryDay = "Every day",
    EveryOtherDay = "Every other day",
    EveryWeek = "Every week",
    Custom = "Custom",
    Unknown = "Unknown"
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
    hours: number;
    minutes: number;
}

export const scheduleActions = [
    "create-schedule",
    // "edit-schedule",
    "delete-schedule",
    "get-schedules",
] as const
export type ScheduleActionTypes = typeof scheduleActions[number]

export interface ScheduleSchema {
    id: string,
    user_id: string,
    pill_name: string,
    dosage: string,
    time: TimeOfDay,
    frequency: ScheduleFrequency,
    custom_frequency?: Day[],
}

export const defaultScheduleResponse: ScheduleSchema = {
    id: "",
    user_id: "",
    pill_name: "",
    dosage: "",
    time: {
        hours: 0,
        minutes: 0
    },
    frequency: ScheduleFrequency.Unknown,
    custom_frequency: [],
}