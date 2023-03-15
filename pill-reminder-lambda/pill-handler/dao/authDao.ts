import bcrypt from 'bcryptjs'
import { randomUUID } from "crypto";
import { PromiseOrError, error, generateToken, dbQuery } from "../utils";
import { getExistingUser } from "./userDao";
import { getSessionToken } from "../schemas/auth.schema"


export type AuthUserData = {
    method: "password" | "token",
    user_id: string,
    password?: string,
    auth_token?: string,
}
type AuthUserResponse = {
    authenticated: boolean
};

export async function authenticateUser(data: AuthUserData): PromiseOrError<AuthUserResponse> {
    const { method, user_id } = data;

    if (method === "token" && data.auth_token) return authWithToken(user_id, data.auth_token)
    else if (method === "password" && data.password) return authWithPassword(user_id, data.password, data.auth_token)
    else return error("Authentication is invalid", 200);
}

type AuthWithTokenResponse = {
    authenticated: boolean;
}
export async function authWithToken(user_id: string, auth_token: string): PromiseOrError<AuthWithTokenResponse> {
    return new Promise(async(resolve) => {
        const authUser = await getExistingUser(user_id);
        if (!authUser) return error("User not found", 200);

        const authSession = await getSessionToken(user_id, auth_token)
        if (auth_token === authSession?.auth_token && authSession.active) {
            resolve ({ authenticated: true })
        } else {
            resolve(error("User has no authenticated session"))
        }
    })
}


interface AuthWithPasswordSchema {
    id: string;
    user_id: string;
    auth_token: string;
}

type AuthWithPasswordResponse = {
    authenticated: boolean;
    user_id: string,
    auth_token: string;
}

export async function authWithPassword(user_id: string, password: string, auth_token?: string): PromiseOrError<AuthWithPasswordResponse> {

    return new Promise(async(resolve) => {
        if (auth_token) {
            const result = await authWithToken(user_id, auth_token)
            if ((result as AuthWithTokenResponse).authenticated) {
                resolve({
                    authenticated: true,
                    user_id,
                    auth_token
                })
            }
        }

        const authenticatedUser = await getExistingUser(user_id);
        if (!authenticatedUser) {
            resolve(error("User not found", 200));
        }
      
        const passwordMatches = await bcrypt.compare(password, authenticatedUser!.password);
        if (!passwordMatches) {
            resolve(error("Invalid user or password", 200));
        };
    
        const authToken = generateToken();
        const authTokenId = randomUUID();
    
        const sessionToken = await dbQuery<AuthWithPasswordSchema>(
            "INSERT INTO sessions VALUES ($1, $2, $3) RETURNING *",
            [authTokenId, user_id, authToken]
        ).then(r => r.rows ? r.rows[0].auth_token : "" )
        .catch(e => { resolve(error("Creating new session failed", 200)) })
    
        if (typeof sessionToken === 'string') {
            resolve({
                authenticated: true,
                user_id,
                auth_token: sessionToken as string
            });
        }
        resolve(error("Unknown authentication error"))
    })
}