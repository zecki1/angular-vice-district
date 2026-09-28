import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface MiniGame {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  time: string;
  color: string;
  component: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: string;
}

@Component({
  selector: 'app-mini-games',
  imports: [CommonModule, RouterLink],
  templateUrl: './mini-games.component.html',
  styleUrl: './mini-games.component.css',
  host: { class: 'mini-games-page' },
})
export class MiniGamesComponent {
  readonly games: MiniGame[] = [
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Teste sua memória combinando pares de ícones de jogos clássicos. Quanto mais rápido, melhor!',
      icon: '🧠',
      category: 'Memória',
      time: '2-5 min',
      color: 'purple',
      component: 'MemoryGameComponent',
    },
    {
      id: 'clicker',
      title: 'Cookie Clicker RPG',
      description: 'Clique, evolua e desbloqueie itens lendários. Um idle game viciante com tema gamer.',
      icon: '🍪',
      category: 'Idle/Clicker',
      time: '∞',
      color: 'pink',
      component: 'ClickerGameComponent',
    },
    {
      id: 'quiz',
      title: 'Game Trivia',
      description: 'Quanto você sabe sobre jogos? Responda perguntas sobre lançamentos, história e curiosidades.',
      icon: '❓',
      category: 'Quiz',
      time: '3-5 min',
      color: 'cyan',
      component: 'QuizGameComponent',
    },
    {
      id: 'reaction',
      title: 'Reaction Test',
      description: 'Teste seus reflexos! Clique o mais rápido possível quando a cor mudar. Compare com amigos.',
      icon: '⚡',
      category: 'Reflexo',
      time: '1-2 min',
      color: 'orange',
      component: 'ReactionGameComponent',
    },
    {
      id: 'snake',
      title: 'Retro Snake',
      description: 'O clássico Snake com visual retrô. Coma pixels, cresça e não bata nas paredes!',
      icon: '🐍',
      category: 'Arcade',
      time: '2-10 min',
      color: 'green',
      component: 'SnakeGameComponent',
    },
    {
      id: '2048',
      title: '2048 Games Edition',
      description: 'Combine tiles de jogos famosos para chegar no tile 2048. Versão temática do clássico puzzle.',
      icon: '🔢',
      category: 'Puzzle',
      time: '5-15 min',
      color: 'gold',
      component: 'Game2048Component',
    },
  ];

  readonly selectedCategory = signal<string>('all');
  readonly categories = computed(() => ['all', ...new Set(this.games.map(g => g.category))]);

  readonly filteredGames = computed(() => {
    if (this.selectedCategory() === 'all') return this.games;
    return this.games.filter(g => g.category === this.selectedCategory());
  });

  selectCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  getMockLeaderboard(): LeaderboardEntry[] {
    return [
      { rank: 1, name: 'PlayerOne', score: '987,654' },
      { rank: 2, name: 'GameMaster', score: '876,543' },
      { rank: 3, name: 'SpeedRunner', score: '765,432' },
      { rank: 4, name: 'ProGamer99', score: '654,321' },
      { rank: 5, name: 'CasualPlayer', score: '543,210' },
    ];
  }
}