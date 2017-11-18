/* @flow */

import React from 'react';

export default function Button(props: { onClick: (e: SyntheticEvent) => void, title: string }) {
  return (
    <div onClick={props.onClick}>
      <div>{props.title}</div>
    </div>
  );
}
