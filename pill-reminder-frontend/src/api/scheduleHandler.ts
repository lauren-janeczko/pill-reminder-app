import axios from "axios"
import { ResponseError } from "../utils/api";
import { API } from "./constants"
import { defaultScheduleResponse, ScheduleActionTypes, ScheduleSchema } from "./schemas/schedule.schema"
import { authenticateUser } from "./userHandler";

export type AddScheduleData = Omit<ScheduleSchema, "id" | "user_id">;
export type AddScheduleResponse = Omit<ScheduleSchema, "user_id" | "time"> & { time: string }
export type GetSchedulesData = Pick<ScheduleSchema, "user_id">;
export type GetSchedulesResponse = (Omit<ScheduleSchema, "user_id" | "time"> & { time: string })[]
export type DeleteScheduleData = Pick<ScheduleSchema, "id">;
export type DeleteScheduleResponse = { data: string }

// type CreateScheduleFn = ((data: AddScheduleData) => AddScheduleResponse)
// type GetScheduleFn    = ((data: GetSchedulesData) => GetSchedulesResponse)
// type DeleteScheduleFn = ((data: DeleteScheduleData) => DeleteScheduleResponse)

// type ScheduleHandler = CreateScheduleFn | GetScheduleFn | DeleteScheduleFn

type ScheduleFns = {
    "create-schedule":  ((data: AddScheduleData) => AddScheduleResponse),
    "get-schedules":    ((data: GetSchedulesData) => GetSchedulesResponse),
    "delete-schedule":  ((data: DeleteScheduleData) => DeleteScheduleResponse)
}

type ScheduleHandler = {
    <P extends ScheduleActionTypes>(action: P, ...[data]: Parameters<ScheduleFns[P]>): Promise<ReturnType<ScheduleFns[P]>>;
}

const fun = async<P extends ScheduleActionTypes>(action: P, ...[data]: Parameters<ScheduleFns[P]>): Promise<ReturnType<ScheduleFns[P]>> => {
    const reqResult = await axios.post<ReturnType<ScheduleFns[P]> & ResponseError>(API, { action, data })
    return reqResult.data
    // return defaultScheduleResponse
}

export const handleSchedule = async<P extends ScheduleActionTypes>(
    action: P, 
    ...[data]: Parameters<ScheduleFns[P]>
): Promise<ReturnType<ScheduleFns[P]> & ResponseError> => {
    // const authResult = await authenticateUser()
    // if (!authResult.authenticated || authResult.err) {
    //     console.error("Error processing transaction", authResult)
    //     return { err: authResult.err }
    // }

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

// const testt = async() => {
//     const value = await fun("get-schedules", { userId: "" })
//     value.
// }

// type ScheduleHandlerV2 = {
//     (action: "create-schedule", data: AddScheduleData): AddScheduleResponse;
//     (action: "get-schedules", data: GetSchedulesData): GetSchedulesResponse;
//     (action: "delete-schedules", data: DeleteScheduleData): DeleteScheduleResponse;
// }

// const schedule: ScheduleHandler = async(action, ...[data]) => {
//     const authResult = await authenticateUser()
//     if (!authResult.authenticated || !authResult.err) {
//         console.error(authResult.err)
//         return { err: authResult.err, ...defaultScheduleResponse }
//     }

//     const reqResult = await axios.post<ReturnType<ScheduleFns[]> & ResponseError>(API, { action, data })
//     if (reqResult.data.err) {
//         if (reqResult.data.err) {
//             console.error(reqResult.data.err)
//             return { err: reqResult.data.err, ...defaultScheduleResponse }
//         }
//     }

//     return reqResult.data
//     switch(action) {
//         case "create-schedule": return reqResult.data as AddScheduleResponse;
//         case "get-schedules": return reqResult.data as AddScheduleResponse;
//         case "delete-schedules": return reqResult.data as AddScheduleResponse;
//     }
// }


// async function test() {
//     const result = await handleSchedule("get-schedules", { userId: "" })
    
// }