import { observable } from 'mobx';

class ContentType {
  
  id
  @observable name
  @observable plural
  @observable title
  @observable permissions = []
  @observable content_type

  static create({id, title, name, content_type, plural, permissions=[]}) {
    let contentType = new ContentType();
    [
      contentType.id,
      contentType.name,
      contentType.content_type,
      contentType.plural,
      contentType.title,
      contentType.permissions
    ] = [
      id,
      name,
      content_type,
      plural,
      title,
      permissions
    ]
    return contentType
  }
}

export default ContentType