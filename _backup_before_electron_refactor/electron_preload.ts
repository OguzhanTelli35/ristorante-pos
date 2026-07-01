import { contextBridge, ipcRenderer } from 'electron';

// Expose protected APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Placeholder for future native features
  platform: process.platform,

  // Future: Printer integration
  // print: (data: unknown) => ipcRenderer.invoke('print', data),

  // Future: File system access
  // saveFile: (data: unknown) => ipcRenderer.invoke('save-file', data),
});
