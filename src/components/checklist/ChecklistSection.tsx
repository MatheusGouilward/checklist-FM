'use client';

import { ChecklistItem } from './ChecklistItem';
import type { ChecklistSection as ChecklistSectionType, Photo } from '@/lib/checklist/types';

interface ChecklistSectionProps {
  checklistId: string;
  section: ChecklistSectionType;
  sectionIndex: number;
  totalSections: number;
  onItemValueChange: (itemId: string, value: string | number | null) => void;
  onItemObservationChange: (itemId: string, observation: string) => void;
  onItemPhotoAdded: (itemId: string, photo: Photo) => void;
  onItemPhotoRemoved: (itemId: string, photoId: string) => void;
}

export function ChecklistSection({
  checklistId,
  section,
  onItemValueChange,
  onItemObservationChange,
  onItemPhotoAdded,
  onItemPhotoRemoved,
}: ChecklistSectionProps) {
  return (
    <div className="space-y-4">
      {section.items.map((item) => (
        <ChecklistItem
          key={item.id}
          checklistId={checklistId}
          item={item}
          onValueChange={(value) => onItemValueChange(item.id, value)}
          onObservationChange={(obs) =>
            onItemObservationChange(item.id, obs)
          }
          onPhotoAdded={(photo) => onItemPhotoAdded(item.id, photo)}
          onPhotoRemoved={(photoId) => onItemPhotoRemoved(item.id, photoId)}
        />
      ))}
    </div>
  );
}
