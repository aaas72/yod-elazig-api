import mongoose, { FilterQuery } from 'mongoose';
import { Album } from '../models';
import { IAlbum, IPhoto } from '../models/Album';
import { ApiError, createSlug } from '../utils';
import { HTTP_STATUS } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  isPublished?: boolean;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

class GalleryService {
  /* ── Album CRUD ─────────────────────────────────── */
  async createAlbum(data: Partial<IAlbum>): Promise<IAlbum> {
    return Album.create(data);
  }

  async getAllAlbums(options: PaginationOptions): Promise<PaginatedResult<IAlbum>> {
    const { page = 1, limit = 10, sort = 'order', category, isPublished } = options;
    const filter: FilterQuery<IAlbum> = {};
    if (category) filter.category = category;
    if (isPublished !== undefined) filter.isPublished = isPublished;

    const limitNum = limit ? Number(limit) : 10;
    const pageNum = page ? Number(page) : 1;
    const skip = (pageNum - 1) * limitNum;

    const total = await Album.countDocuments(filter);
    const data = await Album.find(filter).sort(sort).skip(skip).limit(limitNum);

    // إرجاع فقط اسم الملف بدون أي مسار أو baseUrl
    const albums = data.map(album => {
      const a = album.toObject();
      if (a.coverImage) {
        a.coverImage = a.coverImage ? a.coverImage.split('/').pop() || '' : '';
      }
      if (a.photos && Array.isArray(a.photos)) {
        a.photos = a.photos.map((p: IPhoto) => {
          const url = p.url ? (p.url.split('/').pop() as string) : '';
          const thumbnail = p.thumbnail ? (p.thumbnail.split('/').pop() as string) : '';
          return { ...p, url, thumbnail };
        });
      }
      return a;
    });

    return {
      data: albums,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  async getPublishedAlbums(category?: string): Promise<IAlbum[]> {
    const filter: FilterQuery<IAlbum> = { isPublished: true };
    if (category) filter.category = category;
    const data = await Album.find(filter).sort('order');
    return data.map(album => {
      const a = album.toObject();
      if (a.coverImage) {
        a.coverImage = a.coverImage ? a.coverImage.split('/').pop() || '' : '';
      }
      if (a.photos && Array.isArray(a.photos)) {
        a.photos = a.photos.map((p: IPhoto) => {
          const url = p.url ? (p.url.split('/').pop() as string) : '';
          const thumbnail = p.thumbnail ? (p.thumbnail.split('/').pop() as string) : '';
          return { ...p, url, thumbnail };
        });
      }
      return a;
    });
  }

  async getAlbumById(id: string): Promise<IAlbum> {
    const album = await Album.findById(id);
    if (!album) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Album not found');
    const a = album.toObject();
    if (a.coverImage) {
      a.coverImage = a.coverImage ? a.coverImage.split('/').pop() || '' : '';
    }
    if (a.photos && Array.isArray(a.photos)) {
      a.photos = a.photos.map((p: IPhoto) => {
        const url = p.url ? (p.url.split('/').pop() as string) : '';
        const thumbnail = p.thumbnail ? (p.thumbnail.split('/').pop() as string) : '';
        return { ...p, url, thumbnail };
      });
    }
    return a;
  }

  async getAlbumBySlug(slug: string): Promise<IAlbum> {
    const album = await Album.findOne({ slug, isPublished: true });
    if (!album) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Album not found');
    const a = album.toObject();
    if (a.coverImage) {
      a.coverImage = a.coverImage ? a.coverImage.split('/').pop() || '' : '';
    }
    if (a.photos && Array.isArray(a.photos)) {
      a.photos = a.photos.map((p: IPhoto) => {
        const url = p.url ? (p.url.split('/').pop() as string) : '';
        const thumbnail = p.thumbnail ? (p.thumbnail.split('/').pop() as string) : '';
        return { ...p, url, thumbnail };
      });
    }
    return a;
  }

  async updateAlbum(id: string, data: Partial<IAlbum>): Promise<IAlbum> {
    const album = await Album.findById(id);
    if (!album) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Album not found');
    if (data.title?.en && data.title.en !== album.title.en) {
      (data as Partial<IAlbum>).slug = createSlug(data.title.en);
    }
    Object.assign(album, data);
    await album.save();
    return album;
  }

  async deleteAlbum(id: string): Promise<void> {
    const album = await Album.findByIdAndDelete(id);
    if (!album) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Album not found');
  }

  /* ── Photo operations ───────────────────────────── */
  async addPhotos(albumId: string, photos: IPhoto[]): Promise<IAlbum> {
    const album = await Album.findById(albumId);
    if (!album) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Album not found');
    album.photos.push(...photos);
    await album.save();
    return album;
  }

  async removePhoto(albumId: string, photoId: string): Promise<IAlbum> {
    const album = await Album.findById(albumId);
    if (!album) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Album not found');
    // الصور فعليًا تأتي من قاعدة البيانات وتحتوي على _id
    const index = (album.photos as unknown as (IPhoto & { _id: string })[]).findIndex((p) => p._id.toString() === photoId);
    if (index === -1) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Photo not found');
    album.photos.splice(index, 1);
    await album.save();
    return album;
  }

  async reorderPhotos(albumId: string, photoOrders: { id: string; order: number }[]): Promise<IAlbum> {
    const album = await Album.findById(albumId);
    if (!album) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Album not found');
    for (const po of photoOrders) {
      const photo = (album.photos as unknown as (IPhoto & { _id: string })[]).find((p) => p._id.toString() === po.id);
      if (photo) photo.order = po.order;
    }
    await album.save();
    return album;
  }
}

export default new GalleryService();
