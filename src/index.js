import { Router } from './router';
import { RootPage } from './pages/RootPage';
import { WebRTCPage } from './pages/WebRTCPage';
import './webrtc/js/common/ga';

window.addEventListener('DOMContentLoaded', () => {
  console.log('0.0.0.6');
  
  // Inject global styles
  if (!document.getElementById('global-styles')) {
    const link1 = document.createElement('link');
    link1.id = 'global-styles';
    link1.rel = 'stylesheet';
    link1.href = '/src/webrtc/css/main.css';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.href = '/src/webrtc/css/toggle-target.css';
    document.head.appendChild(link2);
  }

  // Router Setup
  const router = new Router({
    '/': (r) => new RootPage(r),
    '/webrtc': (r, path) => new WebRTCPage(r, path),
  });

  window.router = router;
});
