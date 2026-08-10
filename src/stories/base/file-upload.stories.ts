import type { Meta, StoryObj } from '@storybook/angular';
import { BaseFileUploadComponent } from '../../app/base';

/** Drag-and-drop upload zone; each file gets its own row with a progress bar. */
const meta: Meta<BaseFileUploadComponent> = {
  title: 'Base/Forms/File Upload',
  component: BaseFileUploadComponent,
  tags: ['autodocs'],
  args: {
    label: '',
    accept: 'CSV, XLSX',
    maxSizeMb: 25,
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
