import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const artists = sqliteTable('artists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  biography: text('biography'),
  website: text('website'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [uniqueIndex('idx_artists_slug').on(table.slug)]);

export const artworks = sqliteTable('artworks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accessionNumber: text('accession_number').notNull(),
  slug: text('slug').notNull(),
  artistId: integer('artist_id').notNull().references(() => artists.id),
  title: text('title').notNull(),
  year: integer('year').notNull(),
  medium: text('medium').notNull(),
  widthIn: real('width_in'),
  heightIn: real('height_in'),
  depthIn: real('depth_in'),
  description: text('description'),
  provenance: text('provenance'),
  priceCents: integer('price_cents'),
  currency: text('currency').notNull().default('USD'),
  status: text('status', { enum: ['available', 'reserved', 'sold', 'not_for_sale'] }).notNull().default('available'),
  primaryImageKey: text('primary_image_key'),
  externalImageUrl: text('external_image_url'),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  uniqueIndex('idx_artworks_accession_number').on(table.accessionNumber),
  uniqueIndex('idx_artworks_slug').on(table.slug),
  index('idx_artworks_artist_id').on(table.artistId),
  index('idx_artworks_status_published').on(table.status, table.published),
  index('idx_artworks_year').on(table.year),
]);

export const artworkImages = sqliteTable('artwork_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  artworkId: integer('artwork_id').notNull().references(() => artworks.id, { onDelete: 'cascade' }),
  objectKey: text('object_key').notNull(),
  altText: text('alt_text').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [index('idx_artwork_images_artwork_sort').on(table.artworkId, table.sortOrder)]);

export const exhibitions = sqliteTable('exhibitions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  venue: text('venue').notNull(),
  city: text('city'),
  startYear: integer('start_year').notNull(),
  endYear: integer('end_year'),
});

export const artworkExhibitions = sqliteTable('artwork_exhibitions', {
  artworkId: integer('artwork_id').notNull().references(() => artworks.id, { onDelete: 'cascade' }),
  exhibitionId: integer('exhibition_id').notNull().references(() => exhibitions.id, { onDelete: 'cascade' }),
}, (table) => [uniqueIndex('idx_artwork_exhibitions_pair').on(table.artworkId, table.exhibitionId)]);

export const inquiries = sqliteTable('inquiries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  artworkId: integer('artwork_id').notNull().references(() => artworks.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message'),
  status: text('status', { enum: ['new', 'replied', 'closed'] }).notNull().default('new'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_inquiries_artwork_id').on(table.artworkId),
  index('idx_inquiries_status_created').on(table.status, table.createdAt),
]);
