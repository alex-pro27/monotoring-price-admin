import axios from 'axios';
import { SERVER_URL, APP_NAME } from '../constants/config';


let instance = null;

export default class RestService {

  _loads = {};
  counterLoads = 0;

  callbacks = [];

  _prefLoads = [];

  cacheKeys = APP_NAME + '_keys'

  constructor() {
    if(!instance) {
      instance = this;
      this.clearCache();
    }
    return instance;
  }

  subscribe(callback) {
    if(!~this.callbacks.indexOf(callback)) {
      this.callbacks.push(callback);
    }
    return () => this.callbacks = this.callbacks.filter(clb => { return clb !== callback });
  }

  clearCache() {
    let keys = JSON.parse(localStorage.getItem(this.cacheKeys));
    if (keys) {
      let newKeys = [].concat(keys);
      keys.forEach(key => {
        let { timelife, time } = JSON.parse(localStorage.getItem(key));
        if (Date.now() - time < timelife) {
          localStorage.removeItem(key)
          newKeys.pop(key);
        }
      });
      localStorage.setItem(this.cacheKeys, newKeys);
    }
  }

  get authHeader() {
    return {
      'Authorization' : `Token ${this.token}`,
      'X-CSRFToken': RestService.getCookie()["csrftoken"],
    }
  }

  get loads() {
    return this._loads;
  }

  setToken(token) {
    this.token = token;
  }

  static getCookie() {
    let cookie = {};
    document.cookie.split(";").forEach(x => {
      const [k, v] = x.split("=");
      cookie[k] = v;
    });
    return cookie;
  }

  forceUpdate() {
    this.callbacks.forEach(clb => clb(arguments[0]));
  }

  updateLoad(loadName, status) {
    loadName = loadName.replace(/[0-9]*_/, '');
    let loadsName = Object.keys(this.loads).filter(key => {return key.indexOf(loadName) > -1});
    for (let _loadName of loadsName) {
      if (this.loads[_loadName]) {
        status = true;
        break;
      }
    }
    this.forceUpdate({[loadName]: status})
  }

  getLoads(names) {
    let loads = {};
    names.forEach(name => {
      loads[name] = false;
    });
    names.forEach(name => {
      this._prefLoads.forEach(_pref => {
        let _loadName = `${_pref}_${name}`;
        if (this.loads[_loadName]) {
          loads[name] = true;
        }
      });
    })
    return loads;
  }

  _getPrefLoad() {
    let _pref = Math.random().toString().slice(2);
    if (this._prefLoads.indexOf(_pref) > - 1) {
      return this._getPrefLoad();
    }
    this._prefLoads.push(_pref);
    return [_pref, ()=>this._prefLoads.filter(x=> x !== _pref)];
  }

  _addToLoads(loadName) {
    let [_pref, rmPref] = this._getPrefLoad();
    loadName = `${_pref}_${loadName}`;
    this._loads[loadName] = true;
    this.updateLoad(loadName, true);
    return () => this._rmLoadName(loadName, rmPref);
  }

  _rmLoadName(loadName, rmPref) {
    delete this._loads[loadName];
    rmPref();
    this.updateLoad(loadName, false);
  }

  async _saveCache(timelife, key, data) {
    console.log("saveCache", timelife, key, data)
    localStorage.setItem(key, JSON.stringify({timelife, time: Date.now(), data}));
    let keys = JSON.parse(localStorage.getItem(this.cacheKeys), '[]');
    keys.append(key);
    localStorage.setItem(this.cacheKeys, key)
  }

  _getCache(key) {
    let cache = localStorage.getItem(key);
    if(cache) {
      let  { timelife, time, data } = JSON.parse(cache);
      if ( Date.now() - time < timelife ){
        return data;
      }
      else {
        localStorage.removeItem(key);
        let keys = JSON.parse(localStorage.getItem(this.cacheKeys));
        keys.pop(key);
        localStorage.setItem(this.cacheKeys, key);
        return null;
      }
    }
  }

  async _cachingResponse(callbackResponse, hash, settings = {}) {
    let { cacheTimelife, loadName } = settings, cache = null;
    cacheTimelife = cacheTimelife !== undefined? cacheTimelife: 0;
    let rmLoadName = null;
    if (loadName) {
      rmLoadName = this._addToLoads(loadName);
    }
    this.counterLoads++;
    try {
      if (cacheTimelife) {
        cache = this._getCache(hash);
      }
      if (!cacheTimelife || !cache) {
        let response = await callbackResponse();
        if(cacheTimelife) {
          this._saveCache(cacheTimelife, hash, response);
        }
        return response;
      }
      else return cache;
    }
    catch (e) {
      console.error(e);
      this._handlerError(e);
    }
    finally {
      if (rmLoadName) {
        rmLoadName();
      }
      this.counterLoads--;
    }
  }

  prepareUrlAndHeaders(url, headers={}) {
    if (url.match(/^\/(api|common)/)) {
      // url = SERVER_URL + url;
      console.log("url", url)
      headers = Object.assign(headers, this.authHeader);
    }
    return [url, headers];
  }

  createFormData(data) {
    let fd = new FormData();
    for(let [k, v] of Object.entries(data)) {
      fd.append(k.toString(), v);
    };
    return fd;
  }

  async request({method, url, params, data, headers, config, settings}) {
    const [_url, _headers] = this.prepareUrlAndHeaders(url, headers || config.headers)
    let requestClb, hashName;
    if (method === "GET") {
      requestClb = () => axios.get(_url, {params, headers: _headers});
      hashName = this._getHashName(_url + JSON.stringify(params), settings.cacheTimelife);
    }
    else if (["POST", "PUT", "DELETE"].indexOf(method) > -1) {
      config.headers = _headers;
      const fd = this.createFormData(data);
      requestClb = () => axios[method.toLowerCase()](_url, fd, config);
      hashName = this._getHashName(_url + JSON.stringify(config), settings.cacheTimelife);
    }
    else if (method === "HEAD") {
      config.headers = headers;
      requestClb = () => axios[method.toLowerCase()](_url, config);
    }
    if (requestClb) {
      return await this._cachingResponse(requestClb, hashName, settings || {});
    }
    else {
      throw Error(`Method ${method}, not support`);
    }
  }

  async get(url, params, headers, settings={}) {
    return await this.request({
      method: "GET",
      url, params, headers, settings
    })
  }

  async post(url, data, config, settings={}) {
    return await this.request({
      method: "POST",
      url, data, config, settings
    })
  }

  async put(url, data, config, settings={}) {
    return await this.request({
      method: "PUT",
      url, data, config, settings
    })
  }

  async delete(url, data, config, settings={}) {
    return await this.request({
      method: "DELETE",
      url, data, config, settings
    })
  }

  async head(url, config={}) {
    return await this.request({
      method: "head",
      url, config
    })
  }

  _getHashName(str, cacheTimelife) {
    if (cacheTimelife !== undefined) {
      return RestService.hashCode(str);
    }
    return null;
  }

  static hashCode(str) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
  }

  getUrl(api) {
    return SERVER_URL + "/api/" + api;
  }

  _handlerError(e) {
    if(e.response && e.response.status === 404) {
      console.warn("Not found");
    }
    else {
      console.error(e);
    }
    throw e;
  }
}