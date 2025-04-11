import { Cell, Workbook, Worksheet } from 'exceljs';
import { isChineseOrPunctuation } from './utils';

let currentWorkbook: Workbook
let currentWorksheet: Worksheet;
let currentRowNumber = 1;
let currentColNumber = 1;

const suspendRows: (() => void)[] = [];
// 记录需要跳过不创建单元格的位置，key 为行号，value 为需要跳过的列号集合
// { [row: number]: cell[] }
const mergedCells = new Map<number, Set<number>>();

export function workbook(composable: () => void): Workbook {
  currentWorkbook = new Workbook();
  composable();
  // 如果有挂起的行，说明当前工作表没有创建，自动创建一个默认的工作表
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

export function worksheet(name: string, composable: () => void) {
  currentWorksheet = currentWorkbook.addWorksheet(name);
  currentRowNumber = 1;
  composable?.();
  mergedCells.clear()
  autoFitColumns();
  currentWorksheet = undefined!;
}

export function row(composable: () => void) {
  // 如果还没创建工作表，则将当前行挂起
  if (!currentWorksheet) {
    suspendRows.push(() => row(composable));
    return;
  }
  currentColNumber = 1;
  composable();
  currentRowNumber++;
}

export type CellOptions = Partial<{ colSpan: number, rowSpan: number } & Pick<Cell, 'numFmt' | 'font' | 'alignment' | 'border' | 'fill'>>

export function cell(value: any, options: CellOptions = {}) {
  // 如果当前列被标记跳过，则自动跳过所有跳过的单元格
  while (mergedCells.get(currentRowNumber)?.has(currentColNumber)) {
    currentColNumber++;
  }
  const row = currentWorksheet.getRow(currentRowNumber);
  // 给当前单元格赋值
  const cellRef = row.getCell(currentColNumber);
  cellRef.value = value;
  Object.assign(cellRef, options)
  // 处理合并单元格
  const colSpan = options?.colSpan || 1;
  const rowSpan = options?.rowSpan || 1;
  if (colSpan > 1 || rowSpan > 1) {
    const startCell = cellRef.address;
    const endCol = currentColNumber + colSpan - 1;
    const endRow = currentRowNumber + rowSpan - 1;
    const endCell = currentWorksheet.getRow(endRow).getCell(endCol).address;
    currentWorksheet.mergeCells(startCell, endCell);

    // 对于跨行情况，记录合并区域内后续行需要跳过的单元格
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
  // 切换到下一个单元格（跨列合并时，直接跳过合并的区域）
  currentColNumber += colSpan;
}

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

/**
 * 根据每一列中最长的单元格内容设置宽度
 */
function autoFitColumns() {
  const defaultFontSize = 11; // 默认字体大小
  for (const column of currentWorksheet.columns) {
    let maxLength = 8.43; // 默认宽度
    column.eachCell?.({ includeEmpty: true }, cell => {
      // 如果单元格是合并单元格，则跳过宽度计算，改为允许换行
      if (cell.isMerged) {
        cell.alignment = { wrapText: true, ...cell.alignment }
      } else {
        const cellValue = cell.value ? cell.value.toString() : '';
        // 如果单元格设置了字体大小，使用它，否则默认 11
        const fontSize = cell.font?.size || defaultFontSize;

        const width = [...cellValue].map(char => isChineseOrPunctuation(char) ? 2 : 1).reduce((a, b) => a + b, 0);
        // 这里只做简单处理，每个字符占位1，可根据实际情况作优化
        maxLength = Math.max(maxLength, width * (fontSize / defaultFontSize));
      }
    });
    column.width = maxLength + 2; // 预留2个字符的间距
  }
}
