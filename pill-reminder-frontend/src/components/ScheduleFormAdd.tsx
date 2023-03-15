import { Component, createEffect, For } from "solid-js"
import { createStore } from "solid-js/store"
import { AddScheduleData } from "../api/scheduleHandler"
import { ScheduleFrequency } from "../api/schemas/schedule.schema"
import styles from "./ScheduleFormAdd.module.css"

type ScheduleFormAddProps = {
    addShedule: (data: AddScheduleData) => Promise<void>
}

export const ScheduleFormAdd: Component<ScheduleFormAddProps> = (props) => {
    const [newSchedule, setNewSchedule] = createStore<AddScheduleData>({
        pill_name: "",
        dosage: "0",
        frequency: ScheduleFrequency.EveryDay,
        time: {
            hours: 0,
            minutes: 0
        },
    })

    const updateTime = (e: any) => {
        const timeArr = e.target.value.split(":");
        setNewSchedule("time", "hours", parseInt(timeArr[0]))
        setNewSchedule("time", "minutes", parseInt(timeArr[1]))
        console.info("Time is: ", timeArr)
    }

    createEffect(() => {
        // console.info("Updated schedules!");
    })

    return (
        <div class={styles.Viewer}>
            <h1>Create New Schedule</h1>

            <form>
                <input type="text" placeholder="Pill Name" value={newSchedule.pill_name} oninput={(e: any) => setNewSchedule("pill_name", e.target.value)}/>
                <input type="number" placeholder="Dosage" value={newSchedule.dosage} oninput={(e: any) => setNewSchedule("dosage", e.target.value)}/>
                {/* <input type="time" placeholder="Pill Name" value={newSchedule.pillName} oninput={(e: any) => setNewSchedule("pillName", e.target.value)}/> */}

                <select value={newSchedule.frequency} onchange={(e: any) => setNewSchedule("frequency", e.target.value)}>
                    <option>Every day</option>
                    <option>Every other day</option>
                    <option>Every week</option>
                    <option>Custom</option>
                </select>

                <label>Time</label>
                <input type="time" placeholder="time" value="13:00" onchange={updateTime}/>
                {/* <input type="text" placeholder="Pill Name" value={newSchedule.pillName} oninput={(e: any) => setNewSchedule("pillName", e.target.value)}/> */}
            </form>
            <button onclick={async() => props.addShedule(newSchedule)} style={{padding: "1em 0em"}}>Create Schedule</button>
        </div>
    )
}