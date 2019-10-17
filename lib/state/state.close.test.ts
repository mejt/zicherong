import CircuitStateContext from "./state.context";
import CircuitStateClose from './state.close';
import { ApplicationSettings } from "../settings";
import Rate from "../rate";

// @ts-ignore
import lolex from "lolex";

jest.mock('./../rate');
jest.mock('./state.context');

describe('State CLOSE', () => {
    const settings = new ApplicationSettings();
    let circuitStateContext: jest.Mocked<CircuitStateContext>;
    let clock: lolex;

    beforeEach(() => {
        circuitStateContext = new CircuitStateContext(settings) as any;
        // @ts-ignore
        Rate.prototype.addError.mockClear();

        clock = lolex.install()
    });

    afterEach(() => {
        clock = clock.uninstall();
    });

    test('should do nothing when queue of calls is empty', async () => {
        // given
        const state = new CircuitStateClose(circuitStateContext, settings);

        // when
        await state.execute();

        // then
        expect(circuitStateContext.shiftActionQueue).toHaveBeenCalled();
        expect(Rate.prototype.addCall).not.toHaveBeenCalled();
    });

    test('when action was queued then increase calls counter', async () => {
        // given
        const state = new CircuitStateClose(circuitStateContext, settings);
        circuitStateContext.shiftActionQueue.mockReturnValue({
            action: Promise.resolve(),
            reject: () => Promise.reject(),
            resolve: () => Promise.resolve()
        });

        // when
        await state.execute();

        // then
        expect(Rate.prototype.addCall).toHaveBeenCalled();
    });

    test('should resolve function after success', async () => {
        // given
        const state = new CircuitStateClose(circuitStateContext, settings);
        const resolverMock = jest.fn();
        const rejectMock = jest.fn();

        circuitStateContext.shiftActionQueue.mockReturnValue({
            action: Promise.resolve(),
            reject: rejectMock,
            resolve: resolverMock
        });

        // when
        await state.execute();

        // then
        expect(resolverMock).toHaveBeenCalled();
        expect(rejectMock).not.toHaveBeenCalled();
    });

    test('should reject function after fail', async () => {
        // given
        const state = new CircuitStateClose(circuitStateContext, settings);
        const rejectMock = jest.fn();
        const resolverMock = jest.fn();

        circuitStateContext.shiftActionQueue.mockReturnValue({
            action: Promise.reject(),
            reject: rejectMock,
            resolve: resolverMock
        });

        // when
        await state.execute();

        // then
        expect(rejectMock).toHaveBeenCalled();
        expect(Rate.prototype.addError).toHaveBeenCalled();
        expect(resolverMock).not.toHaveBeenCalled();
    });

    test('should assign as failed too long call and resolve original result', async () => {
        // given
        const state = new CircuitStateClose(circuitStateContext, settings);
        const rejectMock = jest.fn();
        const resolverMock = jest.fn();

        circuitStateContext.shiftActionQueue.mockReturnValue({
            action: Promise.resolve(),
            reject: rejectMock,
            resolve: resolverMock
        });

        // when
        await new Promise((resolve) => {
            const exec = state.execute();
            clock.tick(settings.timeout);
            resolve(exec);
        });

        // then
        expect(resolverMock).toHaveBeenCalled();
        expect(Rate.prototype.addError).toHaveBeenCalled();
        expect(rejectMock).not.toHaveBeenCalled();
    });

    test('should set status as open when error rate was exceeded', async () => {
        // given
        const state = new CircuitStateClose(circuitStateContext, settings);
        // @ts-ignore
        Rate.prototype.getErrorsRate.mockReturnValue(settings.errorThreshold);
        circuitStateContext.shiftActionQueue.mockReturnValue({
            action: Promise.reject(),
            reject: jest.fn(),
            resolve: () => Promise.resolve()
        });

        // when
        await state.execute();

        // then
        expect(circuitStateContext.setOpen).toHaveBeenCalled();
    });
});
