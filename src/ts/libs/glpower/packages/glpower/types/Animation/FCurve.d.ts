import { FCurveKeyFrame } from './FCurveKeyFrame';
import { EventEmitter } from '../utils/EventEmitter';
export declare class FCurve extends EventEmitter {
    keyframes: FCurveKeyFrame[];
    private cache;
    frameStart: number;
    frameEnd: number;
    frameDuration: number;
    constructor(frames?: FCurveKeyFrame[]);
    set(frames?: FCurveKeyFrame[]): void;
    addKeyFrame(keyframe: FCurveKeyFrame): void;
    getValue(frame: number): number;
}
//# sourceMappingURL=FCurve.d.ts.map