import type { Meta, StoryObj } from '@storybook/angular';
import { BaseFileUploadComponent } from '../../app/base';

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

export const FieldError: Story = {
  args: { files: [], error: 'At least one recipe file is required before saving.' }
};
export const FieldWarning: Story = {
  args: { files: [], warning: 'Large files may take a few minutes to process.' }
};

export const UploadQueue: Story = {
  args: {
    files: [
      { name: 'recipe-sp7-baseline.json', size: 208 * 1024, progress: 100 },
      { name: 'chamber-a-trace-2026-07.xml', size: 6.2 * 1024 * 1024, progress: 62 },
      { name: 'fleet-export.xlsx', size: 340 * 1024, progress: 0, error: "Rejected — spreadsheets aren't accepted here" }
    ]
  }
};
