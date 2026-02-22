import { FilterQuery } from 'mongoose';
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

    const skip = (page - 1) * limit;
    const total = await Album.countDocuments(filter);
    const data = await Album.find(filter).sort(sort).skip(skip).limit(limit);
    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getPublishedAlbums(category?: string): Promise<IAlbum[]> {
    const filter: FilterQuery<IAlbum> = { isPublished: true };
    if (category) filter.category = category;
    return Album.find(filter).sort('order');
  }

  async getAlbumById(id: string): Promise<IAlbum> {
    const album = await Album.findById(id);
    if (!album) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Album not found');
    return album;
  }

  async getAlbumBySlug(slug: string): Promise<IAlbum> {
    const album = await Album.findOne({ slug, isPublished: true });
    if (!album) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Album not found');
    return album;
  }

  async updateAlbum(id: string, data: Partial<IAlbum>): Promise<IAlbum> {
    const album = await Album.findById(id);
    if (!album) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Album not found');
    if (data.title?.en && data.title.en !== album.title.en) {
      (data as any).slug = createSlug(data.title.en);
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
    const index = album.photos.findIndex((p: any) => p._id.toString() === photoId);
    if (index === -1) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Photo not found');
    album.photos.splice(index, 1);
    await album.save();
    return album;
  }

  async reorderPhotos(albumId: string, photoOrders: { id: string; order: number }[]): Promise<IAlbum> {
    const album = await Album.findById(albumId);
    if (!album) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Album not found');
    for (const po of photoOrders) {
      const photo = album.photos.find((p: any) => p._id.toString() === po.id);
      if (photo) photo.order = po.order;
    }
    await album.save();
    return album;
  }
}

export default new GalleryService();
