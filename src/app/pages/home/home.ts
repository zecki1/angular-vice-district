import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BannerNovidades } from '../../sections/banner-novidades/banner-novidades';
import { Characters } from '../../sections/characters/characters';
import { Cinema } from '../../sections/cinema/cinema';
import { GalleryHorizontal } from '../../sections/gallery-horizontal/gallery-horizontal';
import { Hero } from '../../sections/hero/hero';
import { Newsletter } from '../../sections/newsletter/newsletter';
import { Preloader } from '../../sections/preloader/preloader';
import { Prologo } from '../../sections/prologo/prologo';
import { Sinopse } from '../../sections/sinopse/sinopse';
import { TrailerModal } from '../../components/trailer-modal/trailer-modal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BannerNovidades,
    Characters,
    Cinema,
    GalleryHorizontal,
    Hero,
    Newsletter,
    Preloader,
    Prologo,
    Sinopse,
    TrailerModal,
  ],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}