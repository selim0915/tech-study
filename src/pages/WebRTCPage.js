import { routeConfig } from '../route';
import { Header } from '../layout/Header';
import { createTargetToggleBtn, createLinkItem } from '../webrtc/js/common/toggle-target.js';

export class WebRTCPage {
    constructor(router, samplePath) {
      this.router = router;
      this.samplePath = samplePath; 
    }
  
    render() {
      if (this.samplePath) {
        this._renderSampleView();
      } else {
        this._renderListView();
      }
    }

    async _renderSampleView() {
      const app = document.getElementById('app');
      app.innerHTML = '';
      
      app.style.display = 'flex';
      app.style.flexDirection = 'column';
      app.style.height = '100%';
  
      const headerComp = new Header(this.router, {
        title: `Viewing: ${this.samplePath.split('/').pop()}`,
        backPath: '/webrtc'
      });
      app.appendChild(headerComp.render());

      const contentArea = document.createElement('div');
      contentArea.id = 'sample-content-area';
      contentArea.style.flex = '1';
      contentArea.style.overflowY = 'auto';
      app.appendChild(contentArea);

      try {
        const response = await fetch(this.samplePath);
        if (!response.ok) throw new Error(`Failed to fetch sample: ${response.statusText}`);
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Resolve base path for relative URLs
        const basePath = this.samplePath.substring(0, this.samplePath.lastIndexOf('/') + 1);

        // Inject Body Content
        const bodyContent = doc.body.innerHTML;
        contentArea.innerHTML = bodyContent;

        // Inject External Scripts (to be executed)
        const scripts = Array.from(doc.querySelectorAll('script'));
        for (const script of scripts) {
          const newScript = document.createElement('script');
          
          // Copy attributes
          Array.from(script.attributes).forEach(attr => {
            let value = attr.value;
            // Resolve relative src
            if (attr.name === 'src' && !value.startsWith('http') && !value.startsWith('/')) {
              value = basePath + value;
            }
            newScript.setAttribute(attr.name, value);
          });

          // Handle inline scripts
          if (script.innerText) {
            newScript.innerText = script.innerText;
          }

          // Append to execute
          document.body.appendChild(newScript);
          this.activeScripts = this.activeScripts || [];
          this.activeScripts.push(newScript);
        }

        // Handle CSS Links
        const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
        links.forEach(link => {
          const newLink = document.createElement('link');
          newLink.rel = 'stylesheet';
          let href = link.getAttribute('href');
          if (href && !href.startsWith('http') && !href.startsWith('/')) {
            href = basePath + href;
          }
          newLink.href = href;
          document.head.appendChild(newLink);
          this.activeStyles = this.activeStyles || [];
          this.activeStyles.push(newLink);
        });

      } catch (error) {
        console.error('Error loading sample:', error);
        contentArea.innerHTML = `<div style="padding: 20px; color: red;">Error loading sample: ${error.message}</div>`;
      }
    }
  
    _renderListView() {
      const app = document.getElementById('app');
      app.innerHTML = '';
  
      // Header
      const headerComp = new Header(this.router, {
        title: 'WebRTC Samples',
        showBackBtn: false
      });
      app.appendChild(headerComp.render());

      // Content
      const container = document.createElement('div');
      container.id = 'container';
  
      const introSection = document.createElement('section');
      introSection.innerHTML = `
        <p>
            이는 <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API">WebRTC API</a>의 다양한 부분을 시연하는
            여러 작은 예제들의 모음입니다. 모든 예제의 코드는
            <a href="https://github.com/webrtc/samples">GitHub 저장소</a>에서 확인할 수 있습니다.
        </p>
        <p>
            대부분의 예제는 사양 변경이나 브라우저별 프리픽스 차이를 보완하기 위한 작은 라이브러리(shim)인
            <a href="https://github.com/webrtc/adapter">adapter.js</a>를 사용합니다.
        </p>
        <p>
            <a href="https://webrtc.org/getting-started/testing" title="Command-line flags for WebRTC testing">
                https://webrtc.org/getting-started/testing
            </a>
            에서는 Chrome에서 개발 및 테스트할 때 유용한 커맨드라인 플래그 목록을 확인할 수 있습니다.
        </p>
        <p>
            패치나 이슈 제보는 언제든 환영합니다! 자세한 내용은
            <a href="https://github.com/webrtc/samples/blob/gh-pages/CONTRIBUTING.md">CONTRIBUTING.md</a>
            를 참고하세요.
        </p>
        <p class="warning">
            <strong>경고:</strong> 테스트 중에는 반드시 헤드폰 사용을 권장합니다.
            그렇지 않으면 시스템에서 큰 오디오 피드백이 발생할 수 있습니다.
        </p>
      `;
      container.appendChild(introSection);
  
      const samplesSection = document.createElement('section');
      routeConfig.forEach(section => {
        const h2 = document.createElement('h2');
        h2.textContent = section.title;
        samplesSection.appendChild(h2);
  
        const ul = document.createElement('ul');
        section.items.forEach(item => {
           createLinkItem(ul, item.text, item.href, this.router, '/webrtc');
        });
        samplesSection.appendChild(ul);
      });
      container.appendChild(samplesSection);
 
      const targetToggleBtn = createTargetToggleBtn((target) => {
        const links = document.querySelectorAll('a');
        links.forEach(link => {
          link.target = target;
        });
      });
      container.appendChild(targetToggleBtn);
  
      // 최종 렌더링
      app.appendChild(container);
    }

    unmount() {
      // Cleanup dynamically added scripts
      if (this.activeScripts) {
        this.activeScripts.forEach(script => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        });
        this.activeScripts = [];
      }

      // Cleanup dynamically added styles
      if (this.activeStyles) {
        this.activeStyles.forEach(style => {
          if (style.parentNode) {
            style.parentNode.removeChild(style);
          }
        });
        this.activeStyles = [];
      }
    }
}
