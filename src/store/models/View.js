import { observable, action } from 'mobx';
import Permission from './Permission';

class View {
  
  id
  @observable name
  @observable parent_id
  @observable children = []
  @observable permissions = []
  @observable route_path
  @observable content_type

  static create({id, name, parent_id, children, route_path}) {
    let view = new View();
    [
      view.id,
      view.name,
      view.parent_id,
      view.children,
      view.route_path,
      view.permission,
      view.content_type,
    ] = [
      id,
      name,
      parent_id,
      route_path,
      children,
      view.content_type,
    ]
    return view
  }

  @action addPermissions(permissions) {
    this.permissions = permissions.map(p => Permission.create(p))
  }
}

export default View