import { Component, createEffect, createSignal, For, onMount } from "solid-js"
import { createStore } from "solid-js/store"
import { AddScheduleData, AddScheduleResponse, GetSchedulesResponse, handleSchedule } from "../api/scheduleHandler"
import { ScheduleSchema } from "../api/schemas/schedule.schema"
import { ScheduleFormAdd } from "./ScheduleFormAdd"
import styles from "./SchedulesViewer.module.css"


const tableFields = ["Pill Name", "Dosage", "Frequency", "Time", "Actions"]

type SchedulesViewerProps = {}

export const SchedulesViewer: Component<SchedulesViewerProps> = (props) => {
    const [schedules, setSchedules] = createSignal<AddScheduleResponse[]>([])

    const fetchSchedules = async() => {
        const userId = localStorage.getItem("user_id") ?? ""
        const result = await handleSchedule("get-schedules", { user_id: userId })

        
        if (result.err) {
            return
        }

        if (result.length === 0) { 
            console.warn("No schedules fetched")
        }
        
        setSchedules(() => result)
    }

    const deleteSchedule = async(id: string) => {
        const result = await handleSchedule("delete-schedule", { id })
        if (result && !result.err) {
            console.info("Deleting successful", result)
            setSchedules((schedules) => schedules.filter(s => s.id !== id))
        }
    }

    const addSchedule = async(data: AddScheduleData) => {
        const result = await handleSchedule("create-schedule", data)
        if (result && !result.err) {
            console.info("Added new Schedule", result)
            setSchedules((s) => [...s, result])
        }
    }

    createEffect(() => {
        console.info("Updated schedules!", schedules());
    })

    onMount(async() => {
        await fetchSchedules()
    })

    return (
        <div class={styles.Viewer}>
            <h1>Your Schedules</h1>
            <button onclick={fetchSchedules} style={{padding: "1em 0em"}}>Fetch Schedules</button>

            <div>
                <ScheduleFormAdd addShedule={addSchedule}/>
            </div>

            <table>
                <thead>
                    <tr>
                        {tableFields.map((field) => <th>{field}</th>)}
                    </tr>
                </thead>

                <tbody>
                    <For each={schedules()}>
                        {(schedule) => (
                            <tr>
                                <td>{schedule.pill_name}</td>
                                <td>{schedule.dosage}mg</td>
                                <td>{schedule.frequency}</td>
                                <td>{schedule.time}</td>
                                <td>
                                    {/* Actions */}
                                    <button onclick={() => deleteSchedule(schedule.id)}>Delete</button>
                                </td>
                            </tr>
                        )}
                    </For>
                </tbody>
            </table>
        </div>
    )
}