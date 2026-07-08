import type { DataSlice } from './slices/dataSlice';
import type { FilterSlice } from './slices/filterSlice';
import type { SelectionSlice } from './slices/selectionSlice';
import type { UiSlice } from './slices/uiSlice';

/** The full store shape, composed from one slice per concern. */
export type BazaarState = DataSlice & FilterSlice & SelectionSlice & UiSlice;
