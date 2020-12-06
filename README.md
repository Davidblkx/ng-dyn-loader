# NgDynComponentLoader

Library to dynamically load angular components at runtime, it only supports angular since `IVY`

## Why

I had to it multiple time for projects in different clients, so decided to spent a weekend creating a open source solution to save me some time in future and was also an opportunity to try the new component lazy load (spoiler: its really easy to use)

## Install

`npm install ng-dyn-component-loader`
or
`yarn add ng-dyn-component-loader`

## Quick-start

1 - Import `NgDynComponentLoaderModule` in your app module

```Typescript
import { NgDynComponentLoaderModule } from 'ng-dyn-component-loader';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    NgDynComponentLoaderModule,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

2 - Declare one or multiple hosts to render the components

```Html
<ng-template ngComponentHost></ng-template>
<ng-template ngComponentHost hostName="otherHost" ></ng-template>
```

3 - Use `NgDynComponentHostService` to load components

```Typescript
import { NgDynComponentLoaderService } from 'ng-dyn-component-loader';

...

constructor(private readonly _loader: NgDynComponentLoaderService) {}

public loadComponentInDefaultHost() {
  this._loader.load(ComponentToRender).subscribe(c => {
    // Do something with component instance
  })
}

public loadComponentInOtherHost() {
  this._loader.load(ComponentToRender, undefined, 'otherHost').subscribe(c => {
    // Do something with component instance
  })
}
```
___

## Inject data when loading a component

Sometimes is handy to inject some data in a component when instantiating it, we could just create a specific function for each component or use a service, but I needed to do this enough times to decided to add a default way to do it.

1 - In you component extend `BaseDynamicComponent<T>` with `T` being the type of data, to access the data just call `initData`.

```Typescript
@Component({ template: `<p>{{message}}</p>` })
export class MessageComponent extends BaseDynamicComponent<{ message: string }> {
  public get message(): string {
    return this.initData?.message ?? 'no message';
  }
}
```

2 - During load, pass the data

```Typescript
import { NgDynComponentLoaderService } from 'ng-dyn-component-loader';

...

constructor(private readonly _loader: NgDynComponentLoaderService) {}

public showMessage() {
  this._loader.load(MessageComponent, { message: 'Hello World' }).subscribe(c => {
    // Do something with component instance
  })
}
```
___
###  Lazy load components

1 - Create a component but don't add it to any module

```Typescript
import { Component } from '@angular/core';

@Component({ template: `<div>lazy load component</div>` })
export class LazyLoadComponent { }
```

2 - Load it using the `createComponentManifest` helper

```Typescript
import { createComponentManifest, NgDynComponentLoaderService } from 'ng-dyn-component-loader';

...

constructor(private readonly _loader: NgDynComponentLoaderService) {}

public lazyLoadComponent() {
  const manifest = createComponentManifest(
    () => import('./lazy-load.component'),
    e => e.LazyLoadComponent
  );

  this._loader.load(manifest).subscribe();
}
```
