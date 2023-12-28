import { webcomponents } from '@/webcomponents'
import { error } from '@/modules/Logger';

Object.keys(webcomponents).forEach(prefix => {
  webcomponents[prefix].forEach(({ componentName, filePath }) => {
    fetch(`./src/webcomponents/${filePath}?raw`)
      .then(file => file.text())
      .then(component => {
        const fragment = document.createRange().createContextualFragment(component);
        // TODO prevent vite html transformation. Now the first script @vite/client must be ommited.
        const scriptFragment = fragment.querySelectorAll("script")[1];
        const styleFragment = fragment.querySelector("style");
        const templateFragment = fragment.querySelector("template");

        customElements.define(`${prefix}-${componentName}`, class extends HTMLElement {
          static observedAttributes = ["data-state"];
          constructor() {
            super();
            this.attachShadow({ mode: 'open' });
          }
          attributeChangedCallback() {
            this.disconnectedCallback();
            this.connectedCallback();
          }
          connectedCallback() {
            this.hostDataIds = []
            this.dataset.id = Math.random().toString(16).substring(2, 8);
            let hostElement = this;
            while (hostElement && hostElement.dataset.id) {
              this.hostDataIds.push(hostElement.dataset.id);
              hostElement = hostElement.getRootNode().host;
            };
            this.#render();
          }
          disconnectedCallback() {
            const childNodes = Array.from(this.shadowRoot.childNodes);
            childNodes.forEach((childNode) => {
              if (childNode.firstChild instanceof ShadowRoot) {
                childNode.disconnectedCallback(); // not needed, but safe
              } else {
                this.shadowRoot.removeChild(this.shadowRoot.firstChild)
              }
            });
          }
          #render() {
            try {
              if (templateFragment) {
                this.shadowRoot.appendChild(templateFragment.content.cloneNode(true));
              } else {
                throw new Error("At least the template is mandatory for my-" + componentName);
              }
              if (styleFragment) {
                this.shadowRoot.appendChild(styleFragment.cloneNode(true));
              }
              const scriptElement = document.createElement('script');
              scriptElement.setAttribute('type', 'module');
              // Prevent global scope pollution by using an IIFE. Maybe there is a better solution so we can define functions?
              scriptElement.textContent = `
(async function () {
let shadowDocument = document;
for (let hostDataId of '${this.hostDataIds.reverse().toString()}'.split(',')) {
  if (hostDataId != '') {
    shadowDocument = shadowDocument.querySelector('[data-id="' + hostDataId + '"]').shadowRoot;
  }
}
let dataStateAttribute = shadowDocument.host.dataset.state;
if (dataStateAttribute) {
  dataStateAttribute = dataStateAttribute.replace('&quot;', '"');
}
// This helper function can be used inside the components as an abbreviation. You can add more.
function updateState(newState) {
  shadowDocument.host.dataset.state = JSON.stringify(newState);
}
${scriptFragment ? scriptFragment.textContent : ''}
})(); `
              this.shadowRoot.appendChild(scriptElement);
            } catch (e) {
              error(e)
            }
          }
        });
      })
  });
})
