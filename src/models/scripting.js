
import {getQuickJS} from 'quickjs-emscripten'


export default (state, emitter) => {
  
  state.scripting = {
    js: null,
    vms: {},
  }


  emitter.on('scripting:eval', async ({code, thread}) => {
    thread = thread || 0

    const vm =
      await getvm(thread)

    const result =
      vm.evalCode(code)

    if (result.error) {
      console.log('Execution failed:', vm.dump(result.error))
      result.error.dispose()
    } else {
      console.log('Success:', vm.dump(result.value))
      result.value.dispose()
    }
  })


  async function getvm(thread) {
    if (!state.scripting.vms[thread]) {
      if (!state.scripting.js) {
        state.scripting.js =
          await getQuickJS()
      }

      const newvm =
        state.scripting.vms[thread] =
          state.scripting.js.createVm()

      return newvm
    }

    return state.scripting.vms[thread]
  }
  
}
