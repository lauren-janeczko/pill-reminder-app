import axios from "axios"
import { API } from "./constants"
import { AuthSchema, AuthResponse, defaultAuthResponse, convertAuthResponseToSchema, } from "./schemas/auth.schema";
import { UserSchema } from "./schemas/user.schema";


export type SignUpUserResponse = Omit<UserSchema, "password">
export type SignUpData = Omit<UserSchema, "err">
export const signUpUser = async (data: SignUpData): Promise<SignUpUserResponse> => {
    const result = await axios.post<SignUpUserResponse>(API, {
        action: "add",
        data
    });

    if (result.data.err) {
        console.error(result.data.err)
        return { err: result.data.err, ...{ user_id: data.user_id, name: data.name } }
    }

    console.info(result.data)
    return result.data
}


export type SignInData = Omit<UserSchema, "name" | "err">
export const signInUser = async (data: SignInData): Promise<AuthSchema> => {
    const auth_token = localStorage.getItem("auth_token");
    const result = await axios.post<AuthResponse>(API, {
        action: "auth",
        data: {
            method: "password",
            auth_token,
            ...data
        }
    })

    if (result.data.err) {
        console.error(result.data.err)
        return { err: result.data.err, ...defaultAuthResponse }
    }

    if (result.data.auth_token) {
        localStorage.setItem("auth_token", result.data.auth_token)
        localStorage.setItem("user_id", result.data.user_id)
        return convertAuthResponseToSchema(result.data)
    }

    console.info(result)
    return defaultAuthResponse
}


export const authenticateUser = async (): Promise<AuthSchema> => {
    const auth_token = localStorage.getItem("auth_token");
    const user_id = localStorage.getItem("user_id");

    if (!auth_token || !user_id) return defaultAuthResponse;

    const result = await axios.post<AuthResponse>(API, {
        action: "auth",
        data: {
            method: "token",
            auth_token,
            user_id
        }
    })

    if (result.data.err) {
        console.error(result.data.err)
        return { err: result.data.err, ...defaultAuthResponse }
    }

    if (result.data.authenticated) return convertAuthResponseToSchema(result.data)
    return defaultAuthResponse
}