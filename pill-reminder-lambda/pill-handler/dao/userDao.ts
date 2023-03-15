import bcrypt from 'bcryptjs';
import { UserSchema } from '../schemas/user.schema';
import { dbQuery, error, ResponseError, PromiseOrError } from '../utils';
import { authWithPassword } from './authDao';


export type AddUserData = UserSchema;
type AddUserResponse = Pick<UserSchema, "email" | "name">

export function addUser(data: AddUserData): PromiseOrError<AddUserResponse> {
    const {email, password, name} = data;
  
    return new Promise(async (resolve) => {
        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert the new user into the user table
        const result = await dbQuery<AddUserData>(
          'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
          [email, hashedPassword, name]
        ).catch(e => resolve(error("user already exists", 200)));
        
        if (result) {
            const newUser: AddUserResponse = {
                email: result.rows[0].email,
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

export type DeleteUserData = Pick<UserSchema, "email" | "password">
interface DeleteUserResponse {
    data: string,
}

export function deleteUser(data: DeleteUserData): PromiseOrError<DeleteUserResponse>  { 
    const {email, password} = data;

    return new Promise(async (resolve) => {
        // Authenticate the user
        const auth = await authWithPassword(email, password);
        if ((auth as ResponseError).err) resolve(auth as ResponseError);
        else {
            // Delete the user
            const result = await dbQuery<UserSchema>(
                'DELETE FROM users WHERE email = $1 RETURNING *', 
                [email]
            );
            if (!result.rows[0]) resolve(error("Delete failed", 200))
            
            const deletedUser = result.rows[0] as UserSchema;
            const message = { data: `User '${deletedUser.email}' been deleted successfully.` }
            resolve(message);
        }
    })
}

export async function getExistingUser(email: string): Promise<UserSchema | undefined> {
    return new Promise(async(resolve) => {
        await dbQuery<UserSchema>(
            'SELECT * FROM users WHERE email = $1',
            [email]
        ).then((r) => {
            if (r.rows.length > 0) resolve(r.rows[0])
        }).catch((e) => { throw new Error(JSON.stringify(e)) });
        resolve(undefined)
    })
}