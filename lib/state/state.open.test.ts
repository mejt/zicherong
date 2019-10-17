import CircuitStateContext from "./state.context";
import { ApplicationSettings } from "../settings";
import CircuitStateOpen from "./state.open";

// @ts-ignore
import lolex from "lolex";
jest.mock('./state.context');

describe('State OPEN', () => {
    const settings = new ApplicationSettings();
    let circuitStateContext: jest.Mocked<CircuitStateContext>;
    let clock: lolex;

    beforeEach(() => {
        circuitStateContext = new CircuitStateContext(settings) as any;
        clock = lolex.install()
    });

    test('should not execute any queued action when state is open', async () => {
        // given
        const state = new CircuitStateOpen(circuitStateContext, settings);

        // when
        await state.execute();

        // then
        expect(circuitStateContext.shiftActionQueue).not.toHaveBeenCalled();
    });

    test('should change state to open-close after timeout', async () => {
        // given
        new CircuitStateOpen(circuitStateContext, settings);

        // when
        clock.tick(settings.resetTime);

        // then
        expect(circuitStateContext.setOpenClose).toHaveBeenCalled();
    });
});
