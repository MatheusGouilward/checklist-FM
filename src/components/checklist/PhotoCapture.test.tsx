import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhotoCapture } from './PhotoCapture';
import { db } from '@/lib/db/schema';
import type { Photo } from '@/lib/checklist/types';

describe('PhotoCapture', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('renders the capture button with "Tirar foto" when no photos', () => {
    render(
      <PhotoCapture
        checklistId="c1"
        itemId="item-1"
        photos={[]}
        onPhotoAdded={() => {}}
        onPhotoRemoved={() => {}}
      />
    );

    expect(screen.getByText('Tirar foto')).toBeInTheDocument();
  });

  it('shows photo count when photos exist', () => {
    const photo: Photo = {
      id: 'p1',
      checklistId: 'c1',
      itemId: 'item-1',
      blob: new Blob(['test'], { type: 'image/jpeg' }),
      timestamp: new Date('2026-01-15T10:30:00'),
    };

    render(
      <PhotoCapture
        checklistId="c1"
        itemId="item-1"
        photos={[photo]}
        onPhotoAdded={() => {}}
        onPhotoRemoved={() => {}}
      />
    );

    // Button shows count with "· Adicionar mais" — check the photo count text is present
    expect(screen.getByText(/1 foto.*Adicionar mais/)).toBeInTheDocument();
  });

  it('has a hidden file input with capture="environment"', () => {
    render(
      <PhotoCapture
        checklistId="c1"
        itemId="item-1"
        photos={[]}
        onPhotoAdded={() => {}}
        onPhotoRemoved={() => {}}
      />
    );

    const input = screen.getByLabelText('Capturar foto');
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', 'image/*');
    expect(input).toHaveAttribute('capture', 'environment');
  });

  it('calls onPhotoAdded and saves to Dexie when file is selected', async () => {
    const onPhotoAdded = vi.fn();
    render(
      <PhotoCapture
        checklistId="c1"
        itemId="item-1"
        photos={[]}
        onPhotoAdded={onPhotoAdded}
        onPhotoRemoved={() => {}}
      />
    );

    const input = screen.getByLabelText('Capturar foto');
    const file = new File(['fake-image'], 'photo.jpg', {
      type: 'image/jpeg',
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onPhotoAdded).toHaveBeenCalledTimes(1);
    });

    const savedPhotos = await db.photos.toArray();
    expect(savedPhotos).toHaveLength(1);
    expect(savedPhotos[0].checklistId).toBe('c1');
    expect(savedPhotos[0].itemId).toBe('item-1');
  });

  it('renders remove button for each photo', () => {
    const photo: Photo = {
      id: 'p1',
      checklistId: 'c1',
      itemId: 'item-1',
      blob: new Blob(['test'], { type: 'image/jpeg' }),
      timestamp: new Date('2026-01-15T10:30:00'),
    };

    render(
      <PhotoCapture
        checklistId="c1"
        itemId="item-1"
        photos={[photo]}
        onPhotoAdded={() => {}}
        onPhotoRemoved={() => {}}
      />
    );

    expect(screen.getByLabelText('Remover foto')).toBeInTheDocument();
  });

  it('calls onPhotoRemoved and deletes from Dexie when remove is clicked', async () => {
    const onPhotoRemoved = vi.fn();

    // Add photo to Dexie first
    await db.photos.add({
      id: 'p1',
      checklistId: 'c1',
      itemId: 'item-1',
      blob: new Blob(['test'], { type: 'image/jpeg' }),
      timestamp: new Date(),
    });

    const photo: Photo = {
      id: 'p1',
      checklistId: 'c1',
      itemId: 'item-1',
      blob: new Blob(['test'], { type: 'image/jpeg' }),
      timestamp: new Date('2026-01-15T10:30:00'),
    };

    render(
      <PhotoCapture
        checklistId="c1"
        itemId="item-1"
        photos={[photo]}
        onPhotoAdded={() => {}}
        onPhotoRemoved={onPhotoRemoved}
      />
    );

    fireEvent.click(screen.getByLabelText('Remover foto'));

    await waitFor(() => {
      expect(onPhotoRemoved).toHaveBeenCalledWith('p1');
    });

    const remaining = await db.photos.toArray();
    expect(remaining).toHaveLength(0);
  });

  it('capture button has h-11 touch target', () => {
    render(
      <PhotoCapture
        checklistId="c1"
        itemId="item-1"
        photos={[]}
        onPhotoAdded={() => {}}
        onPhotoRemoved={() => {}}
      />
    );

    const button = screen.getByText('Tirar foto').closest('button');
    expect(button?.className).toContain('h-11');
  });
});
