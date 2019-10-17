export const RATE_WINDOW_SIZE: number = 30;
export const RATE_TIMER: number = 1000;

export default class Rate {
    private calls: number = 0;
    private errors: number = 0;
    private readonly registry: Array<number>;
    private readonly timerId: NodeJS.Timeout;

    constructor() {
        this.registry = [];
        this.timerId = this.timer();
    }

    private timer(): NodeJS.Timeout {
        return setInterval(() => {
            const rate = this.calls > 0 ? this.errors / this.calls : 0;
            this.registry.push(rate);

            if (this.registry.length > RATE_WINDOW_SIZE) {
                this.registry.shift();
            }

            this.calls = 0;
            this.errors = 0;
        }, RATE_TIMER);
    }

    public stop(): void {
        clearInterval(this.timerId);
    }

    public addCall(): void {
        this.calls++;
    }

    public addError(): void {
        this.errors++;
    }

    public getErrorsRate(): number {
        if (this.registry.length === 0) return 0;
        return this.registry.reduce((sum, current) => sum + current, 0) / this.registry.length * 100;
    }
}
