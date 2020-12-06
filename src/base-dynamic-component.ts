import { Observable } from 'rxjs';

import { ComponentDataInit } from './component-data-init.model';

/** Class that can be extended by components to allow to have data injected at creation time */
export abstract class BaseDynamicComponent<T> implements ComponentDataInit<T> {
  private _initData?: T;

  /** Data injected at initialization */
  public get initData(): T | undefined { return this._initData; }

  /** Set initialization data */
  public setInitData(data?: T): void | Promise<void> | Observable<void> {
    this._initData = data;
  }
}
