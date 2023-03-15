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

// export type UserHandler = 
//     ((action: "sign-in", data: SignInData) => AuthSchema) |
//     ((action: "sign-up", data: SignUpData) => SignUpUserResponse) |
//     ((action: "auth", data: {}) => AuthSchema)


// export const handleUser: UserHandler = async(...[action, data]: Parameters<UserHandler>): Promise<ReturnType<UserHandler>> => {
//     let response: any = {}
//     switch(action) {
//         case "sign-in": response = await signInUser(data); break
//         case "sign-up": response = await signUpUser(data); break
//         case "auth": response = await authenticateUser(); break
//     }

//     return response
// }
