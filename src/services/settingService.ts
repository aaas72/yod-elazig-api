import { Setting } from '../models';
import { ISetting } from '../models/Setting';

class SettingService {
  async get(): Promise<ISetting> {
    let settings = await Setting.findOne({ key: 'general' }).populate('lastUpdatedBy', 'name email');
    if (!settings) {
      settings = await Setting.create({ key: 'general' });
    }
    return settings;
  }

  async update(data: Partial<ISetting>, userId: string): Promise<ISetting> {
    const settings = await Setting.findOneAndUpdate(
      { key: 'general' },
      { ...data, lastUpdatedBy: userId },
      { new: true, upsert: true, runValidators: true },
    ).populate('lastUpdatedBy', 'name email');
    return settings!;
  }
}

export default new SettingService();
