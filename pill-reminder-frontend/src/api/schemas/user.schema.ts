import { ResponseError } from "../../utils/api"

export const userActions = [
    "sign-up",
    "sign-in",
    "auth",
    "delete-account"
] as const
export type UserActionTypes = typeof userActions[number]

export interface UserSchema extends ResponseError {
    user_id: string,
    password: string,
    name: string,
}