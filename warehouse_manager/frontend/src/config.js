export const API_URL = process.env.REACT_APP_API_URL || '';
export const WS_URL =
  process.env.REACT_APP_WS_URL ||
  (window.location.protocol === "https:"
    ? `wss://${window.location.hostname}:8000`
    : `ws://${window.location.hostname}:8000`);
