import { Request, Response } from 'express';
import { translationService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

type Lang = 'ar' | 'en' | 'tr';
const VALID_LANGS: Lang[] = ['ar', 'en', 'tr'];

export const getTranslations = asyncHandler(async (req: Request, res: Response) => {
  const lang = req.params.lang as Lang;
  if (!VALID_LANGS.includes(lang)) {
    return new ApiResponse(HTTP_STATUS.BAD_REQUEST, 'Invalid language. Use: ar, en, tr').send(res);
  }
  const translations = await translationService.getByLang(lang);
  return new ApiResponse(HTTP_STATUS.OK, 'Translations retrieved', { translations }).send(res);
});

export const getTranslationsByNamespace = asyncHandler(async (req: Request, res: Response) => {
  const lang = req.params.lang as Lang;
  const { namespace } = req.params;
  if (!VALID_LANGS.includes(lang)) {
    return new ApiResponse(HTTP_STATUS.BAD_REQUEST, 'Invalid language').send(res);
  }
  const translations = await translationService.getByNamespace(lang, namespace as string);
  return new ApiResponse(HTTP_STATUS.OK, 'Translations retrieved', { translations }).send(res);
});

export const upsertTranslation = asyncHandler(async (req: Request, res: Response) => {
  const { lang, namespace, key, value } = req.body;
  const translation = await translationService.upsert(lang, namespace, key, value);
  return new ApiResponse(HTTP_STATUS.OK, 'Translation saved', { translation }).send(res);
});

export const bulkUpsertTranslations = asyncHandler(async (req: Request, res: Response) => {
  const { lang, namespace, translations } = req.body;
  await translationService.bulkUpsert(lang, namespace, translations);
  return new ApiResponse(HTTP_STATUS.OK, 'Translations saved').send(res);
});

export const deleteTranslation = asyncHandler(async (req: Request, res: Response) => {
  const { lang, namespace, key } = req.params;
  await translationService.delete(lang as Lang, namespace as string, key as string);
  return new ApiResponse(HTTP_STATUS.OK, 'Translation deleted').send(res);
});
