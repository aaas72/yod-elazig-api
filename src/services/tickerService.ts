import { FilterQuery } from 'mongoose';
import { Ticker } from '../models';
import { ITicker } from '../models/Ticker';
import { ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';

class TickerService {
  async create(data: Partial<ITicker>): Promise<ITicker> {
    return Ticker.create(data);
  }

  async getAll(): Promise<ITicker[]> {
    return Ticker.find().sort('order');
  }

  async getActive(): Promise<ITicker[]> {
    const now = new Date();
    const filter: FilterQuery<ITicker> = {
      isActive: true,
      $or: [
        { startDate: { $exists: false }, endDate: { $exists: false } },
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } },
      ],
    };
    return Ticker.find(filter).sort('order');
  }

  async getById(id: string): Promise<ITicker> {
    const item = await Ticker.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Ticker item not found');
    return item;
  }

  async update(id: string, data: Partial<ITicker>): Promise<ITicker> {
    const item = await Ticker.findById(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Ticker item not found');
    Object.assign(item, data);
    await item.save();
    return item;
  }

  async delete(id: string): Promise<void> {
    const item = await Ticker.findByIdAndDelete(id);
    if (!item) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Ticker item not found');
  }

  async bulkUpdate(items: { id: string; data: Partial<ITicker> }[]): Promise<ITicker[]> {
    const ops = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: item.data },
      },
    }));
    await Ticker.bulkWrite(ops);
    return this.getAll();
  }
}

export default new TickerService();
