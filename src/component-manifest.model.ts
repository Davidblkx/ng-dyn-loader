import { Type } from '@angular/core';

/** Component manifest to allow to lazy load it  */
export interface ComponentManifest<T, K> {
  loader: () => Promise<T>;
  selector: (e: T) => Type<K>;
}

/**
 * Helper method to create a component manifest
 *
 * Use to lazy load components:
 *
 * createComponentManifest(() => import('./path/to/component'), e => e.Component)
 */
export function createComponentManifest<T, K>(
  loader: () => Promise<T>,
  selector: (e: T) => Type<K>
): ComponentManifest<T, K> {
  return { loader, selector };
}

/** Type guard to check if is a ComponentManifest */
export function isComponentManifest<T, K>(e: unknown): e is ComponentManifest<T, K> {
  return typeof e !== 'undefined'
    && typeof e === 'object'
    && e !== null
    && typeof (<ComponentManifest<T, K>> e).loader === 'function'
    && typeof (<ComponentManifest<T, K>> e).selector === 'function';
}
