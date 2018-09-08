import React from 'react'
import { render } from 'react-dom'
import { action } from 'mobx'
import { observer } from 'mobx-react'

import Module from './data/Module.js'
import ModuleList from './data/ModuleList.js'
import ModuleListView from './Components/ModuleList.jsx'

import SAMPLE_DATA from './sample.js'

const store = new ModuleList()
Object.entries(SAMPLE_DATA).forEach(([k, v]) =>
  store.modules.push(
    new Module({
      MAC: k,
      ...v
    })
  )
)
//console.log(store.modules.slice())
let idx = 2
const App = observer(() => (
  <React.Fragment>
    <a
      className="button is-warning"
      onClick={action(e => {
        e.preventDefault()
        store.modules.push(
          new Module({
            MAC: `aa:82:96:eb:f3:8${idx}`,
            name: `Switch_${idx}`,
            ip: `192.168.4.${idx}`,
            uiClassName: 'switchUIClass',
            customData: '{"status": "on"}',
            pong: Math.floor(Math.random() * Math.floor(2))
          })
        )
        idx++
      })}
    >
      Add dynamic fake module
    </a>
    <div className="container">
      <ModuleListView moduleList={store} />
    </div>
  </React.Fragment>
))

render(<App />, document.getElementById('app'))
if (process.env.NODE_ENV === 'development') {
  // DEBUG: expose the store (module list in window to test outside of the UI)
  // Ex: window.store.modules[0].customData.speed = "5"
  window.store = store
}
