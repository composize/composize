import { element, fragment, inlineStyle, listener, style, text } from './dsl'

describe('DOM DSL', () => {
  it('should create an element with text content', () => {
    const div = element('div', 'hello')

    expect(div.tagName).toBe('DIV')
    expect(div.textContent).toBe('hello')
  })

  it('should create an element with props (class and style) and text content', () => {
    const div = element('div', { class: ['my-class'], style: { backgroundColor: 'red' } }, 'world')
    expect(div.tagName).toBe('DIV')
    expect(div.className).toBe('my-class')
    expect(div.style.backgroundColor).toBe('red')
    expect(div.textContent).toBe('world')
  })

  it('should create an element using a composable function', () => {
    const div = element('div', () => {
      element('span', 'child')
    })
    expect(div.tagName).toBe('DIV')
    expect(div.children.length).toBe(1)
    const span = div.querySelector('span')
    expect(span!.textContent).toBe('child')
  })

  it('should support nested composition', () => {
    const div = element('div', () => {
      element('p', () => {
        element('strong', 'nested text')
      })
    })
    expect(div.tagName).toBe('DIV')
    const strong = div.querySelector('p > strong')
    expect(strong!.textContent).toBe('nested text')
  })

  describe('text', () => {
    it('should append a text node inside an element', () => {
      const div = element('div', () => {
        text('inside text');
      });

      expect(div.textContent).toBe('inside text');
      const child = div.childNodes[0];
      expect(child).toBeInstanceOf(Text);
      expect(child!.textContent).toBe('inside text');
    });

    it('should append multi text nodes inside an element', () => {
      const div = element('div', () => {
        text('inside');
        text('text');
      });

      expect(div.textContent).toBe('insidetext');
      expect(div.childNodes[0]).toBeInstanceOf(Text);
      expect(div.childNodes[0]!.textContent).toBe('inside');
      expect(div.childNodes[1]).toBeInstanceOf(Text);
      expect(div.childNodes[1]!.textContent).toBe('text');
    });
  });

  describe('style', () => {
    it('should create a style element with proper css text', () => {
      const styleElem = style({
        '.example': {
          fontSize: '16px',
          backgroundColor: 'blue',
        },
      });
      expect(styleElem).toBeInstanceOf(HTMLStyleElement);
      const expectedCss = '.example{font-size:16px;background-color:blue;}';
      expect(styleElem!.textContent).toBe(expectedCss);
    });

    it('should append a style element inside an element', () => {
      const div = element('div', () => {
        style({
          '#id': {
            margin: '0',
            padding: '0',
          },
        });
      });
      const styleElem = div.querySelector('style');
      expect(styleElem).toBeInstanceOf(HTMLStyleElement);
      const expectedCss = '#id{margin:0;padding:0;}';
      expect(styleElem!.textContent).toBe(expectedCss);
    });
  });

  describe('fragment', () => {
    it('should create an empty document fragment when no composable is provided', () => {
      const frag = fragment();
      expect(frag).toBeInstanceOf(DocumentFragment);
      expect(frag.childNodes.length).toBe(0);
    });

    it('should execute the composable function and append created nodes to the fragment', () => {
      const frag = fragment(() => {
        text('fragment text');
        element('div', 'inside fragment');
      });

      expect(frag).toBeInstanceOf(DocumentFragment);
      expect(frag.childNodes[0]).toBeInstanceOf(Text);
      expect(frag.childNodes[0]?.textContent).toBe('fragment text');
      expect(frag.childNodes[1]).not.toBeNull();
      expect(frag.childNodes[1]!.textContent).toBe('inside fragment');
    });

    it('should allow nested fragments', () => {
      const frag = fragment(() => {
        fragment(() => {
          text('nested fragment text');
        });
      });

      expect(frag).toBeInstanceOf(DocumentFragment);
      expect(frag.childNodes[0]).toBeInstanceOf(Text);
      expect(frag.childNodes[0]?.textContent).toBe('nested fragment text');
    });

    it('should allow multiple nodes in a fragment', () => {
      const div = element('div', () => {
        fragment(() => {
          text('first text');
          text('third text');
        });
      })

      expect(div.childNodes.length).toBe(2);
      expect(div.childNodes[0]).toBeInstanceOf(Text);
      expect(div.childNodes[0].textContent).toBe('first text');
      expect(div.childNodes[1]).toBeInstanceOf(Text);
      expect(div.childNodes[1].textContent).toBe('third text');
    });

    describe('listener', () => {
      it('should add an event listener to the current element', () => {
        const handler = vi.fn();
        const div = element('div', () => {
          listener('click', handler);
        });

        const clickEvent = new MouseEvent('click');
        div.dispatchEvent(clickEvent);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(clickEvent);
      });

      it('should add an event listener with options', () => {
        const handler = vi.fn();
        const div = element('div', () => {
          listener('click', handler, { once: true });
        });

        const clickEvent1 = new MouseEvent('click');
        div.dispatchEvent(clickEvent1);
        const clickEvent2 = new MouseEvent('click');
        div.dispatchEvent(clickEvent2);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(clickEvent1);
      });

      it('should add multiple event listeners', () => {
        const clickHandler = vi.fn();
        const mouseoverHandler = vi.fn();
        const div = element('div', () => {
          listener('click', clickHandler);
          listener('mouseover', mouseoverHandler);
        });

        const clickEvent = new MouseEvent('click');
        div.dispatchEvent(clickEvent);
        const mouseoverEvent = new MouseEvent('mouseover');
        div.dispatchEvent(mouseoverEvent);

        expect(clickHandler).toHaveBeenCalledTimes(1);
        expect(clickHandler).toHaveBeenCalledWith(clickEvent);
        expect(mouseoverHandler).toHaveBeenCalledTimes(1);
        expect(mouseoverHandler).toHaveBeenCalledWith(mouseoverEvent);
      });

      describe('inlineStyle', () => {
        it('should apply inline styles to the current element', () => {
          const div = element('div', () => {
            inlineStyle({ color: 'red', backgroundColor: 'blue' });
          });
          expect(div.style.color).toBe('red');
          expect(div.style.backgroundColor).toBe('blue');
        });

        it('should override existing styles on the current element', () => {
          const div = element('div', { style: { color: 'green', fontSize: '12px' } }, () => {
            inlineStyle({ color: 'purple', fontWeight: 'bold' });
          });
          expect(div.style.color).toBe('purple');
          expect(div.style.fontSize).toBe('12px');
          expect(div.style.fontWeight).toBe('bold');
        });

        it('should not throw if styles object is empty', () => {
          const div = element('div', () => {
            expect(() => inlineStyle({})).not.toThrow();
          });
          expect(div.style.length).toBe(0);
        });

        it('should only apply styles to the most recently entered element', () => {
          const outerDiv = element('div', () => {
            element('span', () => {
              inlineStyle({ color: 'orange' });
            });
          });
          const innerDiv = outerDiv.querySelector('span');
          expect(innerDiv).not.toBeNull();
          expect((innerDiv as HTMLSpanElement).style.color).toBe('orange');
          expect(outerDiv.style.color).toBe('');
        });
      });
    });
  });
})
