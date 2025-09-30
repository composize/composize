import { advance, borderedCell, cell, centeredCell, row, workbook, worksheet } from './dsl';

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

  it('should create a centered cell with thin borders and centered alignment', () => {
    const book = workbook(() => {
      row(() => {
        centeredCell('centered', { numFmt: '0.00%' });
      });
    });

    const sheet = book.worksheets[0];
    const createdCell = sheet.getRow(1).getCell(1);

    expect(createdCell.value).toBe('centered');
    expect(createdCell.numFmt).toBe('0.00%');
    expect(createdCell.border?.top?.style).toBe('thin');
    expect(createdCell.border?.left?.style).toBe('thin');
    expect(createdCell.border?.bottom?.style).toBe('thin');
    expect(createdCell.border?.right?.style).toBe('thin');
    expect(createdCell.alignment?.horizontal).toBe('center');
    expect(createdCell.alignment?.vertical).toBe('middle');
  });

  it('advance should move to the next column when inside a row', () => {
    const book = workbook(() => {
      row(() => {
        cell('a');
        advance();
        cell('b');
      });
    });

    const sheet = book.worksheets[0];

    expect(sheet.getRow(1).getCell(1).value).toBe('a');
    expect(sheet.getRow(1).getCell(2).value).toBeFalsy();
    expect(sheet.getRow(1).getCell(3).value).toBe('b');
  });

  it('advance should move to the next row when used outside of a row (suspended rows)', () => {
    const book = workbook(() => {
      advance();
      row(() => {
        cell('x');
      });
    });
    const sheet = book.worksheets[0];

    expect(sheet.getRow(1).getCell(1).value).toBeFalsy();
    expect(sheet.getRow(2).getCell(1).value).toBe('x');
  });

  it('advance with negative steps should move multiple columns or rows', () => {
    const book = workbook(() => {
      row(() => {
        cell('c1');
        advance(2); // move to cell 4
        cell('c4');
      });
      advance(2); // move to row 4
      row(() => {
        cell('r4c1');
      });
    });
    const sheet = book.worksheets[0];

    expect(sheet.getRow(1).getCell(1).value).toBe('c1');
    expect(sheet.getRow(1).getCell(4).value).toBe('c4');
    expect(sheet.getRow(4).getCell(1).value).toBe('r4c1');
  });

  it('should support advance across multiple worksheets', () => {
    const book = workbook(() => {
      worksheet('Sheet 1', () => {
        advance();
        row(() => {
          cell('Data 1');
        });
      });

      worksheet('Sheet 2', () => {
        row(() => {
          advance();
          cell('Data 2');
        });
      });
    });

    expect(book.worksheets[0].getRow(1).getCell(1).value).toBeFalsy();
    expect(book.worksheets[0].getRow(2).getCell(1).value).toBe('Data 1');

    expect(book.worksheets[1].getRow(1).getCell(1).value).toBeFalsy();
    expect(book.worksheets[1].getRow(1).getCell(2).value).toBe('Data 2');
  })

  it('should be support advance with negative steps', () => {
    const book = workbook(() => {
      advance(2);
      advance(-1);
      row(() => {
        advance(2);
        advance(-1);
        cell('Data 2');
      });
    });

    expect(book.worksheets[0].getRow(1).getCell(1).value).toBeFalsy();
    expect(book.worksheets[0].getRow(2).getCell(1).value).toBeFalsy();
    expect(book.worksheets[0].getRow(2).getCell(2).value).toBe('Data 2');
  });
});
