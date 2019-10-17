import { ApplicationSettings } from "../settings";
import CircuitStateContext from "./state.context";

export default class CircuitStateOpenClose implements CircuitState {
    private context: CircuitStateContext;
    private settings: ApplicationSettings;
    private inProgress: boolean;

    constructor(context: CircuitStateContext, settings: ApplicationSettings) {
        this.context = context;
        this.settings = settings;
        this.inProgress = false;
    }

    async execute(): Promise<unknown> {
        if (this.inProgress) {
            return Promise.resolve();
        }

        const queuedAction = this.context.shiftActionQueue();
        if (queuedAction) {
            const { resolve, reject, action } = queuedAction;
            this.inProgress = true;

            try {
                const result = await this.trialExecution(action);
                resolve(result);
            } catch (error) {
                this.context.setOpen();
                reject(error);
            }
        }

        return Promise.resolve();
    }

    private async trialExecution(action: Promise<unknown>): Promise<unknown> {
        const startTime = new Date().getTime();

        const result = await action;

        const endTime = new Date().getTime();
        if (endTime - startTime >= this.settings.timeout) {
            this.context.setOpen();
        } else {
            this.context.setClose();
        }

        return result;
    }
}
