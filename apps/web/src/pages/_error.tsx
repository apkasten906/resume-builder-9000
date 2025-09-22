import React from 'react';
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode: number;
}

import type { ReactElement } from 'react';
const CustomError = ({ statusCode }: ErrorProps): ReactElement => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>{statusCode ? `An error ${statusCode} occurred` : 'An error occurred'}</h1>
      <p>Sorry, something went wrong.</p>
    </div>
  );
};

CustomError.getInitialProps = ({ res, err }: NextPageContext): { statusCode: number } => {
  const statusCode = res?.statusCode || err?.statusCode || 404;
  return { statusCode };
};

export default CustomError;
