import { persist } from 'mobx-persist';

class Role {
  @persist id;
  @persist name;
  @persist role_type;

  
  static create({id, name, role_type}) {
    let role = new Role();
    [
      role.id, role.name, role.role_type
    ] = [
      id, name, role_type
    ]
    return role;
  }
}

export default Role