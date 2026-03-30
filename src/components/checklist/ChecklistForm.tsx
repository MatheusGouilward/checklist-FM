'use client';

import { Fragment } from 'react';
import { useChecklistStore } from '@/stores/checklist-store';
import { ChecklistSection } from './ChecklistSection';
import { TOTAL_ITEMS } from '@/lib/checklist/template';
import { ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

function getSectionShortName(title: string): string {
  const map: Record<string, string> = {
    'Filtros e Qualidade do Ar': 'Filtros',
    'Componentes Mecânicos': 'Mecânica',
    'Sistema de Refrigeração': 'Refrig.',
    'Componentes Elétricos': 'Elétrica',
    'Estrutura e Geral': 'Geral',
  };
  return map[title] ?? title.split(' ')[0];
}

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
    <div className="h-full flex flex-col overflow-x-hidden bg-background">
      {/* Fixed top bar */}
      <div className="shrink-0 border-b border-border bg-white px-5 pt-4 pb-3">
        {/* Context bar: back button + store name + filled/total */}
        <div className="mb-3 flex items-center gap-2">
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
            {storeName}
          </p>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {filledCount}/{TOTAL_ITEMS}
          </span>
        </div>

        {/* Linear stepper — container fills full width (auto layout / fill)
            Each circle is shrink-0, each connector line is flex-1.
            Rendered as siblings via Fragment so spacing is always equal. */}
        <div className="flex w-full items-start">
          {sections.map((section, index) => {
            const sectionFilled = section.items.filter(
              (item) => item.value !== null && item.value !== ''
            ).length;
            const sectionTotal = section.items.length;
            const sectionComplete = sectionFilled === sectionTotal;
            const isActive = index === activeSectionIndex;
            const isPast = index < activeSectionIndex;
            const isLast = index === sections.length - 1;

            return (
              <Fragment key={section.id}>
                {/* Circle + label — shrink-0 so all circles have identical size */}
                <button
                  type="button"
                  onClick={() => setActiveSectionIndex(index)}
                  aria-label={`${section.title}: ${sectionFilled} de ${sectionTotal} itens`}
                  className="flex shrink-0 flex-col items-center gap-1.5"
                >
                  <div
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-primary text-white shadow-sm shadow-primary/30'
                        : sectionComplete
                          ? 'bg-emerald-500 text-white'
                          : isPast
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {sectionComplete ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-medium leading-tight text-center',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {getSectionShortName(section.title)}
                  </span>
                </button>

                {/* Connector line — flex-1 fills all remaining space equally between circles */}
                {!isLast && (
                  <div className="mx-1.5 mt-3.5 h-0.5 flex-1 rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        index < activeSectionIndex
                          ? sectionComplete
                            ? 'bg-emerald-500'
                            : 'bg-primary/40'
                          : 'bg-transparent'
                      )}
                      style={{ width: index < activeSectionIndex ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Scrollable section content — pb compensa a altura do footer fixo */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-24" key={activeSectionIndex}>
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

      {/* Fixed navigation footer — always visible, 20px from bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-white px-5 pt-3 pb-5">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setActiveSectionIndex(activeSectionIndex - 1)}
            disabled={isFirstSection}
            className="h-12 flex-1 rounded-lg border border-border font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
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
            className={cn(
              'h-12 flex-1 rounded-lg font-medium text-white transition-colors active:scale-[0.98]',
              isLastSection
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-primary hover:bg-primary/90'
            )}
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
    </div>
  );
}
