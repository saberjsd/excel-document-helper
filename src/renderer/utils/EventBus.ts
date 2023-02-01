const EventEmitter = require('eventemitter3');

class EventBus extends EventEmitter {
  // emitter.addListener(eventName, listener)
  // emitter.emit(eventName[, ...args])
  // emitter.eventNames()
  // emitter.getMaxListeners()
  // emitter.listenerCount(eventName)
  // emitter.listeners(eventName)
  // emitter.off(eventName, listener)
  // emitter.on(eventName, listener)
  // emitter.once(eventName, listener)
  // emitter.prependListener(eventName, listener)
  // emitter.prependOnceListener(eventName, listener)
  // emitter.removeAllListeners([eventName])
  // emitter.removeListener(eventName, listener)
}

export enum EVENT_CONSTANT {
  DAILOG_RENDERED = "dailog_rendered"
}

export default new EventBus()
