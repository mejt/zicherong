import { ActionsQueue } from "../actionsQueue";
import { ApplicationSettings } from "../settings";

import CircuitStateClose from "./state.close";
import CircuitStateOpen from "./state.open";
import CircuitStateOpenClose from "./state.open-close";

export default class CircuitStateContext {
    private state: CircuitState;
    private actionsQueue: Array<ActionsQueue>;
    private readonly settings: ApplicationSettings;

    constructor(settings: ApplicationSettings) {
        this.state = new CircuitStateClose(this, settings);
        this.actionsQueue = [];
        this.settings = settings;
    }

    public setOpen(): void {
        this.state = new CircuitStateOpen(this, this.settings);
    }

    public setClose(): void {
        this.state = new CircuitStateClose(this, this.settings);
    }

    public setOpenClose() {
        this.state = new CircuitStateOpenClose(this, this.settings);
    }

    public shiftActionQueue(): ActionsQueue | undefined {
        return this.actionsQueue.shift();
    }

    public execute(action: Promise<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            this.actionsQueue.push({
                resolve,
                reject,
                action
            });

            return this.state.execute();
        });
    }
}