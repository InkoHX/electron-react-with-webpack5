const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('app', {})
