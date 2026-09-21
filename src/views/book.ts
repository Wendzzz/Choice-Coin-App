import type { Book } from '../types';
import { getProgress, nextIncompleteDay } from '../lib/progress';
import { routeToHash } from '../lib/router';
import { escapeHtml } from './home';

export function renderBook(book: Book): string {
  const progress = getProgress(book.id);
  const total = book.days.length;
  const done = progress.completedDays.length;
  const resumeDay = nextIncompleteDay(book.id, total);
  const allDone = done === total;

  const dayRows = book.days
    .map((day) => {
      const isComplete = progress.completedDays.includes(day.day);
      const isNext = !isComplete && day.day === resumeDay;
      return `
        <a class="day-row ${isComplete ? 'day-row--done' : ''} ${isNext ? 'day-row--next' : ''}"
           href="${routeToHash({ name: 'session', bookId: book.id, day: day.day })}">
          <span class="day-row__marker" aria-hidden="true">${isComplete ? '✓' : day.day}</span>
          <span class="day-row__body">
            <span class="day-row__title">${escapeHtml(day.title)}</span>
            <span class="day-row__meta">Day ${day.day} · ${day.readingMinutes} min</span>
          </span>
        </a>
      `;
    })
    .join('');

  return `
    <header class="app-header app-header--sub" style="--accent:${book.accent}">
      <a class="back-link" href="${routeToHash({ name: 'home' })}">&larr; All plans</a>
      <p class="app-header__eyebrow">${escapeHtml(book.theme)}</p>
      <h1 class="app-header__title">${escapeHtml(book.title)}</h1>
      <p class="app-header__subtitle">${escapeHtml(book.description)}</p>
      <a class="primary-btn" href="${routeToHash({ name: 'session', bookId: book.id, day: resumeDay })}">
        ${allDone ? 'Read again' : done > 0 ? `Continue · Day ${resumeDay}` : 'Start Day 1'}
      </a>
    </header>
    <main class="day-list">
      ${dayRows}
    </main>
  `;
}
