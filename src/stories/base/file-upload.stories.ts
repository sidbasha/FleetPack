import type { Meta, StoryObj } from '@storybook/angular';
import { BaseFileUploadComponent } from '../../app/base';

/** Drag-and-drop upload zone; each file gets its own row with a progress bar. The dropzone
 *  itself has three states — rest, drag-over, and (with [acceptTypes] set) a drag-time
 *  rejection preview for the wrong file type — try dragging a non-JSON/XML file over the
 *  zone below in the canvas to see it live; a static screenshot can't show a drag gesture. */
const meta: Meta<BaseFileUploadComponent> = {
  title: 'Base/Forms/File Upload',
  component: BaseFileUploadComponent,
  tags: ['autodocs'],
  args: {
    label: '',
    accept: 'JSON, XML',
    acceptTypes: ['application/json', 'text/xml', 'application/xml'],
    maxSizeMb: 20,
    files: [{ name: 'config_export.csv', size: 128000, progress: 64 }]
  }
};
export default meta;
type Story = StoryObj<BaseFileUploadComponent>;

export const Default: Story = {};
export const Empty: Story = { args: { files: [] } };
export const WithError: Story = {
  args: { files: [{ name: 'config_export.csv', size: 128000, progress: 0, error: 'File exceeds 25MB limit' }] }
};

/** The upload queue's three row states side by side. */
export const UploadQueue: Story = {
  args: {
    files: [
      { name: 'recipe-sp7-baseline.json', size: 208 * 1024, progress: 100 },
      { name: 'chamber-a-trace-2026-07.xml', size: 6.2 * 1024 * 1024, progress: 62 },
      { name: 'fleet-export.xlsx', size: 340 * 1024, progress: 0, error: "Rejected — spreadsheets aren't accepted here" }
    ]
  }
};
