import mongoose, { Document } from 'mongoose';
import { IVehicle } from '../types';
export interface IVehicleDocument extends IVehicle, Document {
}
declare const _default: mongoose.Model<IVehicleDocument, {}, {}, {}, mongoose.Document<unknown, {}, IVehicleDocument, {}, {}> & IVehicleDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Vehicle.d.ts.map