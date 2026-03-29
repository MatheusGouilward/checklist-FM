'use client';

import { useChecklistStore } from '@/stores/checklist-store';
import { ChecklistSection } from './ChecklistSection';
import { TOTAL_ITEMS } from '@/lib/checklist/template';
import { ChevronLeft, Check } from 'lucide-react';

interface ChecklistFormProps {
  onGoToSummary?: () => void;
  onBack?: () => void;
}

export function ChecklistForm({ onGoToSummary, onBack }: ChecklistFormProps) {
  const {
    id,
    sections,
    activeSectionIndex,
    status,
    storeName,
    setItemValue,
    setItemObservation,
    addItemPhoto,
    removeItemPhoto,
    setActiveSectionIndex,
  } = useChecklistStore();

  const activeSection = sections[activeSectionIndex];
  const isFirstSection = activeSectionIndex === 0;
  const isLastSection = activeSectionIndex === sections.length - 1;

  const filledCount = sections.reduce(
    (sum, section) =>
      sum +
      section.items.filter(
        (item) => item.value !== null && item.value !== ''
      ).length,
    0
  );

  if (status === 'draft') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <p className="text-muted-foreground">
          Nenhum checklist em andamento.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background" style={{ overscrollBehavior: 'contain' }}>
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-white px-5 pt-3 pb-3">
        {/* Context bar: back + location + section counter */}
        <div className="mb-2.5 flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Voltar para lista de OS"
            >
              <ChevronLeft className="h-[18px] w-[18px]" />
            </button>
          )}
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            Loja {storeName}
          </p>
          <span className="shrink-0 text-sm text-muted-foreground">
            {activeSectionIndex + 1}/{sections.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-1 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${TOTAL_ITEMS > 0 ? (filledCount / TOTAL_ITEMS) * 100 : 0}%` }}
          />
        </div>

        {/* Section dots */}
        <div className="mt-2 flex justify-center gap-2 py-1">
          {sections.map((section, index) => {
            const sectionFilled = section.items.filter(
              (item) => item.value !== null && item.value !== ''
            ).length;
            const sectionComplete = sectionFilled === section.items.length;
            const isActive = index === activeSectionIndex;

            let dotClass = 'bg-muted-foreground/20';
            if (isActive) dotClass = 'bg-primary scale-125';
            else if (sectionComplete) dotClass = 'bg-emerald-500';
            else if (sectionFilled > 0) dotClass = 'bg-amber-400';

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSectionIndex(index)}
                aria-label={`Seção ${index + 1}: ${section.title}`}
                className="flex h-6 w-6 items-center justify-center"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${dotClass}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Active section content */}
      <div className="animate-fadeIn flex-1 px-5 py-4" key={activeSectionIndex}>
        {activeSection && (
          <>
            <h2 className="mb-1 font-heading text-lg font-semibold text-foreground">
              {activeSection.title}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {activeSection.items.length} itens nesta seção
            </p>
            <ChecklistSection
              checklistId={id ?? ''}
              section={activeSection}
              sectionIndex={activeSectionIndex}
              totalSections={sections.length}
              onItemValueChange={(itemId, value) =>
                setItemValue(activeSection.id, itemId, value)
              }
              onItemObservationChange={(itemId, obs) =>
                setItemObservation(activeSection.id, itemId, obs)
              }
              onItemPhotoAdded={(itemId, photo) =>
                addItemPhoto(activeSection.id, itemId, photo)
              }
              onItemPhotoRemoved={(itemId, photoId) =>
                removeItemPhoto(activeSection.id, itemId, photoId)
              }
            />
          </>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 z-10 flex gap-3 border-t border-border bg-white px-5 py-3 safe-bottom">
        <button
          type="button"
          onClick={() => setActiveSectionIndex(activeSectionIndex - 1)}
          disabled={isFirstSection}
          className="h-12 flex-1 rounded-lg border border-border font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => {
            if (isLastSection) {
              onGoToSummary?.();
              return;
            }
            setActiveSectionIndex(activeSectionIndex + 1);
          }}
          className={`h-12 flex-1 rounded-lg font-medium text-white transition-colors active:scale-[0.98] active:transition-transform active:duration-100 ${
            isLastSection
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isLastSection ? (
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4" />
              Revisar
            </span>
          ) : (
            'Próximo'
          )}
        </button>
      </div>
    </div>
  );
}
