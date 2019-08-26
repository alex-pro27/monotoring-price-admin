import { persist } from "mobx-persist";

class Monitoring {
  @persist id
  @persist name

  static create({id, name}) {
    let monitoring = new Monitoring();
    [monitoring.id, monitoring.name] = [id, name]
    return monitoring;
  }
}

export default Monitoring;