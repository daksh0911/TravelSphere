export function openTripStudio() {
  if (typeof window !== 'undefined') {
    window.location.hash = '#/itinerary-planner';
    window.dispatchEvent(new CustomEvent('travelsphere:open-studio'));
  }
}
export function openCommandPalette() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('travelsphere:open-command'));
  }
}
