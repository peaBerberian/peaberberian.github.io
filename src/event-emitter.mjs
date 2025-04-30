/**
 * Simple Event Emitter abstraction, following the usual HTML way of doing it.
 * Classes that want EventTarget abilities should extend this class.
 *
 * @class EventEmitter.
 */
export default class EventEmitter {
  constructor() {
    /**
     * @type {Object}
     * @private
     */
    this._listeners = {};
  }

  /**
   * Register a new callback for an event.
   *
   * @param {string} evt - The event to register a callback to
   * @param {Function} fn - The callback to call as that event is triggered.
   * The callback will take as argument the eventual payload of the event
   * (single argument).
   */
  addEventListener(evt, fn) {
    const listeners = this._listeners[evt];
    if (!Array.isArray(listeners)) {
      this._listeners[evt] = [fn];
    } else {
      listeners.push(fn);
    }
  }

  /**
   * Unregister callbacks linked to events.
   * @param {string} [evt] - The event for which the callback[s] should be
   * unregistered. Set it to null or undefined to remove all callbacks
   * currently registered (for any event).
   * @param {Function} [fn] - The callback to unregister. If set to null
   * or undefined while the evt argument is set, all callbacks linked to that
   * event will be unregistered.
   */
  removeEventListener(evt, fn) {
    if (evt == null) {
      this._listeners = {};
      return;
    }

    const listeners = this._listeners[evt];
    if (!Array.isArray(listeners)) {
      return;
    }
    if (fn == null) {
      delete this._listeners[evt];
      return;
    }

    const index = listeners.indexOf(fn);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      delete this._listeners[evt];
    }
  }

  /**
   * Trigger every registered callbacks for a given event
   * @param {string} evt - The event to trigger
   * @param {*} arg - The eventual payload for that event. All triggered
   * callbacks will recieve this payload as argument.
   */
  trigger(evt, arg) {
    const listeners = this._listeners[evt];
    if (!Array.isArray(listeners)) {
      return;
    }

    listeners.slice().forEach((listener) => {
      try {
        listener(arg);
      } catch (e) {}
    });
  }
}
