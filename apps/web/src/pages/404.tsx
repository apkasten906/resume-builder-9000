import React from 'react';

import type { ReactElement } from 'react';
const Custom404 = (): ReactElement => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
    </div>
  );
};

export default Custom404;
