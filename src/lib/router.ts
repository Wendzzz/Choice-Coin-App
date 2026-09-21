export type Route =
  | { name: 'home' }
  | { name: 'book'; bookId: string }
  | { name: 'session'; bookId: string; day: number };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'home' };

  if (parts[0] === 'book' && parts[1]) {
    if (parts[2] === 'day' && parts[3]) {
      const day = Number.parseInt(parts[3], 10);
      if (Number.isFinite(day)) return { name: 'session', bookId: parts[1], day };
    }
    return { name: 'book', bookId: parts[1] };
  }

  return { name: 'home' };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'book':
      return `#/book/${route.bookId}`;
    case 'session':
      return `#/book/${route.bookId}/day/${route.day}`;
  }
}

export function navigate(route: Route): void {
  window.location.hash = routeToHash(route);
}

export function onRouteChange(handler: (route: Route) => void): void {
  const listener = () => handler(parseHash(window.location.hash));
  window.addEventListener('hashchange', listener);
  listener();
}
