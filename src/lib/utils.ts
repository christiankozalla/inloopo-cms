export function debounce(handler: (event: Event) => void, delay = 500) {
  let timeout: NodeJS.Timeout;

  return (event: Event) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => handler(event), delay);
  };
}

export function throttle(
  handler: (event: Event) => void,
  { maxCalls = 50, duration = 500 },
) {
  let calls = 0;
  let lastCallTime = Date.now();
  return (event: Event) => {
    if (calls < maxCalls && Date.now() - lastCallTime < duration) {
      calls++;
      handler(event);
    } else if (Date.now() - lastCallTime > duration) {
      calls = 0;
      lastCallTime = Date.now();
    }
  };
}
