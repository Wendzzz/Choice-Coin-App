import './style.css';
import { getBook } from './data/books';
import { markDayComplete, markDayOpened } from './lib/progress';
import { onRouteChange, type Route } from './lib/router';
import { renderHome } from './views/home';
import { renderBook } from './views/book';
import { renderSession } from './views/session';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app root element');

function render(route: Route): void {
  switch (route.name) {
    case 'home': {
      app!.innerHTML = renderHome();
      break;
    }
    case 'book': {
      const book = getBook(route.bookId);
      app!.innerHTML = book ? renderBook(book) : notFound();
      break;
    }
    case 'session': {
      const book = getBook(route.bookId);
      const session = book?.days.find((d) => d.day === route.day);
      if (book && session) {
        markDayOpened(book.id, session.day);
        app!.innerHTML = renderSession(book, session);
      } else {
        app!.innerHTML = notFound();
      }
      break;
    }
  }
  window.scrollTo({ top: 0 });
}

function notFound(): string {
  return `
    <main class="not-found">
      <h1>Not found</h1>
      <p>That plan or session doesn't exist.</p>
      <a class="text-link" href="#/">Back to your plans</a>
    </main>
  `;
}

app.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>('[data-action="complete"]');
  if (!button) return;

  const route = parseCurrentRoute();
  if (route.name !== 'session') return;

  markDayComplete(route.bookId, route.day);
  render(route);
});

function parseCurrentRoute(): Route {
  const hash = window.location.hash;
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'book' && parts[1] && parts[2] === 'day' && parts[3]) {
    return { name: 'session', bookId: parts[1], day: Number.parseInt(parts[3], 10) };
  }
  return { name: 'home' };
}

onRouteChange(render);
