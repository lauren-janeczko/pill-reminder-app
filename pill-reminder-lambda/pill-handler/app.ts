import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { authenticateUser, AuthUserData, authWithToken } from './dao/authDao';
import { addSchedule, AddScheduleData, deleteSchedule, DeleteScheduleData, getSchedules, GetSchedulesData } from './dao/scheduleDao';
import { addUser, AddUserData, deleteUser, DeleteUserData } from './dao/userDao';
import { scheduleActions, ScheduleActionTypes } from './schemas/schedule.schema';
import { UserActionTypes } from './schemas/user.schema';
import { ResponseError } from './utils';

const responseHeaders = {
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Expose-Headers": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, X-Requested-With",
        "Vary": "Origin",
    },
    isBase64Encoded: false,
}

type ActionType = UserActionTypes | ScheduleActionTypes
type RequestData = AddUserData | AuthUserData | DeleteUserData | AddScheduleData | DeleteScheduleData | GetSchedulesData
interface RequestBody {
    action: ActionType,
    data: RequestData
}

function errorResponse(msg: object | string, code?: number) {
    return {
        ...responseHeaders,
        statusCode: code ?? 500,
        body: JSON.stringify({
            err: msg || "unknown server error",
        }),
    };
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        let responseBody: any = {};
        const body = JSON.parse(event.body ?? "") as RequestBody;
        if (!body.action) return errorResponse("Action is missing");

        if (scheduleActions.includes(body.action as ScheduleActionTypes)) {
            const data = body.data as AuthUserData
            const authResult = await authWithToken(data.user_id, data.auth_token ?? "")
            
            if ((authResult as ResponseError).err) return {
                ...responseHeaders,
                statusCode: 200,
                body: JSON.stringify({
                    err: "User not logged in",
                    authorized: false
                })
            }
            switch(body.action) {
                // Schedule Handling
                case "create-schedule": responseBody = await addSchedule(body.data as AddScheduleData); break;
                case "delete-schedule": responseBody = await deleteSchedule(body.data as DeleteScheduleData); break;
                case "get-schedules": responseBody = await getSchedules(body.data as GetSchedulesData); break;
            }

        } else {
            switch(body.action) {
                // User & Auth Handling
                case "sign-up": responseBody = await addUser(body.data as AddUserData); break;
                case "auth": responseBody = await authenticateUser(body.data as AuthUserData); break;
                case "delete-account": responseBody = await deleteUser(body.data as DeleteUserData); break;
            }
        }


        if (responseBody.err) {
            return errorResponse(responseBody.err, responseBody.statusCode)
        }
        
        return {
            ...responseHeaders,
            statusCode: 200,
            body: JSON.stringify(responseBody),
        };
    } catch (err) {
        console.log(err);
        return errorResponse({message: "Invalid server request", obj: err}, 500);
    }
};
