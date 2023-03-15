import axios from "axios"
import { API } from "./constants"
import { AuthSchema } from "./schemas/auth.schema";

import { ResponseError } from "../utils/api";
import { UserActionTypes, UserSchema } from "./schemas/user.schema"

export type SignUpData = Omit<UserSchema, "err">
export type SignUpResponse = Omit<UserSchema, "password">
export type SignInData = Omit<UserSchema, "name" | "err">
export type SignInResponse = AuthSchema
export type AuthData = {}
export type DeleteUserData = Pick<UserSchema, "password">
export type DeleteUserResponse = {}
// export type AuthResponse = AuthSchema

type UserFns = {
    "auth":     (() => AuthSchema),
    "sign-up":  ((data: SignUpData) => SignUpResponse),
    "sign-in":  ((data: SignInData) => SignInResponse),
    "delete-account":  ((data: DeleteUserData) => DeleteUserResponse)
}

export const handleUser = async<P extends UserActionTypes>(
    action: P, 
    ...[data]: Parameters<UserFns[P]>
): Promise<ReturnType<UserFns[P]> & ResponseError> => {

    let preparedData: any = {};

    const auth_token = localStorage.getItem("auth_token")
    const user_id = localStorage.getItem("user_id")
    if (auth_token) preparedData["auth_token"] = auth_token
    if (user_id) preparedData["user_id"] = user_id

    if (action === "sign-in" || action === "auth") {
        preparedData["method"] = action === "sign-in" ? "password" : "token"
    }

    Object.entries(data ?? {}).map(([k, v]) => {
        const key = k.split(/(?=[A-Z][^A-Z])/g).join("_").toLowerCase()
        preparedData[`${key}`] = v
    })

    console.info(JSON.stringify(preparedData))

    const reqResult = await axios.post<ReturnType<UserFns[P]> & ResponseError>(API, {
        action: action === "sign-in" ? "auth" : action,
        data: { ...preparedData }
    })
    if (reqResult.data.err) {
        if (reqResult.data.err) {
            console.error(reqResult.data.err)
            return { err: reqResult.data.err, ...reqResult.data }
        }
    }

    return reqResult.data;
}


// export const signUpUser = async (data: SignUpData): Promise<SignUpResponse> => {
//     const result = await axios.post<SignUpResponse>(API, {
//         action: "add",
//         data
//     });

//     if (result.data.err) {
//         console.error(result.data.err)
//         return { err: result.data.err, ...{ user_id: data.user_id, name: data.name } }
//     }

//     console.info(result.data)
//     return result.data
// }


// export const signInUser = async (data: SignInData): Promise<AuthSchema> => {
//     const auth_token = localStorage.getItem("auth_token");
//     const result = await axios.post<AuthResponse>(API, {
//         action: "auth",
//         data: {
//             method: "password",
//             auth_token,
//             ...data
//         }
//     })

//     if (result.data.err) {
//         console.error(result.data.err)
//         return { err: result.data.err, ...defaultAuthResponse }
//     }

//     if (result.data.auth_token) {
//         localStorage.setItem("auth_token", result.data.auth_token)
//         localStorage.setItem("user_id", result.data.user_id)
//         return convertAuthResponseToSchema(result.data)
//     }

//     console.info(result)
//     return defaultAuthResponse
// }


// export const authenticateUser = async (): Promise<AuthSchema> => {
//     const auth_token = localStorage.getItem("auth_token");
//     const user_id = localStorage.getItem("user_id");

//     if (!auth_token || !user_id) return defaultAuthResponse;

//     const result = await axios.post<AuthResponse>(API, {
//         action: "auth",
//         data: {
//             method: "token",
//             auth_token,
//             user_id
//         }
//     })

//     if (result.data.err) {
//         console.error(result.data.err)
//         return { err: result.data.err, ...defaultAuthResponse }
//     }

//     if (result.data.authenticated) return convertAuthResponseToSchema(result.data)
//     return defaultAuthResponse
// }