import CircuitStateClose from './state.close';
import CircuitStateOpen from './state.open';
import CircuitStateOpenClose from "./state.open-close";
import CircuitStateContext from "./state.context";
import { ApplicationSettings } from "../settings";

jest.mock('./state.close');
jest.mock('./state.open-close');
jest.mock('./state.open');

describe('State Context', () => {
    const settings = new ApplicationSettings();

    beforeEach(() => {
        // @ts-ignore
        CircuitStateOpenClose.prototype.execute.mockClear();
        // @ts-ignore
        CircuitStateClose.prototype.execute.mockClear();
        // @ts-ignore
        CircuitStateOpen.prototype.execute.mockClear();
    });

    test('should has close state after creation', async () => {
        // given
        const circuitStateContext = new CircuitStateContext(settings);

        // when
        circuitStateContext.execute(Promise.resolve());
        const action = circuitStateContext.shiftActionQueue();
        action && action.resolve();

        // then
        expect(CircuitStateClose.prototype.execute).toHaveBeenCalled();
        expect(CircuitStateOpenClose.prototype.execute).not.toHaveBeenCalled();
        expect(CircuitStateOpen.prototype.execute).not.toHaveBeenCalled();
    });

    test('should has open state after change to open', async () => {
        // given
        const circuitStateContext = new CircuitStateContext(settings);

        // when
        circuitStateContext.setOpen();
        circuitStateContext.execute(Promise.resolve());
        const action = circuitStateContext.shiftActionQueue();
        action && action.resolve();

        // then
        expect(CircuitStateClose.prototype.execute).not.toHaveBeenCalled();
        expect(CircuitStateOpenClose.prototype.execute).not.toHaveBeenCalled();
        expect(CircuitStateOpen.prototype.execute).toHaveBeenCalled();
    });

    test('should has open-close state after change to open-close', async () => {
        // given
        const circuitStateContext = new CircuitStateContext(settings);

        // when
        circuitStateContext.setOpenClose();
        circuitStateContext.execute(Promise.resolve());
        const action = circuitStateContext.shiftActionQueue();
        action && action.resolve();

        // then
        expect(CircuitStateClose.prototype.execute).not.toHaveBeenCalled();
        expect(CircuitStateOpenClose.prototype.execute).toHaveBeenCalled();
        expect(CircuitStateOpen.prototype.execute).not.toHaveBeenCalled();
    });

    test('should has close state after back to close', async () => {
        // given
        const circuitStateContext = new CircuitStateContext(settings);
        circuitStateContext.setOpenClose();

        // when
        circuitStateContext.setClose();
        circuitStateContext.execute(Promise.resolve());
        const action = circuitStateContext.shiftActionQueue();
        action && action.resolve();

        // then
        expect(CircuitStateClose.prototype.execute).toHaveBeenCalled();
        expect(CircuitStateOpenClose.prototype.execute).not.toHaveBeenCalled();
        expect(CircuitStateOpen.prototype.execute).not.toHaveBeenCalled();
    });
});
