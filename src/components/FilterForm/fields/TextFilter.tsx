import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';

import { Tooltip } from 'components/Tooltip/Tooltip';
import { SEARCH_HINT } from 'data/filterHints';

import { useDebouncedValue } from 'hooks/useDebouncedValue';
import { formatHeroLabel } from 'functions/formatHeroLabel';
import { getItemNameSuggestionsAtCursor } from 'functions/getItemNameSuggestions';
import { useBazaarStore, useDetectedFilters } from 'store/useBazaarStore';

import './TextFilter.scss';

export const TextFilter = () => {
  const setText = useBazaarStore((s) => s.setText);
  const select = useBazaarStore((s) => s.select);
  const entries = useBazaarStore((s) => s.entries);
  const [value, setValue] = useState(() => useBazaarStore.getState().filter.text);
  const debounced = useDebouncedValue(value, 150);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [cursor, setCursor] = useState(0);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setText(debounced);
  }, [debounced, setText]);

  const detected = useDetectedFilters();
  const detectedLabels = useMemo(
    () => [
      ...detected.kinds,
      ...detected.heroes.map(formatHeroLabel),
      ...detected.sizes,
      ...detected.tiers,
      ...detected.types,
      ...detected.tags,
    ],
    [detected],
  );

  const suggestions = useMemo(
    () => getItemNameSuggestionsAtCursor(entries, value, cursor),
    [entries, value, cursor],
  );

  const showSuggestions = open && suggestions.length > 0;

  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const option = listRef.current.children[activeIndex] as HTMLElement | undefined;
    option?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const syncCursor = () => {
    const pos = inputRef.current?.selectionStart ?? value.length;
    setCursor(pos);
  };

  const applySuggestion = (name: string) => {
    setValue(name);
    setText(name);
    setOpen(false);
    setActiveIndex(-1);

    const entry = entries.find((e) => e.kind === 'item' && e.name === name);
    if (entry) select(entry.id);

    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      const pos = name.length;
      input.setSelectionRange(pos, pos);
      setCursor(pos);
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      applySuggestion(suggestions[activeIndex].name);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const listboxId = 'TextFilter-suggestions';

  return (
    <div className="TextFilter">
      <div className="TextFilter-box">
        <Tooltip content={SEARCH_HINT} side="bottom">
          <span className="TextFilter-help" tabIndex={0} aria-label="Search help">
            <Search className="TextFilter-icon" size={16} aria-hidden />
          </span>
        </Tooltip>
        <input
          ref={inputRef}
          className="TextFilter-input"
          type="text"
          placeholder="jules food  or  pyg large"
          value={value}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls={showSuggestions ? listboxId : undefined}
          aria-activedescendant={
            showSuggestions && activeIndex >= 0
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setCursor(e.target.selectionStart ?? e.target.value.length);
          }}
          onFocus={() => {
            syncCursor();
            setOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
          onKeyUp={syncCursor}
          onClick={syncCursor}
          onSelect={syncCursor}
          aria-label="Search items and skills"
        />
        {value && (
          <button
            type="button"
            className="TextFilter-clear"
            onClick={() => {
              setValue('');
              setOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}

        {showSuggestions && (
          <ul
            ref={listRef}
            id={listboxId}
            className="TextFilter-suggestions"
            role="listbox"
            aria-label="Item name suggestions"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.name}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`TextFilter-suggestion${index === activeIndex ? ' is-active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => applySuggestion(suggestion.name)}
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {detectedLabels.length > 0 && (
        <div className="TextFilter-detected" aria-label="Filters detected from search">
          {detectedLabels.map((label) => (
            <span key={label} className="TextFilter-chip">
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
