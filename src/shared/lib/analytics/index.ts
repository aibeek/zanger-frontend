// Отправьте тестовое событие
gtag('event', 'test_from_console', {
  event_category: 'Testing',
  event_label: 'Manual Check'
});export { GoogleAnalytics } from "./GoogleAnalytics";
export { PageViewTracker } from "./PageViewTracker";
export { default as usePageView } from "./usePageView";
