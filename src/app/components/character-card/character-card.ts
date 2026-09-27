import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface Character {
  nome: string;
  papel: string;
  descricao: string;
  cor: string;
  grau: string;
  capa?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: 'app-character-card',
  styleUrl: './character-card.css',
  templateUrl: './character-card.html',
})
export class CharacterCard {
  readonly character = input.required<Character>();
}