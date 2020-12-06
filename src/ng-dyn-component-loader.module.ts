import { NgModule } from '@angular/core';

import { NgDynComponentHostDirective } from './ng-dyn-component-host.directive';
import { NgDynComponentLoaderService } from './ng-dyn-component-loader.service';

@NgModule({
  declarations: [NgDynComponentHostDirective],
  providers: [NgDynComponentLoaderService],
  exports: [NgDynComponentHostDirective]
})
export class NgDynComponentLoaderModule {}
