import Permission from './Permission';

class View {
  
  content_type_id
  content_type_name
  view_id
  icon
  name
  plural
  parent_id
  children = []
  permission = []
  path
  content_type
  view_type
  menu

  static create({
    content_type_id,
    content_type_name,
    view_id,
    name,
    icon, 
    content_type,
    menu,
    plural, 
    parent_id, 
    path,
    view_type,
    children, 
    permission
  }) {
    let view = new View();
    [
      view.content_type_id,
      view.content_type_name,
      view.view_id,
      view.name,
      view.icon,
      view.parent_id,
      view.path,
      view.view_type,
      view.content_type,
      view.plural,
      view.menu
    ] = [
      content_type_id,
      content_type_name,
      view_id,
      name,
      icon,
      parent_id,
      path,
      view_type,
      content_type,
      plural,
      menu,
    ]
    view.addPermission(permission || [])
    view.children = view.addChildren(children || [])
    return view
  }

  addChildren(children=[]) {
    let views = []
    for (let _child of children) {
      let child = View.create(_child)
      if (child.children.length) {
        child.children = this.addChildren(child.children)
      }
      views.push(child)
    }
    return views
  }

  addPermission(permission) {
    this.permission = Permission.create(permission)
  }
}

export default View