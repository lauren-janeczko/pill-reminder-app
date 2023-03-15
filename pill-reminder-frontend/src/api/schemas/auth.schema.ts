import { ResponseError } from "../../utils/api";

export interface AuthSchema extends ResponseError {
    authenticated: boolean,
    user_id: string,
    authToken: string,
}

export interface AuthResponse extends ResponseError {
    authenticated: boolean;
    user_id: string,
    auth_token: string,
}

export const defaultAuthResponse: AuthSchema = {
    authenticated: false,
    user_id: "",
    authToken: "",
}

export const convertAuthResponseToSchema = (response: AuthResponse): AuthSchema => {
    return {
        authenticated: response.authenticated,
        authToken: response.auth_token,
        user_id: response.user_id,
        err: response.err
    }
}