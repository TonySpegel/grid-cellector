import { html, css, LitElement } from 'lit';
import { provide } from '@lit/context';
import {
  customElement,
  property,
  queryAssignedElements,
} from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { CellIndex, IDX, indexContext } from './cellector-context.js';
import { CellEvent } from './cell-event.js';

interface CellElement extends HTMLButtonElement {
  row: string;
  col: string;
  index: CellIndex;
}

const updateIx = (obj: IDX, fieldsToUpdate: Partial<IDX>): IDX => ({
  ...obj,
  ...fieldsToUpdate,
});

/**
 *
 * @slot (default) - The content of the component
 *
 * @attribute ix - TODO: add description
 * @attribute columns - TODO: add description
 *
 * @cssproperty --base-gap - Default value for gaps and paddings
 */
@customElement('grid-cellector')
export class GridCellector extends LitElement {
  static styles = css`
    :host {
      display: block;
      --base-gap: 1rem;
      direction: ltr;
    }

    #cellector {
      display: grid;
      gap: var(--base-gap);
      padding-block: var(--base-gap);
    }
  `;

  @provide({ context: indexContext })
  @property({ attribute: false })
  accessor ix: IDX = {
    index: [1, 1],
    columns: 0,
    lastIndex: [0, 0],
    xLimit: 0,
    yLimit: 0,
  };

  @property({ type: Number, reflect: true })
  accessor columns = 3;

  @queryAssignedElements()
  accessor #cellList: Array<CellElement> = [];

  handleSlotChange() {
    this.ix.columns = this.columns;
    this.ix.xLimit = this.columns - 1;

    this.#cellList.forEach((cell, index) => {
      const col = (index % this.columns) - 1 + 1;
      const row = Math.ceil((index + 1) / this.columns - 1);

      cell.setAttribute('index', JSON.stringify([col, row]));

      if (this.#cellList.length - 1 === index) {
        this.ix = updateIx(this.ix, {
          lastIndex: [col, row],
          yLimit: row,
        });
      }
    });
  }

  constructor() {
    super();
    this.addEventListener('cell-event', e => {
      const { index } = e as CellEvent;
      this.ix = updateIx(this.ix, { index });

      const nuCell = this.#cellList.filter(
        cell => cell.index.toString() === index.toString()
      )[0];

      const b = nuCell.shadowRoot?.querySelector('button');
      b?.focus();
    });
  }

  render() {
    const columns = { gridTemplateColumns: `repeat(${this.columns}, max-content)` };
    return html`
      <div
        @slotchange=${this.handleSlotChange}
        id="cellector"
        style=${styleMap(columns)}
      >
        <slot></slot>
      </div>

      <span>
        index: ${JSON.stringify(this.ix.index)} <br />
        lastIndex: ${JSON.stringify(this.ix.lastIndex)} <br />
        columns: ${this.ix.columns}<br />
        xLimit: ${this.ix.xLimit} <br />
        yLimit: ${this.ix.yLimit} <br />
      </span>
    `;
  }
}
