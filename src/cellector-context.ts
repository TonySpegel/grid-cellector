/**
 * Copyright © 2024 Tony Spegel
 */

import { createContext } from '@lit/context';

export type CellIndex = [number, number];

export interface IDX {
  index: CellIndex;
  lastIndex: CellIndex;
  columns: number;
  xLimit: number;
  yLimit: number;
}

export const indexContext = createContext<IDX>(Symbol('indexContext'));
