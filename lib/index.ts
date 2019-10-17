import { ApplicationSettings, Settings } from "./settings";
import CircuitStateContext from "./state/state.context";

export default class Zicherong {
    private readonly settings: ApplicationSettings;
    private stateContext: CircuitStateContext;

    constructor(settings?: Settings) {
        this.settings = new ApplicationSettings(settings);
        this.stateContext = new CircuitStateContext(this.settings);
    }

    public call(action: Promise<any>): Promise<any> {
        return this.stateContext.execute(action);
    }
}
