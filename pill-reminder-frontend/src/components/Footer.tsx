import { Component } from "solid-js"
import styles from "./Footer.module.css"

type FooterProps = {}

export const Footer: Component<FooterProps> = (props) => {
    return (
        <footer class={styles.Footer}>
            <div>Copyright @ Lauren Janeczko</div>
        </footer>
    )
}