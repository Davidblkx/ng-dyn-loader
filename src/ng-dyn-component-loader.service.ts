import { from, Observable, of } from 'rxjs';
import { concatMap, map, mergeMap, withLatestFrom } from 'rxjs/operators';

import {
    ComponentFactory, ComponentFactoryResolver, Injectable, Type, ViewContainerRef
} from '@angular/core';

import { ComponentDataInit, isComponentDataInit } from './component-data-init.model';
import { ComponentManifest, isComponentManifest } from './component-manifest.model';
import { NgDynComponentHostService } from './ng-dyn-component-host.service';
import { DEFAULT_HOST_NAME } from './ng-dyn-component-loader.tokens';

/** Allow to dynamically load components at runtime */
@Injectable()
export class NgDynComponentLoaderService {

  public constructor(
    private readonly _hostService: NgDynComponentHostService,
    private readonly _factoryResolver: ComponentFactoryResolver,
  ) { }

  /**
   * Lazy load component
   *
   * @param comp component manifest with component to lazy load
   * @param data is ignored since it doesn't implement ComponentDataInit
   * @param hostName name of host to render in
   */
  public load<T, K>(comp: ComponentManifest<T, K>, data?: undefined, hostName?: string): Observable<K>;
  /**
   * Lazy load component and set initial data
   *
   * @param comp component manifest with component to lazy load
   * @param data data to init
   * @param hostName name of host to render in
   */
  public load<T, K extends ComponentDataInit<D>, D>(comp: ComponentManifest<T, K>, data?: D, hostName?: string): Observable<K>;
  /**
   * Load component
   *
   * @param comp component type to load
   * @param data is ignored since it doesn't implement ComponentDataInit
   * @param hostName name of host to render in
   */
  public load<K>(comp: Type<K>, data?: undefined, hostName?: string): Observable<K>;
  /**
   * Load component and set initial data
   *
   * @param comp component type to load
   * @param data data to init
   * @param hostName name of host to render in
   */
  public load<K extends ComponentDataInit<D>, D>(comp: Type<K>, data?: D, hostName?: string): Observable<K>;
  public load<T, K>(
    comp: Type<K> | ComponentManifest<T, K>,
    data: any,
    hostName = DEFAULT_HOST_NAME
  ): Observable<K> {
    return this.getComponentWithContainer(comp, hostName).pipe(
      mergeMap(([component, container]) => {
        return this.renderComponent(component, data, container);
      })
    );
  }

  /** Render component in container and inject data */
  private renderComponent<T>(component: Type<T>, data: any, container: ViewContainerRef): Observable<T> {
    const ref = container.createComponent(this.getComponentFactory(component));
    const instance = ref.instance;

    if (isComponentDataInit(instance)) {
      return this.setInitData(instance, data)
        .pipe(map(() => instance));
    }

    return of(instance);
  }

  /** Concat component with ViewContainerRef */
  private getComponentWithContainer<T, K>(
    comp: Type<K> | ComponentManifest<T, K>,
    hostName: string
  ): Observable<[Type<K>, ViewContainerRef]> {
    return this.wrapComponent(comp).pipe(
      concatMap(c => of(c).pipe(withLatestFrom(
        this._hostService.getContainer(hostName)
      ))));
  }

  /** Return lazy load observable or wrap component in observable */
  private wrapComponent<T, K>(comp: Type<K> | ComponentManifest<T, K>): Observable<Type<K>> {
    if (isComponentManifest<T, K>(comp)) {
      return this.lazyLoadComponentType(comp);
    }

    return of(comp);
  }

  /** Lazy load a component from manifest */
  private lazyLoadComponentType<T, K>(manifest: ComponentManifest<T, K>)
    : Observable<Type<K>> {
      return from(manifest.loader())
        .pipe(map(e => manifest.selector(e)));
  }

  /** Set initial data for component */
  private setInitData<T>(instance: ComponentDataInit<T>, data?: T): Observable<void> {
    const res = instance.setInitData(data);
    if (res instanceof Observable) {
      return res;
    } else if (res instanceof Promise) {
      return from(res);
    }

    return of();
  }

  /** resolve component factory from current ComponentFactoryResolver */
  private getComponentFactory<T>(component: Type<T>): ComponentFactory<T> {
    return this._factoryResolver.resolveComponentFactory(component);
  }
}
