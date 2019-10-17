export interface Settings {
    timeout?: number;
    resetTime?: number;
    errorThreshold?: number;
}

export class ApplicationSettings {
    public timeout: number;
    public resetTime: number;
    public errorThreshold: number;

    constructor(settings?: Settings) {
        this.timeout = settings && settings.timeout || 3000;
        this.resetTime = settings && settings.resetTime || 30000;
        this.errorThreshold = settings && settings.errorThreshold || 65;
    }
}
