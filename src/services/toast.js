// Tiny event bus: toast('Saved Kyoto', { actionLabel: 'Undo', onAction: () => {} })
export const toast = (message, options = {}) => {
  window.dispatchEvent(new CustomEvent('ts:toast', { detail: { message, ...options } }));
};
export default toast;
