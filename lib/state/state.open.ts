import { ApplicationSettings } from "../settings";
import CircuitStateContext from "./state.context";

export default class CircuitStateOpen implements CircuitState {
    private context: CircuitStateContext;
    private settings: ApplicationSettings;

    constructor(context: CircuitStateContext, settings: ApplicationSettings) {
        this.context = context;
        this.settings = settings;

        this.resetTimer();
    }

    execute(): Promise<unknown> {
        return Promise.resolve();
    }

    private resetTimer() {
        setTimeout(() => {
            this.context.setOpenClose();
        }, this.settings.resetTime);
    }
}
