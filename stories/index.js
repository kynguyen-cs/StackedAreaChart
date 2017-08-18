import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import StackGraph from '../src/components/StackedChart/StackedArea';

storiesOf('Welcome', module).add('to d3', () =>
  <StackGraph
    width={800}
    height={500}
    margin={{
      top: 100,
      right: 50,
      bottom: 120,
      left: 100
    }}
  />
);
