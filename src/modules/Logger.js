const LOG_LEVEL = 2; // 2 ERROR, 4 INFO, 5 DEBUG

export function log(...args) {
  if (LOG_LEVEL >= 4) {
    console.log(...args)
  }
}

export function error(...args) {
  if (LOG_LEVEL >= 2) {
    console.error(...args);
  }
}

export function debug(...args) {
  if (LOG_LEVEL >= 5) {
    // Log level: verbose must be turned on in Dev Tools
    console.debug(...args);
  }
}