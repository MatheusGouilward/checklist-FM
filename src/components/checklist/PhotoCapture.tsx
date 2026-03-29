'use client';

import { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db/schema';
import type { Photo } from '@/lib/checklist/types';
import { Camera, X } from 'lucide-react';

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

  const hasPhotos = photos.length > 0;

  return (
    <div className="flex flex-col items-start">
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

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={
          hasPhotos
            ? 'flex h-9 items-center gap-1.5 rounded-lg bg-sky-50 px-3 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100'
            : 'flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/30 px-3 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/30'
        }
      >
        <Camera className="h-4 w-4" />
        {hasPhotos ? (
          <>
            <span>{photos.length}</span>
            <span className="text-sky-500">·</span>
            <span className="text-xs text-sky-500">+ Adicionar</span>
          </>
        ) : (
          <span>Foto</span>
        )}
      </button>

      {/* Thumbnails below */}
      {hasPhotos && (
        <div className="mt-2 flex gap-1.5 overflow-x-auto">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative shrink-0">
              <PhotoThumbnail photo={photo} />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(photo.id); }}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
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
      className="h-12 w-12 rounded-lg border border-border object-cover"
      onLoad={() => URL.revokeObjectURL(url)}
    />
  );
}
