import Rate from "./rate";
import { RATE_TIMER, RATE_WINDOW_SIZE } from "./rate";

// @ts-ignore
import lolex from "lolex";

describe('Rate', () => {
    let clock: lolex;

    beforeEach(() => {
        clock = lolex.install()
    });

    afterEach(() => {
        clock = clock.uninstall();
    });

    test('should return 0 when registry is not filled', () => {
        // given
        const rate = new Rate();

        // when
        rate.addCall();
        rate.addError();

        // then
        expect(rate.getErrorsRate()).toBe(0);
    });

    test('should calculate correct error rate', () => {
        // given
        const rate = new Rate();

        // when
        rate.addCall();
        rate.addCall();
        rate.addError();
        clock.tick(RATE_TIMER);

        // then
        expect(rate.getErrorsRate()).toBe(50);
    });

    test('should calculate correct error rate between registry fields', () => {
        // given
        const rate = new Rate();

        // when
        rate.addCall();
        rate.addError();
        clock.tick(RATE_TIMER);

        rate.addCall();
        clock.tick(RATE_TIMER);

        rate.addCall();
        clock.tick(RATE_TIMER);

        rate.addCall();
        rate.addCall();
        rate.addCall();
        clock.tick(RATE_TIMER);

        rate.addCall();
        rate.addError();
        clock.tick(RATE_TIMER);

        // then
        expect(rate.getErrorsRate()).toBe(40);
    });

    test('should set in registry value 0 when no calls occured', () => {
        // given
        const rate = new Rate();

        // when
        clock.tick(RATE_TIMER);

        // then
        expect(rate.getErrorsRate()).toBe(0);
    });

    test('should stop registry timer', () => {
        // given
        const rate = new Rate();
        rate.addCall();
        rate.addCall();
        rate.addError();
        clock.tick(RATE_TIMER);

        // when
        rate.stop();
        rate.addCall();
        rate.addError();
        clock.tick(RATE_TIMER);

        // then
        expect(rate.getErrorsRate()).toBe(50);
    });

    test('should correctly remove old registry fields', () => {
        // given
        const rate = new Rate();
        rate.addCall();
        clock.tick(RATE_TIMER);

        // when
        for (let i = 0; i < RATE_WINDOW_SIZE; i++) {
            rate.addCall();
            rate.addError();
            clock.tick(RATE_TIMER);
        }

        // then
        expect(rate.getErrorsRate()).toBe(100);
    });
});
