import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Route404 extends Component {

  componentWillMount() {
    document.title = "404. Страница не найдена"
  }

  render() {
    return (
      <div style={{textAlign: 'center', fontFamily: 'Roboto', paddingTop: 150}}>
        <h2>404. Запрошенная страница не найдена</h2>
        <Link to={"/"} style={{fontSize: 18,}}>На главную страницу</Link>
      </div>
    );
  }
}

export default Route404;