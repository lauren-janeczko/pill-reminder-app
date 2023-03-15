import bcrypt from 'bcryptjs';
import { UserSchema } from '../schemas/user.schema';
import { dbQuery, error, ResponseError, PromiseOrError } from '../utils';
import { authWithPassword } from './authDao';


export type AddUserData = UserSchema;
type AddUserResponse = Pick<UserSchema, "user_id" | "name">

export function addUser(data: AddUserData): PromiseOrError<AddUserResponse> {
    const {user_id, password, name} = data;
  
    return new Promise(async (resolve) => {
        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert the new user into the user table
        const result = await dbQuery<AddUserData>(
          'INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3) RETURNING *',
          [user_id, hashedPassword, name]
        ).catch(e => resolve(error("user already exists", 200)));
        
        if (result) {
            const newUser: AddUserResponse = {
                user_id: result.rows[0].user_id,
                name: result.rows[0].name,
            }
            resolve(newUser);
        } else {
            throw new Error(JSON.stringify(
                result
            ));
        }        
    });
}

export type DeleteUserData = Pick<UserSchema, "user_id" | "password">
interface DeleteUserResponse {
    data: string,
}

export function deleteUser(data: DeleteUserData): PromiseOrError<DeleteUserResponse>  { 
    const {user_id, password} = data;

    return new Promise(async (resolve) => {
        // Authenticate the user
        const auth = await authWithPassword(user_id, password);
        if ((auth as ResponseError).err) resolve(auth as ResponseError);
        else {
            // Delete the user
            const result = await dbQuery<UserSchema>(
                'DELETE FROM users WHERE user_id = $1 RETURNING *', 
                [user_id]
            );
            if (!result.rows[0]) resolve(error("Delete failed", 200))
            
            const deletedUser = result.rows[0] as UserSchema;
            const message = { data: `User '${deletedUser.user_id}' been deleted successfully.` }
            resolve(message);
        }
    })
}

export async function getExistingUser(user_id: string): Promise<UserSchema | undefined> {
    return new Promise(async(resolve) => {
        await dbQuery<UserSchema>(
            'SELECT * FROM users WHERE user_id = $1',
            [user_id]
        ).then((r) => {
            if (r.rows.length > 0) resolve(r.rows[0])
        }).catch((e) => { throw new Error(JSON.stringify(e)) });
        resolve(undefined)
    })
}