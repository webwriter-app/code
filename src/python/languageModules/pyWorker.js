export default URL.createObjectURL(new Blob([function () {
  let resMessage = ''
  if (typeof importScripts === 'function') {
    // eslint-disable-next-line no-undef
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.3/full/pyodide.js')
    async function loadPyodideAndPackages () {
      // eslint-disable-next-line no-undef
      self.pyodide = await loadPyodide()
      self.pyodide.setStdout({ batched: (msg) => { resMessage += msg + '\n' } })
    }
    const pyodideReadyPromise = loadPyodideAndPackages()

    self.onmessage = async (event) => {
      await pyodideReadyPromise
      const { id, python, ...context } = event.data
      for (const key of Object.keys(context)) {
        self[key] = context[key]
      }
      try {
        await self.pyodide.loadPackagesFromImports(python)
        await self.pyodide.runPythonAsync(python)
        self.postMessage({ results: resMessage, id })
        resMessage = ''
      } catch (error) {
        self.postMessage({ error: error.message, id })
      }
    }
  }
}.toString().replace('let', ' let').slice(12, -1)], { type: 'text/javascript' }))
