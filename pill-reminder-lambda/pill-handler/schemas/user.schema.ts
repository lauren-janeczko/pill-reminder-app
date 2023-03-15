export interface UserSchema {
    email: string,
    password: string,
    name: string,
}
export const userActions = [
    "sign-up",
    "sign-in",
    "auth",
    "delete-account"
] as const
export type UserActionTypes = typeof userActions[number]