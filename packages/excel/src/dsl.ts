import { Cell, Workbook, Worksheet } from 'exceljs';
import { isChineseOrPunctuation } from './utils';

let currentWorkbook: Workbook
let currentWorksheet: Worksheet;
let currentRowNumber = 1;
let currentColNumber = 1;

const suspendRows: (() => void)[] = [];
// Record the positions to skip creating cells, key is the row number, value is the set of columns to skip
// { [row: number]: cell[] }
const mergedCells = new Map<number, Set<number>>();

/**
 * Creates a new Excel workbook using a composable function.
 *
 * This function serves as the entry point for defining an Excel workbook's structure and content.
 *
 * @param composable - A function that defines the content of the workbook using other DSL functions (e.g., `worksheet`, `row`).
 * @returns The newly created Workbook object populated by the composable function.
 */
export function workbook(composable: () => void): Workbook {
  currentWorkbook = new Workbook();
  composable();
  // If there are suspended rows, it means that the current worksheet has not been created, and a default worksheet is automatically created
  if (suspendRows.length) {
    worksheet('Sheet1', () => {
      for (const suspendRow of suspendRows) {
        suspendRow();
      }
    })
    suspendRows.length = 0
  }
  return currentWorkbook;
}

/**
 * Defines a worksheet within the current workbook context.
 *
 * Creates a new worksheet with the specified name, sets it as the active context
 * for subsequent row/cell operations within the `composable` function,
 * and performs finalization steps like auto-fitting columns after the
 * composable function completes.
 *
 * @param name - The name to be assigned to the new worksheet.
 * @param composable - A callback function that contains the logic to define
 *                     the content (rows, cells, etc.) of this worksheet. DSL functions
 *                     called within this callback will operate on the newly created worksheet.
 */
export function worksheet(name: string, composable: () => void) {
  currentWorksheet = currentWorkbook.addWorksheet(name);
  currentRowNumber = 1;
  composable?.();
  mergedCells.clear()
  autoFitColumns();
  const ws = currentWorksheet;
  currentWorksheet = undefined!;
  return ws;
}

/**
 * Defines a new row in the current worksheet.
 *
 * This function sets the context for defining cells within a specific row.
 *
 * @param composable - A function that contains calls to cell definition functions (e.g., `cell`) for the current row.
 */
export function row(composable: () => void) {
  // If the worksheet has not been created yet, suspend the current row
  if (!currentWorksheet) {
    suspendRows.push(() => row(composable));
    return;
  }
  currentColNumber = 1;
  composable();
  return currentWorksheet.getRow(currentRowNumber++)
}

export type CellOptions = Partial<{ colSpan: number, rowSpan: number } & Pick<Cell, 'numFmt' | 'font' | 'alignment' | 'border' | 'fill'>>

/**
 * Creates and configures a cell within the current worksheet at the current row and column position.
 *
 * @param value The value to be placed into the cell. Can be of any type supported by exceljs.
 * @param options Optional configuration for the cell.
 * @returns The `exceljs.Cell` object that was created and configured.
 */
export function cell(value: any, options: CellOptions = {}) {
  // If the current column is marked as skipped, automatically skip all skipped cells
  while (mergedCells.get(currentRowNumber)?.has(currentColNumber)) {
    currentColNumber++;
  }
  const row = currentWorksheet.getRow(currentRowNumber);
  const cellRef = row.getCell(currentColNumber);
  cellRef.value = value;
  Object.assign(cellRef, options)
  // Merging cells
  const colSpan = options?.colSpan || 1;
  const rowSpan = options?.rowSpan || 1;
  if (colSpan > 1 || rowSpan > 1) {
    const startCell = cellRef.address;
    const endCol = currentColNumber + colSpan - 1;
    const endRow = currentRowNumber + rowSpan - 1;
    const endCell = currentWorksheet.getRow(endRow).getCell(endCol).address;
    currentWorksheet.mergeCells(startCell, endCell);

    // For row span, record the cells to skip in subsequent rows
    if (rowSpan > 1) {
      for (let row = currentRowNumber + 1; row <= endRow; row++) {
        if (!mergedCells.has(row)) {
          mergedCells.set(row, new Set());
        }
        for (let col = currentColNumber; col <= endCol; col++) {
          mergedCells.get(row)?.add(col);
        }
      }
    }
  }
  // Switch to the next cell (if column span is merged, skip the merged area directly)
  currentColNumber += colSpan;
  return cellRef;
}

/**
 * Creates a cell object with a thin border applied to all four sides.
 *
 * @param value - The value to be placed into the cell. Can be of any type supported by exceljs.
 * @param options - Optional configuration for the cell.
 * @returns The `exceljs.Cell` object that was created and configured.
 */
export function borderedCell(value: any, options: CellOptions = {}) {
  return cell(value, {
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    },
    ...options
  })
}

const DEFAULT_FONT_SIZE = 11;
const DEFAULT_COL_WIDTH = 8.43;

function autoFitColumns() {
  for (const column of currentWorksheet.columns) {
    let maxLength = DEFAULT_COL_WIDTH;
    column.eachCell?.(cell => {
      // If the cell is a merged cell, skip the width calculation and allow line breaks
      if (cell.isMerged) {
        cell.alignment = { wrapText: true, ...cell.alignment }
      } else {
        const cellValue = cell.value ? cell.value.toString() : '';
        const fontSize = cell.font?.size || DEFAULT_FONT_SIZE;
        const width = [...cellValue].map(char => isChineseOrPunctuation(char) ? 2 : 1).reduce((a, b) => a + b, 0);
        maxLength = Math.max(maxLength, width * (fontSize / DEFAULT_FONT_SIZE));
      }
    });
    column.width = maxLength + 2; // Reserve 2 characters of spacing
  }
}
