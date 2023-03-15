import { dbQuery, error, PromiseOrError, generateNewId, required } from '../utils';
import { ScheduleFrequency, ScheduleSchema } from '../schemas/schedule.schema';

export type AddScheduleData = Omit<ScheduleSchema, "id">;
export type AddScheduleResponse = Omit<ScheduleSchema, "user_id">

export function addSchedule(data: AddScheduleData): PromiseOrError<AddScheduleResponse> {
    const {
        user_id,
        pill_name,
        dosage,
        time,
        frequency,
        custom_frequency: custom_frequency
    } = data;

  
    return new Promise(async (resolve) => {
        if (!required(user_id, pill_name, dosage, time, frequency)) {
            resolve(error("Required arguments are missing", 200));
        }
        if  (frequency === ScheduleFrequency.Custom) {
            if (!custom_frequency) resolve(error("Custom frequency must not be empty", 200));
        }

        const hrs = typeof time.hours === 'number' ? time.hours : parseInt(time.hours)
        const mins = typeof time.minutes === 'number' ? time.minutes : parseInt(time.minutes)
        if (hrs > 23 || mins > 59 || hrs < 0 || mins < 0) {
            resolve(error(`Time in invalid: {h:${hrs},m:${mins}}`, 200));
        }
        const hours = hrs < 10 ? "0"+hrs : hrs;
        const minutes = mins < 10 ? "0"+mins : mins;
        const timeString = `${hours}:${minutes}`;

        const id = await generateNewId();

        const result = frequency === ScheduleFrequency.Custom ?
            await dbQuery<ScheduleSchema>(
                "INSERT INTO schedules (id, user_id, pill_name, dosage, time, frequency, custom_frequency) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
                [id, user_id, pill_name, dosage, timeString, frequency, custom_frequency]
            )
                :
            await dbQuery<ScheduleSchema>(
                "INSERT INTO schedules (id, user_id, pill_name, dosage, time, frequency) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
                [id, user_id, pill_name, dosage, timeString, frequency]
            )

        if (result.rows) {
            const newSchedule: AddScheduleResponse = {
                id: result.rows[0].id,
                pill_name: result.rows[0].pill_name,
                dosage: result.rows[0].dosage,
                frequency: result.rows[0].frequency,
                time: result.rows[0].time,
                custom_frequency: result.rows[0].custom_frequency,
            }
            resolve(newSchedule);
        } else {
            resolve(error("Adding new schedule failed", 200))
        }        
    });
}

export type GetSchedulesData = Pick<ScheduleSchema, "user_id">;
export type GetSchedulesResponse = Omit<ScheduleSchema, "user_id">

export function getSchedules(data: GetSchedulesData): PromiseOrError<GetSchedulesResponse[]> {
    const {user_id} = data;
  
    return new Promise(async (resolve) => {
        const result = await dbQuery<ScheduleSchema[]>(
            'SELECT * FROM schedules WHERE user_id = $1',
            [user_id]
        );

        if (result) {
            const retrievedSchedule: GetSchedulesResponse[] = [];
            result.rows.forEach(schedule => {
                const newSchedule: GetSchedulesResponse = {
                    id: schedule.id,
                    pill_name: schedule.pill_name,
                    dosage: schedule.dosage,
                    frequency: schedule.frequency,
                    time: schedule.time,
                    custom_frequency: schedule.custom_frequency,
                }
                retrievedSchedule.push(newSchedule); 
            }); 
            resolve(retrievedSchedule);
        } else {
            throw new Error(JSON.stringify(
                result
            ));
        }     
    });
}

export type DeleteScheduleData = Pick<ScheduleSchema, "id">;
export interface DeleteScheduleResponse {
    data: string,
}

export function deleteSchedule(data: DeleteScheduleData): PromiseOrError<DeleteScheduleResponse>  { 
    const {id} = data;

    return new Promise(async (resolve) => {
        const result = await dbQuery<ScheduleSchema>(
            'DELETE FROM schedules WHERE id = $1 RETURNING *',
            [id]
        );
        if (!result.rows[0]) resolve(error("Delete failed", 200))
    
        const message = { data: `deleted successfully.` }
        resolve(message);
    })
}
