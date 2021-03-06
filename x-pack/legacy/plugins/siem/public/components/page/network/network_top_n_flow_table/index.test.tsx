/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { getOr } from 'lodash/fp';
import * as React from 'react';
import { MockedProvider } from 'react-apollo/test-utils';
import { Provider as ReduxStoreProvider } from 'react-redux';

import { FlowDirection } from '../../../../graphql/types';
import {
  apolloClientObservable,
  mockIndexPattern,
  mockGlobalState,
  TestProviders,
} from '../../../../mock';
import { createStore, networkModel, State } from '../../../../store';

import { NetworkTopNFlowTable, NetworkTopNFlowTableId } from '.';
import { mockData } from './mock';

describe('NetworkTopNFlow Table Component', () => {
  const loadMore = jest.fn();
  const state: State = mockGlobalState;

  let store = createStore(state, apolloClientObservable);

  beforeEach(() => {
    store = createStore(state, apolloClientObservable);
  });

  describe('rendering', () => {
    test('it renders the default NetworkTopNFlow table', () => {
      const wrapper = shallow(
        <ReduxStoreProvider store={store}>
          <NetworkTopNFlowTable
            data={mockData.NetworkTopNFlow.edges}
            hasNextPage={getOr(false, 'hasNextPage', mockData.NetworkTopNFlow.pageInfo)!}
            id="topNFlow"
            indexPattern={mockIndexPattern}
            loading={false}
            loadMore={loadMore}
            nextCursor={getOr(null, 'endCursor.value', mockData.NetworkTopNFlow.pageInfo)}
            totalCount={mockData.NetworkTopNFlow.totalCount}
            type={networkModel.NetworkType.page}
          />
        </ReduxStoreProvider>
      );

      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });

  describe('Direction', () => {
    test('when you click on the bi-directional button, it get selected', () => {
      const event = {
        target: { name: 'direction', value: FlowDirection.biDirectional },
      };

      const wrapper = mount(
        <MockedProvider>
          <TestProviders store={store}>
            <NetworkTopNFlowTable
              data={mockData.NetworkTopNFlow.edges}
              hasNextPage={getOr(false, 'hasNextPage', mockData.NetworkTopNFlow.pageInfo)!}
              id="topNFlow"
              indexPattern={mockIndexPattern}
              loading={false}
              loadMore={loadMore}
              nextCursor={getOr(null, 'endCursor.value', mockData.NetworkTopNFlow.pageInfo)}
              totalCount={mockData.NetworkTopNFlow.totalCount}
              type={networkModel.NetworkType.page}
            />
          </TestProviders>
        </MockedProvider>
      );

      wrapper
        .find(`[data-test-subj="${FlowDirection.biDirectional}"]`)
        .first()
        .simulate('click', event);

      wrapper.update();

      expect(
        wrapper
          .find(`[data-test-subj="${FlowDirection.biDirectional}"]`)
          .first()
          .render()
          .hasClass('euiFilterButton-hasActiveFilters')
      ).toEqual(true);
    });
  });

  describe('Sorting by type', () => {
    test('when you click on the sorting dropdown, and picked destination', () => {
      const wrapper = mount(
        <MockedProvider>
          <TestProviders store={store}>
            <NetworkTopNFlowTable
              data={mockData.NetworkTopNFlow.edges}
              hasNextPage={getOr(false, 'hasNextPage', mockData.NetworkTopNFlow.pageInfo)!}
              id="topNFlow"
              indexPattern={mockIndexPattern}
              loading={false}
              loadMore={loadMore}
              nextCursor={getOr(null, 'endCursor.value', mockData.NetworkTopNFlow.pageInfo)}
              totalCount={mockData.NetworkTopNFlow.totalCount}
              type={networkModel.NetworkType.page}
            />
          </TestProviders>
        </MockedProvider>
      );

      wrapper
        .find(`[data-test-subj="${NetworkTopNFlowTableId}-select-flow-target"] button`)
        .first()
        .simulate('click');

      wrapper.update();

      wrapper
        .find(`button#${NetworkTopNFlowTableId}-select-flow-target-destination`)
        .first()
        .simulate('click');

      expect(
        wrapper
          .find(`[data-test-subj="${NetworkTopNFlowTableId}-select-flow-target"] button`)
          .first()
          .text()
          .toLocaleLowerCase()
      ).toEqual('by destination ip');
    });
  });

  describe('Sorting on Table', () => {
    test('when you click on the column header, you should show the sorting icon', () => {
      const wrapper = mount(
        <MockedProvider>
          <TestProviders store={store}>
            <NetworkTopNFlowTable
              data={mockData.NetworkTopNFlow.edges}
              hasNextPage={getOr(false, 'hasNextPage', mockData.NetworkTopNFlow.pageInfo)!}
              id="topNFlow"
              indexPattern={mockIndexPattern}
              loading={false}
              loadMore={loadMore}
              nextCursor={getOr(null, 'endCursor.value', mockData.NetworkTopNFlow.pageInfo)}
              totalCount={mockData.NetworkTopNFlow.totalCount}
              type={networkModel.NetworkType.page}
            />
          </TestProviders>
        </MockedProvider>
      );
      expect(store.getState().network.page.queries!.topNFlow.topNFlowSort).toEqual({
        direction: 'desc',
        field: 'bytes',
      });

      wrapper
        .find('.euiTable thead tr th button')
        .at(1)
        .simulate('click');

      wrapper.update();

      expect(store.getState().network.page.queries!.topNFlow.topNFlowSort).toEqual({
        direction: 'asc',
        field: 'packets',
      });
      expect(
        wrapper
          .find('.euiTable thead tr th button')
          .first()
          .text()
      ).toEqual('BytesClick to sort in ascending order');
      expect(
        wrapper
          .find('.euiTable thead tr th button')
          .at(1)
          .text()
      ).toEqual('PacketsClick to sort in descending order');
      expect(
        wrapper
          .find('.euiTable thead tr th button')
          .at(1)
          .find('svg')
      ).toBeTruthy();
    });
  });
});
