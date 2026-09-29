import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParallaxDirective } from '../../shared/directives/parallax.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ParallaxDirective],
  selector: 'app-prologo',
  styleUrl: './prologo.css',
  templateUrl: './prologo.html',
})
export class Prologo {
  readonly passos = [
    'Uma cidade erguida sobre sonhos e cinza.',
    'Cinco pessoas. Um escândalo. Uma noite.',
    'No Vice District, o sol se põe uma vez por ano.',
  ];
}