import { Cell, CellValue, Row, Style, Workbook, Worksheet } from 'exceljs';
import { autoFitColumns } from './utils';

let currentWorkbook: Workbook
let currentWorksheet: Worksheet;
let currentRow: Row | undefined;
let currentRowNumber = 1;
let currentColNumber = 1;

const suspendedOperations: (() => void)[] = [];
/**
 * Map to track merged cells in the current worksheet.
 *
 * The key is the row number, and the value is a set of column numbers that are part of merged cells.
 * This helps to skip creating individual cells in these positions when defining rows.
 */
const mergedCells = new Map<number, Set<number>>();

/**
 * Creates a new Excel workbook using a composable function.
 *
 * This function serves as the entry point for defining an Excel workbook's structure and content.
 *
 * @param composable - A function that defines the content of the workbook using other DSL functions (e.g., `worksheet`, `row`).
 * @returns The newly created Workbook object populated by the composable function.
 */
export function workbook(composable: (it: Workbook) => void): Workbook {
  currentWorkbook = new Workbook();
  composable(currentWorkbook);
  // If there are suspended rows, it means that the current worksheet has not been created, and a default worksheet is automatically created
  if (suspendedOperations.length) {
    worksheet('Sheet1', () => {
      for (const operation of suspendedOperations) {
        operation();
      }
    })
    suspendedOperations.length = 0
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
export function worksheet(name: string, composable: (it: Worksheet) => void): Worksheet {
  currentWorksheet = currentWorkbook.addWorksheet(name);
  currentRowNumber = 1;
  composable(currentWorksheet);
  mergedCells.clear()
  autoFitColumns(currentWorksheet);
  const tmp = currentWorksheet;
  currentWorksheet = undefined!;
  return tmp;
}

/**
 * Defines a new row in the current worksheet.
 *
 * This function sets the context for defining cells within a specific row.
 *
 * @param composable - A function that contains calls to cell definition functions (e.g., `cell`) for the current row.
 */
export function row(composable: (it: Row) => void): Row | void {
  // If the worksheet has not been created yet, suspend the current operation
  if (!currentWorksheet) {
    suspendedOperations.push(() => row(composable));
    return;
  }
  currentColNumber = 1;
  currentRow = currentWorksheet.getRow(currentRowNumber);
  composable(currentRow);
  currentRowNumber++;
  const tmp = currentRow;
  currentRow = undefined;
  return tmp;
}

export type CellOptions = Partial<{ colSpan: number, rowSpan: number } & Style>

/**
 * Creates and configures a cell within the current worksheet at the current row and column position.
 *
 * @param value The value to be placed into the cell.
 * @param options Optional configuration for the cell.
 * @returns The `exceljs.Cell` object that was created and configured.
 */
export function cell(value: CellValue, options: CellOptions = {}): Cell {
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
 * @param value - The value to be placed into the cell.
 * @param options - Optional configuration for the cell.
 * @returns The `exceljs.Cell` object that was created and configured.
 */
export function borderedCell(value: CellValue, options: CellOptions = {}): Cell {
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

/**
 * Creates a cell configuration with content centered horizontally and vertically.
 *
 * @param value - The value to be placed into the cell.
 * @param options - Optional configuration for the cell.
 */
export function centeredCell(value: CellValue, options: CellOptions = {}): Cell {
  return borderedCell(value, {
    alignment: { horizontal: 'center', vertical: 'middle' },
    ...options
  });
}

/**
 * Advance to row or column
 *
 * @param delta - Number of positions to move forward. Defaults to `1`. A
 *   negative value can be used to move backwards.
 */
export function advance(delta = 1): void {
  // If the worksheet has not been created yet, suspend the current operation
  if (!currentWorksheet) {
    suspendedOperations.push(() => advance(delta));
    return;
  }

  if (currentRow) {
    currentColNumber += delta;
  } else {
    currentRowNumber += delta;
  }
}
