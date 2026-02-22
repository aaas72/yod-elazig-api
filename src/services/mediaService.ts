import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { FilterQuery } from 'mongoose';
import { Media } from '../models';
import { IMedia } from '../models/Media';
import { ApiError } from '../utils';
import { HTTP_STATUS } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  folder?: string;
  mimetype?: string;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const THUMB_DIR = path.join(UPLOAD_DIR, 'thumbnails');

class MediaService {
  constructor() {
    // Ensure upload directories exist
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });
  }

  async upload(
    file: Express.Multer.File,
    userId: string,
    folder: string = 'general',
    alt?: string,
  ): Promise<IMedia> {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;

    // Ensure folder directory exists
    const folderDir = path.join(UPLOAD_DIR, folder);
    if (!fs.existsSync(folderDir)) fs.mkdirSync(folderDir, { recursive: true });

    const filePath = path.join(folderDir, filename);
    let thumbnailUrl: string | undefined;

    // Process image
    if (file.mimetype.startsWith('image/')) {
      await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(filePath);

      // Create thumbnail
      const thumbFilename = `thumb_${filename}`;
      const thumbPath = path.join(THUMB_DIR, thumbFilename);
      await sharp(file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toFile(thumbPath);

      thumbnailUrl = `/uploads/thumbnails/${thumbFilename}`;
    } else {
      // Non-image file: write directly
      fs.writeFileSync(filePath, file.buffer);
    }

    const media = await Media.create({
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${folder}/${filename}`,
      thumbnailUrl,
      alt,
      folder,
      uploadedBy: userId,
    });

    return media;
  }

  async getAll(options: PaginationOptions): Promise<PaginatedResult<IMedia>> {
    const { page = 1, limit = 20, sort = '-createdAt', folder, mimetype } = options;
    const filter: FilterQuery<IMedia> = {};
    if (folder) filter.folder = folder;
    if (mimetype) filter.mimetype = new RegExp(mimetype, 'i');

    const skip = (page - 1) * limit;
    const total = await Media.countDocuments(filter);
    const data = await Media.find(filter)
      .populate('uploadedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async getById(id: string): Promise<IMedia> {
    const media = await Media.findById(id).populate('uploadedBy', 'name email');
    if (!media) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Media not found');
    return media;
  }

  async delete(id: string): Promise<void> {
    const media = await Media.findById(id);
    if (!media) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Media not found');

    // Delete files from disk
    const filePath = path.join(process.cwd(), media.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (media.thumbnailUrl) {
      const thumbPath = path.join(process.cwd(), media.thumbnailUrl);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    await Media.findByIdAndDelete(id);
  }

  async updateAlt(id: string, alt: string): Promise<IMedia> {
    const media = await Media.findById(id);
    if (!media) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Media not found');
    media.alt = alt;
    await media.save();
    return media;
  }
}

export default new MediaService();
