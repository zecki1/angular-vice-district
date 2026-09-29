import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/layout/shell/shell').then(m => m.Shell),
    children: [
      { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent), title: 'GameHub - Sua central de jogos' },
      { path: 'noticias', loadComponent: () => import('./features/news/news.component').then(m => m.NewsComponent), title: 'Notícias - GameHub' },
      { path: 'lancamentos', loadComponent: () => import('./features/releases/releases.component').then(m => m.ReleasesComponent), title: 'Lançamentos - GameHub' },
      { path: 'jogos', loadComponent: () => import('./features/games/games.component').then(m => m.GamesComponent), title: 'Catálogo de Jogos - GameHub' },
      { path: 'ofertas', loadComponent: () => import('./features/deals/deals.component').then(m => m.DealsComponent), title: 'Ofertas - GameHub' },
      { path: 'gratis', loadComponent: () => import('./features/free-games/free-games.component').then(m => m.FreeGamesComponent), title: 'Jogos Grátis - GameHub' },
      { path: 'jogo/:id', loadComponent: () => import('./features/game-detail/game-detail.component').then(m => m.GameDetailComponent), title: 'Detalhes do Jogo - GameHub' },
      { path: 'mini-games', loadComponent: () => import('./features/mini-games/mini-games.component').then(m => m.MiniGamesComponent), title: 'Mini-Games - GameHub' },
    ],
  },
  { path: '**', redirectTo: '' },
];