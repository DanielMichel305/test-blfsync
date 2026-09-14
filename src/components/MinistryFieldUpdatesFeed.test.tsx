// @vitest-environment jsdom
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { components } from '../api/generated';
import { FieldUpdateMedia, isCurrentlyVisible } from './MinistryFieldUpdatesFeed';

type FieldUpdate = components['schemas']['FieldUpdate'];

function update(overrides: Partial<FieldUpdate> = {}): FieldUpdate {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    title: 'Field report',
    tag: 'Hope',
    category: null,
    mdBody: 'Good news',
    status: 'published',
    publishedAt: '2020-01-01T00:00:00.000Z',
    mediaType: null,
    mediaUrl: null,
    ministryTrack: null,
    publisher: null,
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('field-update feed safeguards', () => {
  it('shows only published updates whose publication time has arrived', () => {
    expect(isCurrentlyVisible(update())).toBe(true);
    expect(isCurrentlyVisible(update({ status: 'draft' }))).toBe(false);
    expect(isCurrentlyVisible(update({ status: 'archived' }))).toBe(false);
    expect(isCurrentlyVisible(update({ publishedAt: null }))).toBe(false);
    expect(isCurrentlyVisible(update({ publishedAt: '2999-01-01T00:00:00.000Z' }))).toBe(false);
  });

  it('renders image, video, and no-media cases according to mediaType', () => {
    const image = renderToStaticMarkup(<FieldUpdateMedia update={update({ mediaType: 'image', mediaUrl: 'https://cdn.example.org/report.webp' })} />);
    const video = renderToStaticMarkup(<FieldUpdateMedia update={update({ mediaType: 'video', mediaUrl: 'https://cdn.example.org/report.mp4' })} detail />);
    const none = renderToStaticMarkup(<FieldUpdateMedia update={update()} />);

    expect(image).toContain('<img');
    expect(image).toContain('report.webp');
    expect(video).toContain('<video');
    expect(video).toContain('controls');
    expect(none).toBe('');
  });
});
