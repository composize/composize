type PickWritable<T> = {
  [K in keyof T as IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K>]: T[K];
};

type IfEquals<X, Y, A = X> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : never;

export type NodeProps<K extends keyof HTMLElementTagNameMap> = Partial<
  PickWritable<Omit<HTMLElementTagNameMap[K], 'style'>> & {
    class: string[] | string;
    style: Partial<CSSStyleDeclaration>;
  }
>;

export type Attributes = Record<string, string | number | boolean>;

/**
 * The operations used by the DOM DSL to materialize and mutate nodes.
 *
 * Configure a different renderer with `setupConfig` to intercept or replace
 * these operations. Renderers are expected to preserve the DOM semantics of
 * the nodes they return.
 */
export interface Renderer {
  createElement<K extends keyof HTMLElementTagNameMap>(tag: K): HTMLElementTagNameMap[K];
  createFragment(): DocumentFragment;
  createText(content: string): Text;
  appendChild(parent: ParentNode, child: Node): void;
  setAttribute(node: HTMLElement, name: string, value: string): void;
  setStyle(node: HTMLElement, style: string, value: unknown): void;
  setProperty(node: HTMLElement, name: string, value: unknown): void;
  setValue(node: Node, value: string): void;
  listen(
    node: EventTarget,
    eventName: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean,
  ): () => void;
}

/** The built-in renderer, which delegates to the browser DOM. */
export class DomRenderer implements Renderer {
  createElement<K extends keyof HTMLElementTagNameMap>(tag: K): HTMLElementTagNameMap[K] {
    return document.createElement(tag);
  }

  createFragment(): DocumentFragment {
    return document.createDocumentFragment();
  }

  createText(content: string): Text {
    return document.createTextNode(content);
  }

  appendChild(parent: ParentNode, child: Node): void {
    parent.append(child);
  }

  setAttribute(node: HTMLElement, name: string, value: string): void {
    node.setAttribute(name, value);
  }

  setStyle(node: HTMLElement, style: string, value: unknown): void {
    node.style.setProperty(style, String(value));
  }

  setProperty(node: HTMLElement, name: string, value: unknown): void {
    Reflect.set(node, name, value);
  }

  setValue(node: Node, value: string): void {
    node.textContent = value;
  }

  listen(
    node: EventTarget,
    eventName: string,
    handler: EventListenerOrEventListenerObject,
    options?: AddEventListenerOptions | boolean,
  ): () => void {
    node.addEventListener(eventName, handler, options);
    return () => node.removeEventListener(eventName, handler, options);
  }
}
