import { SOCKET_SERVER } from '../constants/config'; 

export default class TornadoWebSocket {

  constructor(url, options) {

    Object.defineProperty(this, 'url', {
        enumerable: false,
        configurable: true,
        writable: false,
        value: SOCKET_SERVER + '/ws' + url
    });

    Object.defineProperty(this, 'options', {
      enumerable: false,
      configurable: true,
      writable: false,
      value: Object.assign({
        auto_connect: true,
        reconnect: true
      }, options || {})
    });

    this.closed = true;

    this._user_events = {};

    this._websocket_events = {
      'onopen': event => {
        console.info('TornadoWebSocket: New connection', event);
      },
      'onmessage': event => {
        try {
          let data = JSON.parse(event.data);
          let passed_event, passed_data, callback;
          if ((passed_event = data.event) === void 0) {
              throw new ReferenceError('Can not get passed event from JSON data.');
          }

          if ((passed_data = data.data) === void 0) {
              throw new ReferenceError('Can not get passed data from JSON data.');
          }

          if ((callback = this._user_events[passed_event]) === void 0) {
              throw new ReferenceError(`Event « ${passed_event} » is not binded.`);
          }
          callback(passed_data)
        } catch (e) {
          if (e instanceof SyntaxError) {  // JSON.parse()
              console.warn('TornadoWebSocket: Can not parse invalid JSON.');
          } else {
              console.warn(`TornadoWebSocket: ${e.message}`);
          }
        }
      },
      'onerror': event => {
          console.error('TornadoWebSocket: Error', event);
          this.closed = true;
          this.reconnect()
      },
      'onclose': event => {
          console.info('TornadoWebSocket: Connection closed', event);
          this.closed = true;
          this.reconnect();
      }
    }

    if (this.options.auto_connect === true) {
      this.connect();
    }

  }

  on(event, callback) {
    if (typeof callback !== 'function') {
        throw new TypeError('You must pass a function for « callback » parameter.');
    }

    if (['open', 'message', 'close', 'error'].includes(event)) {
        event = 'on' + event;
        this._websocket[event] = this._websocket_events[event] = callback;
    } else {
        this._user_events[event] = callback;
    }
  }

  reconnect() {
    if (this.options.reconnect === true) {
      console.log("reconnect...");
      setTimeout(this.connect.bind(this), 5000);
    }
  }

  connect() {
    if (this.closed) {
      this._websocket = new WebSocket(this.url);
      this._websocket.onopen = this._websocket_events.onopen;
      this._websocket.onmessage = this._websocket_events.onmessage;
      this._websocket.onerror = this._websocket_events.onerror;
      this._websocket.onclose = this._websocket_events.onclose;
      this.closed = false;
    }
  }

  emit(event, data = {}) {
    if (typeof data !== 'object') {
        data = {'message': data}
    }
    let frame = JSON.stringify({event, data});
    this._websocket.send(frame);
  }

}