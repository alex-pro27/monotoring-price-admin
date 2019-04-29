import { observable } from 'mobx';

class ContentType {
  
  value
  @observable name
  @observable plural
  @observable label
  @observable permissions = []
  @observable content_type

  static create({value, label, name, content_type, plural, permissions=[]}) {
    let contentType = new ContentType();
    [
      contentType.value,
      contentType.label,
      contentType.name,
      contentType.content_type,
      contentType.plural,
      contentType.permissions
    ] = [
      value,
      label,
      name,
      content_type,
      plural,
      permissions
    ]
    return contentType
  }
}

export default ContentType