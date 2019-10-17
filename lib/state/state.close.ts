import Rate from "../rate";
import { ApplicationSettings } from "../settings";
import CircuitStateContext from "./state.context";

export default class CircuitStateClose implements CircuitState {
    private rate: Rate;
    private settings: ApplicationSettings;
    private context: CircuitStateContext;

    constructor(context: CircuitStateContext, settings: ApplicationSettings) {
        this.rate = new Rate();
        this.settings = settings;
        this.context = context;
    }

    async execute(): Promise<any> {
        const queuedAction = this.context.shiftActionQueue();

        if (!queuedAction) {
            return Promise.resolve();
        }

        const { action, resolve, reject } = queuedAction;
        this.rate.addCall();

        try {
            const startTime = Date.now();
            const result = await action;
            this.onExecutionSuccess(startTime);

            resolve(result);
        } catch (error) {
            this.onExecutionError();
            reject(error);
        }
    }

    private onExecutionSuccess(startTime: number) {
        const endTime = Date.now();
        if (endTime - startTime >= this.settings.timeout) {
            this.onExecutionError();
        }
    }

    private onExecutionError() {
        this.rate.addError();
        this.checkErrorsRate();
    }

    private checkErrorsRate() {
        if (this.rate.getErrorsRate() >= this.settings.errorThreshold) {
            this.rate.stop();
            this.context.setOpen();
        }
    }
}
