import { observable } from 'mobx';

class Paginate {
  
  @observable count
  @observable count_page
  @observable current_page
  @observable length

  static create({count, count_page, current_page, length}) {
    let paginate = new Paginate();
    [
      paginate.count,
      paginate.count_page,
      paginate.current_page,
      paginate.length
    ] = [
      count,
      count_page,
      current_page,
      length
    ]
    return paginate;
  }
}

export default Paginate;