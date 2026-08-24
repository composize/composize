import type { Renderer } from './renderer';

export interface Config {
  /** Renderer used by all DSL operations after this configuration is applied. */
  renderer: Renderer;
}

let renderer: Renderer | undefined;

/**
 * Configures the DOM DSL globally.
 *
 * Call this before using the DSL, for example with `new DomRenderer()`.
 */
export function setupConfig(config: Config): void {
  renderer = config.renderer;
}

export function getRenderer(): Renderer {
  if (!renderer) {
    throw new Error('Renderer is not configured');
  }
  return renderer;
}
