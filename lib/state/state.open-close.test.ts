import CircuitStateOpenClose from "./state.open-close";
import {ApplicationSettings} from "../settings";
import CircuitStateContext from "./state.context";

// @ts-ignore
import lolex from "lolex";

jest.mock('./state.context');

describe('State OPEN-CLOSE', () => {
    const settings = new ApplicationSettings();
    let circuitStateContext: jest.Mocked<CircuitStateContext>;
    let clock: lolex;

    beforeEach(() => {
        circuitStateContext = new CircuitStateContext(settings) as any;
        clock = lolex.install()
    });

    afterEach(() => {
        clock = clock.uninstall();
    });

    test('should execute trial action and set state as closed after success', async () => {
        // given
        const state = new CircuitStateOpenClose(circuitStateContext, settings);
        const resolveFn = jest.fn();
        circuitStateContext.shiftActionQueue.mockReturnValue({
            action: Promise.resolve(),
            reject: () => Promise.reject(),
            resolve: resolveFn
        });

        // when
        await state.execute();

        // then
        expect(circuitStateContext.shiftActionQueue).toHaveBeenCalled();
        expect(circuitStateContext.setClose).toHaveBeenCalled();
        expect(resolveFn).toHaveBeenCalled();
    });

    test('should do nothing when actions queue is empty', async () => {
        // given
        const state = new CircuitStateOpenClose(circuitStateContext, settings);
        circuitStateContext.shiftActionQueue.mockReturnValue(undefined);

        // when
        await state.execute();

        // then
        expect(circuitStateContext.shiftActionQueue).toHaveBeenCalled();
        expect(circuitStateContext.setClose).not.toHaveBeenCalled();
        expect(circuitStateContext.setOpen).not.toHaveBeenCalled();
    });

    test('should execute only one action during state', async () => {
        // given
        const state = new CircuitStateOpenClose(circuitStateContext, settings);
        const resolveFn = jest.fn();
        circuitStateContext.shiftActionQueue.mockReturnValue({
            action: Promise.resolve(),
            reject: () => Promise.reject(),
            resolve: resolveFn
        });

        // when
        await Promise.all([state.execute(), state.execute()]);

        // then
        expect(circuitStateContext.shiftActionQueue).toHaveBeenCalledTimes(1);
        expect(resolveFn).toHaveBeenCalled();
    });

    test('should set state as open after rejection', async () => {
        // given
        const state = new CircuitStateOpenClose(circuitStateContext, settings);
        const rejectFn = jest.fn();
        circuitStateContext.shiftActionQueue.mockReturnValue({
            action: Promise.reject(),
            reject: rejectFn,
            resolve: () => Promise.resolve()
        });

        // when
        await state.execute();

        // then
        expect(circuitStateContext.setOpen).toHaveBeenCalled();
        expect(rejectFn).toHaveBeenCalled();
    });

    test('should set state as open after timeout', async () => {
        // given
        const state = new CircuitStateOpenClose(circuitStateContext, settings);
        const rejectFn = jest.fn();
        const resolveFn = jest.fn();
        circuitStateContext.shiftActionQueue.mockReturnValue({
            action: Promise.resolve(),
            reject: rejectFn,
            resolve: resolveFn
        });

        // when
        await new Promise((resolve) => {
            const exec = state.execute();
            clock.tick(settings.timeout);
            resolve(exec);
        });

        // then
        expect(circuitStateContext.setOpen).toHaveBeenCalled();
        expect(resolveFn).toHaveBeenCalled();
        expect(rejectFn).not.toHaveBeenCalled();
    });
});
