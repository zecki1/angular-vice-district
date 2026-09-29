import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-rating',
  template: `
    <div class="rating" role="img" [attr.aria-label]="'Avaliação: ' + value() + ' de ' + max()">
      @for (star of stars(); track $index) {
        <span class="star" [class.filled]="$index < filledStars()" [class.half]="$index === filledStars() && hasHalf()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </span>
      }
    </div>
  `,
  styleUrl: './rating.css',
  host: { class: 'rating-component' },
})
export class RatingComponent {
  readonly value = input.required<number>();
  readonly max = input(5);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly color = input<'gold' | 'purple' | 'cyan' | 'pink'>('gold');

  readonly filledStars = computed(() => Math.floor(this.value()));
  readonly hasHalf = computed(() => this.value() % 1 >= 0.5);
  readonly stars = computed(() => Array.from({ length: this.max() }, (_, i) => i));
}