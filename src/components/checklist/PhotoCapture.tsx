'use client';

import { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db/schema';
import type { Photo } from '@/lib/checklist/types';
import { Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoCaptureProps {
  checklistId: string;
  itemId: string;
  photos: Photo[];
  onPhotoAdded: (photo: Photo) => void;
  onPhotoRemoved: (photoId: string) => void;
}

async function getGeolocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  if (!navigator.geolocation) return null;
  try {
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 60000,
        });
      }
    );
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return null;
  }
}

export function PhotoCapture({
  checklistId,
  itemId,
  photos,
  onPhotoAdded,
  onPhotoRemoved,
}: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const geo = await getGeolocation();
    const photo: Photo = {
      id: uuidv4(),
      checklistId,
      itemId,
      blob: file,
      timestamp: new Date(),
      latitude: geo?.latitude,
      longitude: geo?.longitude,
    };

    await db.photos.add({
      id: photo.id,
      checklistId: photo.checklistId,
      itemId: photo.itemId,
      blob: photo.blob,
      timestamp: photo.timestamp,
      latitude: photo.latitude,
      longitude: photo.longitude,
    });

    onPhotoAdded(photo);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = async (photoId: string) => {
    await db.photos.delete(photoId);
    onPhotoRemoved(photoId);
  };

  return (
    <div className="space-y-2">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="sr-only"
        aria-label="Capturar foto"
      />

      {/* Trigger button — FULL WIDTH */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex h-11 w-full items-center justify-center gap-2 rounded-lg border text-sm transition-colors',
          photos.length > 0
            ? 'border-sky-200 bg-sky-50 font-medium text-sky-700 hover:bg-sky-100'
            : 'border-dashed border-muted-foreground/25 text-muted-foreground hover:bg-muted/30'
        )}
      >
        <Camera className="h-4 w-4" />
        {photos.length === 0
          ? 'Tirar foto'
          : `${photos.length} foto${photos.length > 1 ? 's' : ''} \u00b7 Adicionar mais`
        }
      </button>

      {/* Thumbnails row */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative shrink-0">
              <PhotoThumbnail photo={photo} />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(photo.id); }}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-80 transition-opacity hover:opacity-100"
                aria-label="Remover foto"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoThumbnail({ photo }: { photo: Photo }) {
  const url = URL.createObjectURL(photo.blob);

  return (
    <img
      src={url}
      alt={`Foto capturada às ${photo.timestamp.toLocaleTimeString('pt-BR')}`}
      className="h-14 w-14 rounded-lg border border-border object-cover"
      onLoad={() => URL.revokeObjectURL(url)}
    />
  );
}
