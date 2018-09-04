import { observable, action, computed } from 'mobx'

function buildCustomModulePath(name = '') {
  return `Customs/${name.charAt(0).toUpperCase() + name.slice(1)}.jsx`
}

class Module {
  @computed
  get id() {
    return 'M' + this.MAC.replace(/:/g, '_')
  }

  @computed
  get disabled() {
    return this.pong === 0
  }

  @observable MAC = '' // Mac address of the module transformed to be used as id
  @observable name = '' // Name of the module  (can change)
  @observable pong = 0 // 0, 1 or -1: not pinged, ping ok, ping nok

  type = '' // type of the module  (cannot change)
  ssid = '' // Name of the created wifi network
  ip = '' // IP on the Access Point created wifi network
  uiClassName = '' // uiClassName of the module
  heap = 0
  canSleep = false
  alert = false
  alertMsg = ''
  customData = {}

  constructor({
    MAC,
    name,
    pong,
    type,
    ssid,
    ip,
    uiClassName,
    customData = {}
  }) {
    if (!MAC) {
      throw new Error('NoMac')
    }
    this.MAC = MAC
    this.name = name
    this.pong = pong
    this.type = type
    this.ssid = ssid
    this.ip = ip
    this.uiClassName = buildCustomModulePath(uiClassName) // ##
    // Make custom data observable but not that new properties would not be observed
    try {
      this.customData = observable(JSON.parse(customData))
    } catch (e) {
      this.customData = {}
    }
  }

  @action
  rename = newName => {
    this.name = newName
  }

  @action
  turnOff = () => {
    this.pong = 0
  }

  @action
  toggle = () => {
    this.pong = this.pong === 0 ? 1 : 0
  }
}

export default Module
