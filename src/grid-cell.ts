import { html, css, LitElement } from 'lit';
import { consume } from '@lit/context';
import { customElement, property } from 'lit/decorators.js';
import { CellIndex, IDX, indexContext } from './cellector-context.js';
import { CellEvent } from './cell-event.js';

const isSameIndex = (cellIndex: CellIndex, selectedIndex: CellIndex): boolean =>
  cellIndex.toString() === selectedIndex.toString();

// TODO: Inspect why this runs twice per element
const isGridStart = (cellIndex: CellIndex): boolean =>
  cellIndex.toString() === [0, 0].toString();

const isGridEnd = (
  cellIndex: CellIndex,
  idx: Pick<IDX, 'lastIndex'>
): boolean => cellIndex.toString() === idx.lastIndex.toString();

/**
 * <grid-cell-context> is meant to be used inside of <grid-cellector-context>
 *
 * @slot (default) - The content of the component
 *
 * @attribute ix - TODO: add description
 * @attribute index - TODO: add description
 *
 * @cssproperty --cell-radius - TODO: add description
 * @cssproperty --cell-bg-selected - TODO: add description
 *
 * Copyright © 2024 Tony Spegel
 */
@customElement('grid-cell')
export class GridCell extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;

      --cell-radius: 4px;

      --hover-bg-color: blue;
    }

    button {
      border-radius: var(--cell-radius);
      border: none;
      aspect-ratio: 1;

      background: lightslategray;
      outline: none;

      cursor: pointer;

      &:hover {
        background-color: #0f0;
      }

      &:focus {
        background-color: red;
      }

      &[tabindex='-1'] {
        background-color: #fff3e0;
      }
    }
  `;

  @consume({ context: indexContext, subscribe: true })
  @property({ attribute: false, reflect: true })
  accessor idx: IDX = {
    index: [0, 0],
    columns: 0,
    lastIndex: [0, 0],
    xLimit: 0,
    yLimit: 0,
  };

  /**
   * TODO: maybe refactor this to have a custom getter/setter to call
   * _setCellIndex / call focus() on that element?
   */
  @property({ type: Array, reflect: true })
  accessor index: [number, number] = [0, 0];

  @property({ type: String })
  accessor value = '';

  _setCellIndex(index: CellIndex): void {
    console.log(this.value);
    this.dispatchEvent(new CellEvent(index));
  }

  /**
   * Might be better to move to cellector (and use event delegation(?))
   */
  _handleKeyboard(event: KeyboardEvent) {
    const { idx, index } = this;
    const { ctrlKey, key, metaKey } = event;
    const { lastIndex, xLimit, yLimit } = idx;
    const isFirstIndex = isGridStart(index);
    const isLastIndex = isGridEnd(index, idx);
    const [currentColumn, currentRow] = index;
    const [lastX, lastY] = lastIndex;

    let nextIndex: CellIndex = [0, 0];

    switch (key) {
      case 'ArrowLeft':
        /**
         * 🔲 ⬛ ⬛
         * ⬛ ⬛ ⬛
         */
        if (isFirstIndex) break;
        /**
         * ⬛ 🔲 ⬛ next: 🔲 ⬛ ⬛
         * ⬛ ⬛ ⬛       ⬛ ⬛ ⬛
         */
        if (currentColumn > 0) {
          nextIndex = [currentColumn - 1, currentRow];
        }
        /**
         * ⬛ ⬛ ⬛ next: ⬛ ⬛ 🔲
         * 🔲 ⬛ ⬛       ⬛ ⬛ ⬛
         */
        if (currentColumn === 0) {
          nextIndex = [xLimit, currentRow - 1];
        }

        this._setCellIndex(nextIndex);

        break;
      case 'ArrowRight':
        /**
         * ⬛ ⬛ ⬛
         * ⬛ ⬛ 🔲
         */
        if (isLastIndex) break;
        /**
         * ⬛ 🔲 ⬛ next: ⬛ ⬛ 🔲
         * ⬛ ⬛ ⬛       ⬛ ⬛ ⬛
         */
        if (currentColumn < xLimit) {
          nextIndex = [currentColumn + 1, currentRow];
        }
        /**
         * ⬛ ⬛ 🔲 next: ⬛ ⬛ ⬛
         * ⬛ ⬛ ⬛       🔲 ⬛ ⬛
         */
        if (currentColumn === xLimit) {
          nextIndex = [0, currentRow + 1];
        }

        this._setCellIndex(nextIndex);
        break;
      case 'ArrowDown': {
        const lastRow = currentRow === yLimit;
        const lastBeforeRow = currentRow === yLimit - 1;
        const outOfBounds = currentColumn > lastX && currentRow + 1 >= lastY;

        if (lastRow) break;

        /**
         * ⬛ 🔲 ⬛ next: ⬛ ⬛ ⬛
         * ⬛ ⬛          ⬛ 🔲
         */
        if (currentRow < yLimit) {
          nextIndex = [currentColumn, currentRow + 1];
        }

        /**
         * ⬛ ⬛ 🔲 next: ⬛ ⬛ ⬛
         * ⬛ ⬛          ⬛ 🔲
         */
        if (lastBeforeRow && outOfBounds) {
          nextIndex = lastIndex;
        }

        this._setCellIndex(nextIndex);
        break;
      }
      case 'ArrowUp': {
        /**
         * ⬛ ⬛ 🔲 (any of these)
         * ⬛ ⬛ ⬛
         */
        const firstRow = currentRow === 0;
        if (firstRow) break;

        nextIndex = [currentColumn, currentRow - 1];
        this._setCellIndex(nextIndex);
        break;
      }
      default:
        break;
    }

    // 'Pos1' or '⌘ + ←' on MacOS
    if (key === 'Home' || ((metaKey || ctrlKey) && key === 'ArrowLeft')) {
      this._setCellIndex([0, 0]);
    }

    // End or '⌘ + →' on MacOS
    if (key === 'End' || ((metaKey || ctrlKey) && key === 'ArrowRight')) {
      this._setCellIndex(lastIndex);
    }
  }

  render() {
    return html`
      <button
        @click=${() => this._setCellIndex(this.index)}
        @keydown=${this._handleKeyboard}
        tabindex=${isSameIndex(this.idx.index, this.index) ? 0 : -1}
      >
        <slot></slot>
      </button>
    `;
  }
}
