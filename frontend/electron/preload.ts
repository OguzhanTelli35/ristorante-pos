import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Expose electron-toolkit's standard API
contextBridge.exposeInMainWorld('electron', electronAPI);

// Expose protected APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Placeholder for future native features
  platform: process.platform,

  // Future: Printer integration
  // print: (data: unknown) => ipcRenderer.invoke('print', data),

  // Future: File system access
  // saveFile: (data: unknown) => ipcRenderer.invoke('save-file', data),
});
