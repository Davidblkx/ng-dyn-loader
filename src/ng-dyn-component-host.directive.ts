import { Directive, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';

import { ComponentHost } from './component-host.model';
import { NgDynComponentHostService } from './ng-dyn-component-host.service';
import { DEFAULT_HOST_NAME } from './ng-dyn-component-loader.tokens';

@Directive({ selector: '[ngComponentHost]' })
export class NgDynComponentHostDirective implements OnInit, OnDestroy {
  @Input()
  /** name to register host view container */
  public hostName = DEFAULT_HOST_NAME;

  @Input()
  /** if true, tries to override previous host */
  public overrideHost = false;

  /** True if registration was successful */
  public get isRegistered(): boolean { return this._isRegistered; }

  private _isRegistered = false;

  public constructor(
    private readonly _container: ViewContainerRef,
    private readonly _hostService: NgDynComponentHostService,
  ) {}

  /** Register it on init */
  public ngOnInit(): void {
    this._isRegistered = this._hostService
      .register(this.buildComponentHost(), this.overrideHost);
  }

  /** Unregistered at destroy time */
  public ngOnDestroy(): void {
    this._hostService.unregister(this.hostName);
  }

  private buildComponentHost(): ComponentHost {
    return {
      name: this.hostName,
      viewRef: this._container,
    };
  }
}
