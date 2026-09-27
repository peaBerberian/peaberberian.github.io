/**
 * IPC-like system allowing apps to exchange messages between one another.
 *
 * Apps need the right permission to be able to register message handler or send
 * messages to them.
 */
export default class Bus {
  constructor() {
    /**
     * Link `appId` to "instance" object.
     *
     * Allows to know remaining apps that may be able to receive a message.
     * @type Map.<string, Object>
     */
    this._receivers = new Map();
  }

  /**
   * @param {string} appId - Identifier for the app requesting bus capabilities.
   * @param {Array.<string>} dependencies - The permissions associated to this app.
   * @param {AbortSignal} signal - Emits when/if the corresponding app closed.
   * @returns {Object} - Callbacks allowing to send/receive message to/from the bus.
   */
  getAPIsFor(appId, dependencies, signal) {
    const api = {};
    if (dependencies.includes("busHandle")) {
      const receiver = { methods: new Map(), signal };
      signal.addEventListener(
        "abort",
        () => {
          const instances = this._receivers.get(appId);
          instances?.delete(receiver);
          if (instances?.size === 0) {
            this._receivers.delete(appId);
          }
        },
        { once: true },
      );
      api.busHandle = (method, handler) => {
        if (signal.aborted) {
          throw new BusError(
            "ReceiverClosed",
            "Cannot register a handler after closing.",
          );
        }
        if (
          typeof method !== "string" ||
          !method ||
          typeof handler !== "function"
        ) {
          throw new BusError(
            "InvalidArguments",
            "Bus handlers require a method name and a function.",
          );
        }
        if (receiver.methods.has(method)) {
          throw new BusError(
            "DuplicateHandler",
            `Bus method already registered: ${appId}.${method}`,
          );
        }
        let instances = this._receivers.get(appId);
        if (!instances) {
          instances = new Set();
          this._receivers.set(appId, instances);
        }
        instances.add(receiver);
        receiver.methods.set(method, handler);
      };
    }
    if (dependencies.includes("busCall")) {
      api.busCall = (target, method, ...args) =>
        this._call(target, method, args, signal);
    }
    return Object.freeze(api);
  }

  /** Returns settled results in receiver registration order; no receivers gives []. */
  call(target, method, ...args) {
    return this._call(target, method, args);
  }

  async _call(target, method, args, callerSignal) {
    if (
      typeof target !== "string" ||
      !target ||
      typeof method !== "string" ||
      !method
    ) {
      throw new BusError(
        "InvalidArguments",
        "Bus calls require a recipient ID and method name.",
      );
    }
    if (callerSignal?.aborted) {
      throw new BusError("CallerClosed", "The calling application has closed.");
    }
    const receivers = [...(this._receivers.get(target) ?? [])];
    return Promise.allSettled(
      receivers.map(async ({ methods, signal }) => {
        if (signal.aborted) {
          throw new BusError(
            "ReceiverClosed",
            `Bus receiver closed: ${target}`,
          );
        }
        const handler = methods.get(method);
        if (!handler) {
          throw new BusError(
            "UnknownMethod",
            `Unknown bus method: ${target}.${method}`,
          );
        }
        try {
          return await handler(...args);
        } catch (cause) {
          throw new BusError(
            "HandlerFailed",
            `Bus handler failed: ${target}.${method}`,
            cause,
          );
        }
      }),
    );
  }
}

export class BusError extends Error {
  constructor(code, message, cause) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "BusError";
    this.code = code;
  }
}
