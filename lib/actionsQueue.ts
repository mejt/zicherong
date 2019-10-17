export interface ActionsQueue {
    resolve: (value?: any) => any,
    reject: (value? : any) => any,
    action: Promise<any>
}
