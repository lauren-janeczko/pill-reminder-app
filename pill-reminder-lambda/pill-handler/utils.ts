import pg, { QueryResult, QueryResultRow } from 'pg';
import process from 'process';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';
dotenv.config();

export const db = new pg.Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE ,
    password: process.env.PGPASSWORD ,
    port: parseInt(process.env.PGPORT ?? "5432"),
});

export type PromiseOrError<T> = Promise<T | ResponseError>;
export interface ResponseError {
    err: object | string;
    statusCode: number;
}

export function required(...values: any[]): boolean {
    if (!values) return false;
    if (values.some((val) => !val)) return false;
    return true
}

export function error(msg: object | string, code?: number): ResponseError {
    return {
        statusCode: code ?? 500,
        err: msg,
    };
}

export async function dbQuery<T>(query: string, args: any[]): Promise<QueryResult<T & QueryResultRow>> {
    try {
      return await db.query<T & QueryResultRow>(query, args);
    } catch (e) {
      throw new Error(`Query error: ${JSON.stringify(e)}`);
    }
}


export async function generateNewId(): Promise<string> {
    const timestamp = Date.now(); 
    const randomSuffix = Math.floor(Math.random() * 10000);
    const id = `${timestamp}-${randomSuffix}`; 
    return id;
}

export function generateToken(): string {
    const token = "SS"+randomUUID()
    return token
}