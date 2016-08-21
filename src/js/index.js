import React from 'react'
import ReactDOM from 'react-dom'
import App from './jsx/app'

/**
* Application bootstrap
*/
const subsonic = new Subsonic(
  localStorage.getItem('url') || 'http://localhost:4040',
  localStorage.getItem('username') || '',
  localStorage.getItem('password') || '',
  "1.13.0", "Aurial"
);

const container = document.createElement('app');
document.body.appendChild(container);
ReactDOM.render(<App subsonic={subsonic}/>, container);
