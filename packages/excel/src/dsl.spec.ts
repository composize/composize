import { borderedCell, cell, row, workbook, worksheet } from './dsl';

describe('Excel DSL', () => {

  it('should create a workbook and add a worksheet', () => {
    // +--------+--------+
    // | title1 | title2 |
    // +--------+--------+
    // | value1 | value2 |
    // +--------+--------+
    const book = workbook(() => {
      worksheet('sheet', () => {
        row(() => {
          cell('title1');
          cell('title2');
        });
        row(() => {
          cell('value1');
          cell('value2');
        });
      })
    });

    expect(book.worksheets.length).toBe(1);
    expect(book.worksheets[0].name).toBe('sheet');
    expect(book.worksheets[0].getRow(1).getCell(1).value).toBe('title1');
    expect(book.worksheets[0].getRow(1).getCell(2).value).toBe('title2');
    expect(book.worksheets[0].getRow(2).getCell(1).value).toBe('value1');
    expect(book.worksheets[0].getRow(2).getCell(2).value).toBe('value2');
  });

  it('should create a workbook and auto add worksheet', () => {
    // +--------+--------+
    // | title1 | title2 |
    // +--------+--------+
    // | value1 | value2 |
    // +--------+--------+
    const book = workbook(() => {
      row(() => {
        cell('title1');
        cell('title2');
      });
      row(() => {
        cell('value1');
        cell('value2');
      });
    });

    expect(book.worksheets.length).toBe(1);
    expect(book.worksheets[0].name).toBe('Sheet1');
    expect(book.worksheets[0].getRow(1).getCell(1).value).toBe('title1');
    expect(book.worksheets[0].getRow(1).getCell(2).value).toBe('title2');
    expect(book.worksheets[0].getRow(2).getCell(1).value).toBe('value1');
    expect(book.worksheets[0].getRow(2).getCell(2).value).toBe('value2');
  })

  it('should be a workbook and auto add multi worksheets', () => {
    // +--------+--------+
    // | title1 | title2 |
    // +--------+--------+
    // | value1 | value2 |
    // +--------+--------+
    const book = workbook(() => {
      worksheet('sheet1', () => {
        row(() => {
          cell('title1');
          cell('title2');
        });
        row(() => {
          cell('value1');
          cell('value2');
        });
      })
      worksheet('sheet2', () => {
        row(() => {
          cell('title1');
          cell('title2');
        });
        row(() => {
          cell('value1');
          cell('value2');
        });
      })
    });

    expect(book.worksheets.length).toBe(2);
    expect(book.worksheets[0].name).toBe('sheet1');
    expect(book.worksheets[1].name).toBe('sheet2');

    for (const worksheet of book.worksheets) {
      expect(worksheet.getRow(1).getCell(1).value).toBe('title1');
      expect(worksheet.getRow(1).getCell(2).value).toBe('title2');
      expect(worksheet.getRow(2).getCell(1).value).toBe('value1');
      expect(worksheet.getRow(2).getCell(2).value).toBe('value2');
    }
  })

  it('should be merge columns', () => {
    // +--------+---------+---------+
    // |      title1      | title2  |
    // +--------+---------+---------+
    // | value1 |       value2      |
    // +--------+---------+---------+
    const book = workbook(() => {
      row(() => {
        cell('title1', { colSpan: 2 });
        cell('title2');
      });
      row(() => {
        cell('value1');
        cell('value2', { colSpan: 2 });
      });
    });

    expect(book.worksheets[0].getRow(1).getCell(1).value).toBe('title1');
    expect(book.worksheets[0].getRow(1).getCell(2).value).toBe('title1');
    expect(book.worksheets[0].getRow(1).getCell(1).isMerged).toBeTruthy()
    expect(book.worksheets[0].getRow(1).getCell(2).isMerged).toBeTruthy()

    expect(book.worksheets[0].getRow(1).getCell(3).value).toBe('title2');
    expect(book.worksheets[0].getRow(1).getCell(3).isMerged).toBeFalsy()

    expect(book.worksheets[0].getRow(2).getCell(1).value).toBe('value1');
    expect(book.worksheets[0].getRow(2).getCell(1).isMerged).toBeFalsy()

    expect(book.worksheets[0].getRow(2).getCell(2).value).toBe('value2');
    expect(book.worksheets[0].getRow(2).getCell(2).isMerged).toBeTruthy();
    expect(book.worksheets[0].getRow(2).getCell(3).isMerged).toBeTruthy();
  })

  it('should be merge rows', () => {
    // +--------+--------+
    // |        | title2 |
    // + title1 +--------+
    // |        |        |
    // +--------+ value1 +
    // | value2 |        |
    // +--------+--------+
    const book = workbook(() => {
      row(() => {
        cell('title1', { rowSpan: 2 });
        cell('title2');
      });
      row(() => {
        cell('value1', { rowSpan: 2 });
      });
      row(() => {
        cell('value2');
      })
    });

    expect(book.worksheets[0].getRow(1).getCell(1).value).toBe('title1');
    expect(book.worksheets[0].getRow(2).getCell(1).value).toBe('title1');
    expect(book.worksheets[0].getRow(1).getCell(1).isMerged).toBeTruthy();
    expect(book.worksheets[0].getRow(2).getCell(1).isMerged).toBeTruthy();

    expect(book.worksheets[0].getRow(1).getCell(2).value).toBe('title2');
    expect(book.worksheets[0].getRow(1).getCell(2).isMerged).toBeFalsy();

    expect(book.worksheets[0].getRow(2).getCell(2).value).toBe('value1');
    expect(book.worksheets[0].getRow(3).getCell(2).value).toBe('value1');
    expect(book.worksheets[0].getRow(2).getCell(2).isMerged).toBeTruthy()
    expect(book.worksheets[0].getRow(3).getCell(2).isMerged).toBeTruthy();

    expect(book.worksheets[0].getRow(3).getCell(1).value).toBe('value2');
    expect(book.worksheets[0].getRow(3).getCell(1).isMerged).toBeFalsy();
  })

  it('should be merge rows and columns', () => {
    // +--------+--------+--------+
    // |                 | title2 |
    // |      title1     +--------+
    // |                 | title3 |
    // +--------+--------+--------+
    // | value1 |                 |
    // +--------+      value2     +
    // | value3 |                 |
    // +--------+-----------------+
    const book = workbook(() => {
      row(() => {
        cell('title1', { rowSpan: 2, colSpan: 2 });
        cell('title2');
      });
      row(() => {
        cell('title3');
      });
      row(() => {
        cell('value1');
        cell('value2', { rowSpan: 2, colSpan: 2 });
      })
      row(() => {
        cell('value3');
      })
    });

    expect(book.worksheets[0].getRow(1).getCell(1).value).toBe('title1');
    expect(book.worksheets[0].getRow(1).getCell(2).value).toBe('title1');
    expect(book.worksheets[0].getRow(2).getCell(1).value).toBe('title1');
    expect(book.worksheets[0].getRow(2).getCell(2).value).toBe('title1');
    expect(book.worksheets[0].getRow(1).getCell(1).isMerged).toBeTruthy();
    expect(book.worksheets[0].getRow(1).getCell(2).isMerged).toBeTruthy();
    expect(book.worksheets[0].getRow(2).getCell(1).isMerged).toBeTruthy();
    expect(book.worksheets[0].getRow(2).getCell(2).isMerged).toBeTruthy();

    expect(book.worksheets[0].getRow(1).getCell(3).value).toBe('title2');
    expect(book.worksheets[0].getRow(1).getCell(3).isMerged).toBeFalsy();

    expect(book.worksheets[0].getRow(2).getCell(3).value).toBe('title3');
    expect(book.worksheets[0].getRow(2).getCell(3).isMerged).toBeFalsy();

    expect(book.worksheets[0].getRow(3).getCell(1).value).toBe('value1');
    expect(book.worksheets[0].getRow(3).getCell(1).isMerged).toBeFalsy();

    expect(book.worksheets[0].getRow(3).getCell(2).value).toBe('value2');
    expect(book.worksheets[0].getRow(3).getCell(3).value).toBe('value2');
    expect(book.worksheets[0].getRow(4).getCell(2).value).toBe('value2');
    expect(book.worksheets[0].getRow(4).getCell(3).value).toBe('value2');
    expect(book.worksheets[0].getRow(3).getCell(2).isMerged).toBeTruthy();
    expect(book.worksheets[0].getRow(3).getCell(3).isMerged).toBeTruthy();
    expect(book.worksheets[0].getRow(4).getCell(2).isMerged).toBeTruthy();
    expect(book.worksheets[0].getRow(4).getCell(3).isMerged).toBeTruthy();

    expect(book.worksheets[0].getRow(4).getCell(1).value).toBe('value3');
    expect(book.worksheets[0].getRow(4).getCell(1).isMerged).toBeFalsy();
  })

  it('should create a bordered cell with thin borders and additional options', () => {
    const book = workbook(() => {
      row(() => {
        borderedCell('bordered', { numFmt: '0.00' });
      });
    });

    const sheet = book.worksheets[0];
    const createdCell = sheet.getRow(1).getCell(1);

    expect(createdCell.value).toBe('bordered');
    expect(createdCell.numFmt).toBe('0.00');
    expect(createdCell.border?.top?.style).toBe('thin');
    expect(createdCell.border?.left?.style).toBe('thin');
    expect(createdCell.border?.bottom?.style).toBe('thin');
    expect(createdCell.border?.right?.style).toBe('thin');
  });
});
