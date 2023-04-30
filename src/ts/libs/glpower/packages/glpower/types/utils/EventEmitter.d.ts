declare type ListenerFunction = Function;
export declare class EventEmitter {
    private listeners;
    constructor();
    on(event: string, cb: ListenerFunction): void;
    once(event: string, cb: ListenerFunction): void;
    off(event: string, cb: ListenerFunction): void;
    emit(event: string, args?: any[]): void;
}
export {};
//# sourceMappingURL=EventEmitter.d.ts.map