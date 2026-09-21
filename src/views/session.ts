import type { Book, DaySession } from '../types';
import { getProgress } from '../lib/progress';
import { routeToHash } from '../lib/router';
import { escapeHtml } from './home';

export function renderSession(book: Book, session: DaySession): string {
  const progress = getProgress(book.id);
  const isComplete = progress.completedDays.includes(session.day);
  const total = book.days.length;
  const prevDay = session.day > 1 ? session.day - 1 : null;
  const nextDay = session.day < total ? session.day + 1 : null;

  const paragraphs = session.paragraphs
    .map((p) => `<p class="session__paragraph">${escapeHtml(p)}</p>`)
    .join('');

  return `
    <header class="app-header app-header--sub" style="--accent:${book.accent}">
      <a class="back-link" href="${routeToHash({ name: 'book', bookId: book.id })}">&larr; ${escapeHtml(book.title)}</a>
      <p class="app-header__eyebrow">Day ${session.day} of ${total} · ${session.readingMinutes} min</p>
      <h1 class="app-header__title">${escapeHtml(session.title)}</h1>
    </header>
    <main class="session">
      ${paragraphs}
      <div class="session__prompt">
        <p class="session__prompt-label">Reflect</p>
        <p class="session__prompt-text">${escapeHtml(session.prompt)}</p>
      </div>
      <button type="button" class="primary-btn primary-btn--wide" data-action="complete" ${isComplete ? 'disabled' : ''}>
        ${isComplete ? 'Completed ✓' : 'Mark as done'}
      </button>
      <nav class="session__nav">
        ${prevDay ? `<a class="text-link" href="${routeToHash({ name: 'session', bookId: book.id, day: prevDay })}">&larr; Day ${prevDay}</a>` : '<span></span>'}
        ${nextDay ? `<a class="text-link" href="${routeToHash({ name: 'session', bookId: book.id, day: nextDay })}">Day ${nextDay} &rarr;</a>` : '<span></span>'}
      </nav>
    </main>
  `;
}
