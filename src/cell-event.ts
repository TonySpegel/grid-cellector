/**
 * Copyright © 2024 Tony Spegel
 */

import { CellIndex } from './cellector-context.js';

export class CellEvent extends Event {
  static readonly eventName = 'cell-event' as const;

  constructor(
    public index: CellIndex,
    public cellValue?: string | undefined,

    options = {
      bubbles: true,
      composed: true,
    }
  ) {
    super(CellEvent.eventName, options);
  }
}
