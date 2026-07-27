'use client'

import { Icon } from '@/components/ui/Icon'
import { PillTabs } from '@/components/shared/PillTabs'

export type KlasseTab = 'schueler' | 'klassenübersicht' | 'lernziele' | 'beurteilung' | 'berichte' | 'einstellungen'

export const KlasseTabBar = ({
  active, onChange,
  title, onEditTitle,
}: {
  active: KlasseTab; onChange: (t: KlasseTab) => void
  title: string; onEditTitle: () => void
}) => {
  const tabs: { key: KlasseTab; label: string }[] = [
    { key: 'schueler',         label: 'Schüler' },
    { key: 'beurteilung',      label: 'Beurteilung' },
    { key: 'klassenübersicht', label: 'Statistiken' },
    { key: 'lernziele',        label: 'Lernziele' },
    { key: 'berichte',         label: 'Berichte' },
    { key: 'einstellungen',    label: 'Einstellungen' },
  ]
  return (
    <div className="mb-4">
      {/* Title */}
      <div className="flex items-center gap-2 px-1 py-4 mb-1">
        <span className="text-xl text-muted-foreground">
          Klasse <span className="font-bold text-foreground">{title}</span>
        </span>
        <button
          onClick={onEditTitle}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Klassenname bearbeiten"
        >
          <Icon name="edit_square" size={16} />
        </button>
      </div>

      {/* Tab strip */}
      <div className="overflow-x-auto scrollbar-hide">
        <PillTabs variant="underline" options={tabs} value={active} onChange={onChange} />
      </div>
    </div>
  )
}

