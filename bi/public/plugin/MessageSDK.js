(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MessageSDK = factory());
})(this, (function () { 'use strict';

  const map = new WeakMap();
  const _ = (proxy) => map.get(proxy);

  class BaseProxy {
    constructor(context) {
      map.set(this, context);
      context._proxy = this;
    }
  }

  class Base {
    constructor() {
      this.env = '__buildEnv__';
      this.bundle = '__buildDate__';
      this.version = '__buildVersion__';
    }
  }

  const SEND = {
    TAG_FLY_TO: `tag.fly.to`,
    TAG_GET_TAGS: `tag.get.tags`,
    SCENE_SWITCH: 'scene.switch',
    SCENE_GET_SCENES: 'scene.get.scenes',
    MODE_SWITCH: 'mode.switch',
    INIT_CONFIG: 'init.config',
    GUIDE_PLAY: 'guide.play',
    GUIDE_PAUSE: 'guide.pause',
    GUIDE_BAR_SHOW: 'guide.bar.show',
    GUIDE_BAR_HIDE: 'guide.bar.hide',
  };

  const RECEIVE = {
    BRIDGE_INIT: `bridge.init`};

  const getRequestId = () => {
    return `requestId_${Date.now()}`
  };

  class Tag {
    constructor(context) {
      this.context = context;
    }
    getTags() {
      return new Promise((resolve, reject) => {
        const channelId = getRequestId();
        this.context.request(SEND.TAG_GET_TAGS, '', channelId, resolve, reject);
      })
    }
    flyTo(data) {
      if (!data) throw new Error('tag.flyTo require params')
      if (!data.tagId || !data.sceneId)
        throw new Error('tag.flyTo require params.tagId and params.sceneId')
      return new Promise((resolve, reject) => {
        const channelId = getRequestId();
        this.context.request(SEND.TAG_FLY_TO, data, channelId, resolve, reject);
      })
      // this.context.send(SEND.TAG_FLY_TO, data)
    }
  }

  class Scene {
    constructor(context) {
      this.context = context;
    }
    getScenes() {
      return new Promise((resolve, reject) => {
        const channelId = getRequestId();
        this.context.request(SEND.SCENE_GET_SCENES, '', channelId, resolve, reject);
      })
    }
    switch(data) {
      if (!data) throw new Error('scene.switch require params')
      if (!data.sceneId) throw new Error('scene.switch require params.sceneId')
      this.context.send(SEND.SCENE_SWITCH, data);
    }
  }

  class Guide {
    constructor(context) {
      this.context = context;
    }
    play() {
      this.context.send(SEND.GUIDE_PLAY, '');
    }
    pause() {
      this.context.send(SEND.GUIDE_PAUSE);
    }
    barShow() {
      this.context.send(SEND.GUIDE_BAR_SHOW);
    }
    barHide() {
      this.context.send(SEND.GUIDE_BAR_HIDE);
    }
  }

  class Mode {
    constructor(context) {
      this.context = context;
    }
    switch(mode) {
      if (!mode) console.warn('mode.switch require mode');
      this.context.send(SEND.MODE_SWITCH, mode);
    }
  }

  const EVENT_LISTENER_MAP = Symbol('e'),
    CONTEXT = Symbol('c');

  class Emitter {
    constructor(context = this) {
      /**
       * @type {{ [key: string]: Array<() => void> }}
       */
      this[EVENT_LISTENER_MAP] = {};
      this[CONTEXT] = context;
    }

    on(type, listener) {
      if (!this[EVENT_LISTENER_MAP][type]) {
        this[EVENT_LISTENER_MAP][type] = [];
      }
      this[EVENT_LISTENER_MAP][type].push(listener);
    }

    off(type, listener) {
      const list = this[EVENT_LISTENER_MAP][type];
      if (list) {
        const index = list.indexOf(listener);
        if (index !== -1) {
          list.splice(index, 1);
        }
      }
    }

    emit(type, ...args) {
      const list = this[EVENT_LISTENER_MAP][type];
      if (list) {
        for (let i = 0; i < list.length; i++) {
          list[i].call(this[CONTEXT], ...args);
        }
      }
    }
  }

  /**
   * 跨页面通信管理器
   * @param {Object} options 配置选项
   * @param {Window} options.targetWindow 目标窗口对象
   * @param {string} options.targetOrigin 目标源，用于安全验证
   * @param {string} [options.channelId='default'] 通道ID，用于区分不同通信通道
   */
  class MessagePlugin extends Base {
    constructor(options) {
      super();
      if (!options.targetWindow || !options.targetOrigin) {
        throw new Error('targetWindow and targetOrigin are required')
      }
      this.emitter = new Emitter();
      this.targetWindow = options.targetWindow.contentWindow;
      this.targetOrigin = options.targetOrigin;
      this.handlers = {};
      this.messageQueue = [];
      this.isConnected = true;
      this.tag = new Tag(this);
      this.scene = new Scene(this);
      this.guide = new Guide(this);
      this.mode = new Mode(this);

      window.addEventListener('message', this._handleMessage.bind(this));
    }

    _handleMessage(event) {
      // 验证来源
      if (event.origin !== this.targetOrigin) return
      const { data } = event;
      // 查找对应的处理器
      const callbacks = this.handlers[data.event];
      if (callbacks) {
        try {
          callbacks.forEach((handler) => {
            handler(data.payload, event);
          });
        } catch (error) {
          console.error(`Error handling message type ${data.event}:`, error);
        }
      } else {
        console.warn(`No handler registered for message type: ${data.event}`);
      }
    }

    _processQueue() {
      while (this.messageQueue.length > 0) {
        const { type, payload } = this.messageQueue.shift();
        this._send(type, payload);
      }
    }

    _send(event, payload, channelId) {
      const message = {
        event,
        payload,
        channelId,
      };

      this.targetWindow.postMessage(message, this.targetOrigin);
    }

    send(event, payload, requestId) {
      if (!this.isConnected) {
        this.messageQueue.push({ event, payload });
        return
      }
      this._send(event, payload, requestId);
    }

    request(event, payload, channelId, resolve, reject) {
      this.send(event, payload, channelId);
      window.addEventListener('message', function handler(result) {
        if (result.data.channelId === channelId) {
          window.removeEventListener('message', handler);
          result.data.success ? resolve(result.data.payload) : reject(result.data.error);
        }
      });
    }

    on(eventName, callback) {
      if (typeof callback !== 'function') {
        throw new Error('Handler must be a function')
      }
      if (!this.handlers[eventName]) {
        this.handlers[eventName] = [];
      }

      this.handlers[eventName].push(callback);
    }

    remove(eventName, callback) {
      if (!this.handlers[eventName]) {
        return
      }
      this.handlers[eventName] = this.handlers[eventName].filter((handler) => handler !== callback);
    }
  }

  class MessagePluginProxy extends BaseProxy {
    constructor(options) {
      super(new MessagePlugin(options));
      this.bundle = "2025/5/15 19:27:06"; // 插件打包时间
      this.version = "1.0.0"; //插件版本号
    }
    static connect(options) {
      const instance = new MessagePluginProxy(options);
      const handler = () => {
        const data = Object.assign(
          {
            info: {
              origin: window.location.origin,
            },
          },
          {
            config: options.config,
          },
        );
        instance.send(SEND.INIT_CONFIG, data);
      };
      instance.on(RECEIVE.BRIDGE_INIT, handler);
      return instance
    }
    get tag() {
      return _(this).tag
    }

    get scene() {
      return _(this).scene
    }

    get guide() {
      return _(this).guide
    }

    get mode() {
      return _(this).mode
    }

    on(type, handler) {
      _(this).on(type, handler);
    }

    remove(type, handler) {
      _(this).remove(type, handler);
    }

    send(event, payload, requestId) {
      _(this).send(event, payload, requestId);
    }
  }

  return MessagePluginProxy;

}));
