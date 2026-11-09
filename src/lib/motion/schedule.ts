/** Give the browser an input/paint opportunity between independent motion initializers. */
export function scheduleMotion(setup: () => void | (() => void)): () => void {
  let cleanup: void | (() => void);
  const task = window.setTimeout(() => {
    cleanup = setup();
  }, 0);
  return () => {
    window.clearTimeout(task);
    cleanup?.();
  };
}
