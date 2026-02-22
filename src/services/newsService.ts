import { FilterQuery } from 'mongoose';
import { News } from '../models';
import { INews } from '../models/News';
import { ApiError, createSlug } from '../utils';
import { HTTP_STATUS } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  category?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  tag?: string;
}

interface NewsPaginatedResult {
  news: INews[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class NewsService {
  /**
   * Create news article
   */
  async create(
    data: Partial<INews> & { title: string; content: string },
    authorId: string,
  ): Promise<INews> {
    // Sync translations.ar with top-level title/content/summary
    const translations = data.translations;
    if (translations?.ar) {
      if (translations.ar.title) data.title = translations.ar.title;
      if (translations.ar.content) data.content = translations.ar.content;
      if (translations.ar.summary) data.summary = translations.ar.summary;
    }

    const news = await News.create({
      ...data,
      author: authorId,
    });

    return news.populate('author', 'name email');
  }

  /**
   * Get all news with filtering & pagination
   */
  async getAll(options: PaginationOptions): Promise<NewsPaginatedResult> {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      category,
      isPublished,
      isFeatured,
      tag,
    } = options;

    const filter: FilterQuery<INews> = {};

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { 'translations.ar.title': new RegExp(search, 'i') },
        { 'translations.en.title': new RegExp(search, 'i') },
        { 'translations.tr.title': new RegExp(search, 'i') },
      ];
    }
    if (category) filter.category = category;
    if (isPublished !== undefined) filter.isPublished = isPublished;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured;
    if (tag) filter.tags = { $in: [tag] };

    const skip = (page - 1) * limit;
    const total = await News.countDocuments(filter);
    const news = await News.find(filter)
      .populate('author', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return {
      news,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get published news (public)
   */
  async getPublished(options: PaginationOptions): Promise<NewsPaginatedResult> {
    return this.getAll({ ...options, isPublished: true });
  }

  /**
   * Get news by ID
   */
  async getById(id: string): Promise<INews> {
    const news = await News.findById(id).populate('author', 'name email');
    if (!news) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'News article not found');
    }
    return news;
  }

  /**
   * Get news by slug (public)
   */
  async getBySlug(slug: string): Promise<INews> {
    const news = await News.findOne({ slug, isPublished: true }).populate(
      'author',
      'name email',
    );
    if (!news) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'News article not found');
    }

    // increment views
    news.views = (news.views || 0) + 1;
    await news.save();

    return news;
  }

  /**
   * Update news article
   */
  async update(id: string, data: Partial<INews>): Promise<INews> {
    const news = await News.findById(id);
    if (!news) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'News article not found');
    }

    // Sync translations.ar with top-level title/content/summary
    const translations = data.translations;
    if (translations?.ar) {
      if (translations.ar.title) data.title = translations.ar.title;
      if (translations.ar.content) data.content = translations.ar.content;
      if (translations.ar.summary) data.summary = translations.ar.summary;
    }

    // Regenerate slug if title changed
    if (data.title && data.title !== news.title) {
      data.slug = createSlug(data.title);
    }

    Object.assign(news, data);
    await news.save();

    return news.populate('author', 'name email');
  }

  /**
   * Delete news article
   */
  async delete(id: string): Promise<void> {
    const news = await News.findByIdAndDelete(id);
    if (!news) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'News article not found');
    }
  }

  /**
   * Toggle publish status
   */
  async togglePublish(id: string): Promise<INews> {
    const news = await News.findById(id);
    if (!news) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'News article not found');
    }

    news.isPublished = !news.isPublished;
    if (news.isPublished && !news.publishedAt) {
      news.publishedAt = new Date();
    }
    await news.save();

    return news.populate('author', 'name email');
  }
}

export default new NewsService();
