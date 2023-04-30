import { Types, Vector } from '..';
import { FCurve } from './FCurve';
import { EventEmitter } from '../utils/EventEmitter';
export declare class FCurveGroup extends EventEmitter {
    name: string;
    private curves;
    frameStart: number;
    frameEnd: number;
    frameDuration: number;
    private updatedFrame;
    value: Vector;
    constructor(name?: string, x?: FCurve, y?: FCurve, z?: FCurve, w?: FCurve);
    setFCurve(curve: FCurve, axis: Types.RecommendString<Types.Axis>): void;
    getFCurve(axis: Types.RecommendString<Types.Axis>): FCurve | null;
    setFrame(frame: number): this;
}
//# sourceMappingURL=FCurveGroup.d.ts.map