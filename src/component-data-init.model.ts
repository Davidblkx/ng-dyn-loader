import { Observable } from 'rxjs';

/** To be implemented by components that what to inject data at instantiation time */
export interface ComponentDataInit<T> {
  setInitData(data?: T): void | Promise<void> | Observable<void>;
}

/** Type guard to check if input is ComponentDataInit */
export function isComponentDataInit<T>(e: unknown): e is ComponentDataInit<T> {
  return typeof e !== 'undefined'
    && typeof e === 'object'
    && e !== null
    && typeof (<ComponentDataInit<T>> e).setInitData === 'function';
}
