import type { Preview } from '@storybook/angular';
import { applicationConfig, componentWrapperDecorator } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import docJson from '../documentation.json';

// Nexus theme (Tailwind v4) is loaded via angular.json's `build` target `styles`
// array (src/styles.css), inherited through the storybook target's `browserTarget`
// — the webpack5 Angular builder runs global styles through Angular's own style
// pipeline, not a plain webpack css-loader, so it must be declared there rather
// than imported here.

setCompodocJson(docJson);

const preview: Preview = {
  parameters: {
    layout: 'padded',
    options: {
      storySort: {
        order: [
          'Introduction',
          [
            'Foundations',
            [
              'Token Architecture',
              'Color',
              'Typography',
              'Spacing & Sizing',
              'Radius & Elevation',
              'Grid & Layout',
              'Iconography',
              'Density & Themes'
            ]
          ],
          'Base',
          ['Actions', 'Forms', 'Feedback', 'Navigation', 'Overlays', 'Data Display', 'Tables & Data', 'Cards & Containers', 'Charts & Visualization'],
          'Widgets',
          'Layout',
          'Shared'
        ]
      }
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  decorators: [
    componentWrapperDecorator((story) => `<div class="font-sans text-slate-800">${story}</div>`),
    // Global app providers every story needs: ng2-charts registerables for
    // `<canvas baseChart>` (ChartWidgetComponent), and a router for anything
    // using routerLink/routerLinkActive (e.g. SidebarComponent).
    applicationConfig({
      providers: [provideCharts(withDefaultRegisterables()), provideRouter([])]
    })
  ]
};

export default preview;
