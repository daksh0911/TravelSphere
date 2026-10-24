import { useEffect } from 'react';

const SITE_NAME = 'TravelSphere';

/**
 * Sets the browser tab title for the current page.
 * usePageTitle('Hotels') -> "Hotels | TravelSphere"
 * usePageTitle() with no argument keeps the default site title.
 */
export default function usePageTitle(title) {
  useEffect(() => {
    const previous = document.title;
    if (title) document.title = `${title} | ${SITE_NAME}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
