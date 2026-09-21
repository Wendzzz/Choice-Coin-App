import { books } from '../data/books';
import { getProgress } from '../lib/progress';
import { routeToHash } from '../lib/router';

export function renderHome(): string {
  const cards = books
    .map((book) => {
      const progress = getProgress(book.id);
      const total = book.days.length;
      const done = progress.completedDays.length;
      const pct = Math.round((done / total) * 100);
      const started = done > 0;

      return `
        <a class="book-card" href="${routeToHash({ name: 'book', bookId: book.id })}" style="--accent:${book.accent}">
          <div class="book-card__top">
            <span class="book-card__theme">${escapeHtml(book.theme)}</span>
            <span class="book-card__days">${total} day${total === 1 ? '' : 's'}</span>
          </div>
          <h2 class="book-card__title">${escapeHtml(book.title)}</h2>
          <p class="book-card__desc">${escapeHtml(book.description)}</p>
          <div class="progress-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar__fill" style="width:${pct}%"></div>
          </div>
          <span class="book-card__status">${started ? `${done}/${total} sessions done` : 'Start plan'}</span>
        </a>
      `;
    })
    .join('');

  return `
    <header class="app-header">
      <p class="app-header__eyebrow">Mindleaf</p>
      <h1 class="app-header__title">Your daily reading</h1>
      <p class="app-header__subtitle">Short guided sessions from books worth sitting with.</p>
    </header>
    <main class="book-list">
      ${cards}
    </main>
  `;
}

export function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}
