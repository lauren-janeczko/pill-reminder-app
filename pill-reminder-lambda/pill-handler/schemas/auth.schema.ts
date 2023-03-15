import { dbQuery } from "../utils";

export interface AuthSchema {
    id: string,
    email: string,
    auth_token: string,
    active: boolean
}

export async function getSessionToken(email: string, auth_token: string): Promise<AuthSchema | undefined> {
    return new Promise(async(resolve) => {
        await dbQuery<AuthSchema>(
            'SELECT * FROM sessions WHERE user_id = $1 AND auth_token = $2',
            [email, auth_token]
        ).then((r) => {
            if (r.rows) resolve(r.rows[0])
        }).catch((e) => { throw new Error(JSON.stringify(e)) });
        resolve(undefined)
    })
}