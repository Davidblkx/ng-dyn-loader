import { BehaviorSubject } from 'rxjs';

import { ViewContainerRef } from '@angular/core';

/** Contains the ViewContainerRef for a component host */
export interface ComponentHost {
  name: string;
  viewRef: ViewContainerRef;
}

export type ComponentHostCollectionItem = BehaviorSubject<ComponentHost | undefined>;

export type ComponentHostCollection = {
  [name: string]: ComponentHostCollectionItem | undefined;
};

export function isComponentHost(e: unknown): e is ComponentHost {
  return typeof e !== 'undefined'
    && typeof e === 'object'
    && e !== null
    && typeof (<ComponentHost> e).name === 'string'
    && (<ComponentHost> e).viewRef instanceof ViewContainerRef;
}
