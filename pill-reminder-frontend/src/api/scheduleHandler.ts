import axios from "axios"
import { ResponseError } from "../utils/api";
import { API } from "./constants"
import { ScheduleActionTypes, ScheduleSchema } from "./schemas/schedule.schema"

export type AddScheduleData = Omit<ScheduleSchema, "id" | "user_id">;
export type AddScheduleResponse = Omit<ScheduleSchema, "user_id" | "time"> & { time: string }
export type GetSchedulesData = Pick<ScheduleSchema, "user_id">;
export type GetSchedulesResponse = (Omit<ScheduleSchema, "user_id" | "time"> & { time: string })[]
export type DeleteScheduleData = Pick<ScheduleSchema, "id">;
export type DeleteScheduleResponse = { data: string }

type ScheduleFns = {
    "create-schedule":  ((data: AddScheduleData) => AddScheduleResponse),
    "get-schedules":    ((data: GetSchedulesData) => GetSchedulesResponse),
    "delete-schedule":  ((data: DeleteScheduleData) => DeleteScheduleResponse)
}

export const handleSchedule = async<P extends ScheduleActionTypes>(
    action: P, 
    ...[data]: Parameters<ScheduleFns[P]>
): Promise<ReturnType<ScheduleFns[P]> & ResponseError> => {
    const auth_token = localStorage.getItem("auth_token")
    const user_id = localStorage.getItem("user_id")

    let preparedData: any = {};
    Object.entries(data).map(([k, v]) => {
        const key = k.split(/(?=[A-Z][^A-Z])/g).join("_").toLowerCase()
        preparedData[`${key}`] = v
    })

    const reqResult = await axios.post<ReturnType<ScheduleFns[P]> & ResponseError>(API, { action, data: { ...preparedData, auth_token, user_id } })
    if (reqResult.data.err) {
        if (reqResult.data.err) {
            console.error(reqResult.data.err)
            return { err: reqResult.data.err, ...reqResult.data }
        }
    }

    return reqResult.data;
}
