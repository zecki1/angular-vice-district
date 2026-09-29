import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ClarityService } from './core/clarity.service';
import { Shell } from './features/layout/shell/shell';

@Component({
  imports: [Shell],
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App {
  private readonly clarityService = inject(ClarityService);

  constructor() {
    this.clarityService.iniciar();
  }
}
