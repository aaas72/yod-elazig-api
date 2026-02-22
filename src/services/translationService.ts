import { Translation } from '../models';
import { ITranslation } from '../models/Translation';
import { ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';

type Lang = 'ar' | 'en' | 'tr';

class TranslationService {
  async getByLang(lang: Lang): Promise<Record<string, Record<string, string>>> {
    const translations = await Translation.find({ lang });
    const result: Record<string, Record<string, string>> = {};
    for (const t of translations) {
      if (!result[t.namespace]) result[t.namespace] = {};
      result[t.namespace][t.key] = t.value;
    }
    return result;
  }

  async getByNamespace(lang: Lang, namespace: string): Promise<Record<string, string>> {
    const translations = await Translation.find({ lang, namespace });
    const result: Record<string, string> = {};
    for (const t of translations) {
      result[t.key] = t.value;
    }
    return result;
  }

  async upsert(lang: Lang, namespace: string, key: string, value: string): Promise<ITranslation> {
    const translation = await Translation.findOneAndUpdate(
      { lang, namespace, key },
      { value },
      { new: true, upsert: true, runValidators: true },
    );
    return translation!;
  }

  async bulkUpsert(
    lang: Lang,
    namespace: string,
    translations: Record<string, string>,
  ): Promise<void> {
    const ops = Object.entries(translations).map(([key, value]) => ({
      updateOne: {
        filter: { lang, namespace, key },
        update: { $set: { value } },
        upsert: true,
      },
    }));
    await Translation.bulkWrite(ops);
  }

  async delete(lang: Lang, namespace: string, key: string): Promise<void> {
    const result = await Translation.deleteOne({ lang, namespace, key });
    if (result.deletedCount === 0)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Translation not found');
  }

  async deleteNamespace(lang: Lang, namespace: string): Promise<void> {
    await Translation.deleteMany({ lang, namespace });
  }
}

export default new TranslationService();
