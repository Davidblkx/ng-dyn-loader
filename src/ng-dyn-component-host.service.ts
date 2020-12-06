import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Injectable, ViewContainerRef } from '@angular/core';

import {
    ComponentHost, ComponentHostCollection, ComponentHostCollectionItem, isComponentHost
} from './component-host.model';

/** Service to register/unregister component hosts */
@Injectable({ providedIn: 'root' })
export class NgDynComponentHostService {
  /** Collection of hosts */
  private readonly _hosts: ComponentHostCollection = {};

  /** This prevents that multiple hosts are added for the same name without being cleared first */
  public allowToOverrideHost = false;

  /** Only works if AllowToOverrideHost is false,
   * throws an error if name already exists when adding a new host,
   * if false, only a warning is logged into the console
   */
  public throwOnOverride = true;

  /**
   * Try to register a new host
   *
   * @param host the host to register
   * @param override if false only register if name is new, this doesn't override the AllowToOverrideHost
   */
  public register(host: ComponentHost, override = true): boolean {
    const canAddHost = this.checkCanAddHost(host, override);

    if (canAddHost) {
      this.getHost(host.name).next(host);
    }

    return canAddHost;
  }

  /**
   * Clear a host and remove it from the collection
   *
   * @param name name of host to remove
   */
  public unregister(name: string): boolean {
    const host = this._hosts[name];
    if (!host) { return false; }

    this.getHost(name).next(undefined);

    return true;
  }

  /**
   * Check if name has a host
   *
   * @param name the name to search for
   */
  public contains(name: string): boolean {
    return typeof this._hosts[name]?.value !== 'undefined';
  }

  /**
   * Get the host ViewContainerRef for a name
   *
   * @param name name of host to listen to
   */
  public getContainer(name: string): Observable<ViewContainerRef> {
    return this.getHost(name).pipe(
      filter(isComponentHost),
      map(e => e.viewRef)
    );
  }

  /** Returns subject for an host */
  public getHost(name: string): ComponentHostCollectionItem {
    let item = this._hosts[name];
    if (!item) {
      item = new BehaviorSubject<ComponentHost | undefined>(undefined);
      this._hosts[name] = item;
    }
    return item;
  }

  /** Clear container for a host name */
  public clear(name: string): boolean {
    const host = this.getHost(name);
    if (!host.value) { return false; }

    host.value.viewRef.clear();
    return true;
  }

  /** Check if host can be added */
  private checkCanAddHost(host: ComponentHost, override = true): boolean {
    const errorMessage = `${host.name} is already a registered host, please unregister it first`;
    const exists = this.contains(host.name);

    // throw error if exists
    if (exists && !this.allowToOverrideHost && this.throwOnOverride) {
      throw new Error(errorMessage);
    }

    if (exists && (!this.allowToOverrideHost || !override)) {
      console.warn(errorMessage);
      return false;
    }

    return true;
  }
}
