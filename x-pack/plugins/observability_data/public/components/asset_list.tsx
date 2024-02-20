import React, { useEffect, useMemo, useState } from 'react';
import { FullHostRecord, GetHostsOptions, IObsDataClient, RouteResponseList } from "@kbn/observability-data-plugin/common/api_types";
import type { QuerySource } from '@kbn/observability-data-plugin/common/runtime_types';
import { EuiBasicTable, EuiBasicTableColumn, EuiCheckbox, EuiComboBox, EuiComboBoxOptionOption, EuiFormRow, EuiLoadingLogo, EuiPageHeader, EuiPanel, EuiSpacer } from '@elastic/eui';

export interface AssetListProps {
  client: IObsDataClient
}

const INITIAL_SOURCES: QuerySource[] = ['profiling'];

export function AssetList({ client }: AssetListProps) {
  const [sources, updateSources] = useState<GetHostsOptions['sources']>(INITIAL_SOURCES);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  // NOTE: ranges less than 6h will likely have trouble with profiling data as the 
  // profiling-hosts data stream is populated once every 6 hours per host
  const [dateRange, setDateRange] = useState<string>('now-12h');
  const options = useMemo(() => ({ sources, dateRange: { gte: dateRange } }), [sources, dateRange]);
  const { assets, isFetching } = useAssets(client, options);

  useEffect(() => {
    if (isFetching) {
      setHasFetched(true);
    }
  }, [isFetching]);

  const dateRangeOptions: EuiComboBoxOptionOption<string>[] = [
    { label: 'Last hour', value: 'now-1h' },
    { label: 'Last 2 hours', value: 'now-2h' },
    { label: 'Last 6 hours', value: 'now-6h' },
    { label: 'Last 12 hours', value: 'now-12h' },
    { label: 'Last 24 hours', value: 'now-24h' },
    { label: 'Last 3 days', value: 'now-3d' },
    { label: 'Last week', value: 'now-1w' }
  ];

  function onDateRangeChange(selected: EuiComboBoxOptionOption<string>[]) {
    setDateRange(selected[0].value!!);
  }

  const columns: EuiBasicTableColumn<FullHostRecord>[] = [
    {
      field: 'hostname',
      name: 'Hostname',
      sortable: true
    },
    {
      field: 'timestamp',
      name: 'Last Seen',
      render: (timestamp: FullHostRecord['timestamp']) => {
        if (typeof timestamp === 'string') {
          const d = new Date(timestamp);
          if (d.toString() === 'Invalid Date') {
            return 'Invalid Timestamp';
          }
          timestamp = d.getTime();
        }
        return displayRelativeTime(timestamp);
      }
    },
    {
      field: 'containers',
      name: '# Containers Found',
      render: (containers: FullHostRecord['containers']) => {
        return containers.length;
      }
    },
    {
      field: 'services',
      name: '# Services Found',
      render: (services: FullHostRecord['services']) => {
        return services.length;
      }
    }
  ]
  return (
    <EuiPanel paddingSize="xl">
      <EuiPageHeader pageTitle="Multi-Source Host Assets POC" />
      <EuiSpacer />
      <div>
        <Checkbox
          id="source-logs"
          label="Search logs?"
          initialState={INITIAL_SOURCES.includes('logs')}
          onToggle={(checked) => {
            const sourceLogs = sources.includes('logs');
            if (checked && !sourceLogs) {
              updateSources([...sources, 'logs']);
            }
            if (!checked && sourceLogs) {
              const updated = sources.filter((s) => s !== 'logs');
              updateSources(updated);
            }
          }}  
        />
        <Checkbox
          id="source-metrics"
          label="Search metrics?"
          initialState={INITIAL_SOURCES.includes('metrics')}
          onToggle={(checked) => {
            const sourceMetrics = sources.includes('metrics');
            if (checked && !sourceMetrics) {
              updateSources([...sources, 'metrics']);
            }
            if (!checked && sourceMetrics) {
              const updated = sources.filter((s) => s !== 'metrics');
              updateSources(updated);
            }
          }}  
        />
        <Checkbox
          id="source-profiling"
          label="Search profiling hosts?"
          initialState={INITIAL_SOURCES.includes('profiling')}
          onToggle={(checked) => {
            const sourceProfiling = sources.includes('profiling');
            if (checked && !sourceProfiling) {
              updateSources([...sources, 'profiling']);
            }
            if (!checked && sourceProfiling) {
              const updated = sources.filter((s) => s !== 'profiling');
              updateSources(updated);
            }
          }}  
        />
      </div>
      <EuiSpacer />
      <div>
        <EuiFormRow
          label="Select a relative date range"
        >
          <EuiComboBox
            aria-label="Select a date range"
            placeholder="Select date range to search"
            singleSelection={{ asPlainText: true }}
            options={dateRangeOptions}
            selectedOptions={dateRangeOptions.filter(o => o.value === dateRange)}
            onChange={onDateRangeChange}
          />
        </EuiFormRow>
      </div>
      <EuiSpacer />
      {!hasFetched || isFetching 
        ? <EuiLoadingLogo /> 
        : <EuiBasicTable
            tableCaption={`${assets.length} hosts found`}
            columns={columns}
            items={assets}
          />
      }
    </EuiPanel>
  )
}

function formatRelativeTime(diff: number, singularUnit: string) {
  const rounded = Math.round(diff);
  return rounded === 1 ? `${rounded} ${singularUnit} ago` : `${rounded} ${singularUnit}s ago`;
}

function displayRelativeTime(ts: number | undefined): string {
  if (!ts) {
    return 'N/A';
  }
  const now = new Date();
  const nowTs = now.getTime();
  if (Math.floor(ts / 10000000000) === 0) {
    ts = ts * 1000;
  }
  const tsDate = new Date(ts);
  const seconds = (nowTs - ts) / 1000;

  console.log('DEBUG', {
    now,
    nowTs,
    ts,
    tsDate,
    seconds
  });

  if (seconds < 59.5) {
    return formatRelativeTime(seconds, 'second');
  }

  const minutes = seconds / 60;
  if (minutes < 59.5) {
    return formatRelativeTime(minutes, 'minute');
  }

  const hours = minutes / 60;
  if (hours < 23.5) {
    return formatRelativeTime(hours, 'hour');
  }

  const days = hours / 24;
  if (days < 6.5) {
    return formatRelativeTime(days, 'day');
  }

  return tsDate.toLocaleString();
}

function Checkbox({ 
  onToggle, 
  initialState = false,
  label,
  id
}: { 
  onToggle: (checked: boolean) => void;
  initialState: boolean;
  label: string;
  id: string;
}) {
  const [isChecked, setIsChecked] = useState<boolean>(initialState);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIsChecked(e.target.checked);
    onToggle(e.target.checked);
  }

  return (
    <EuiCheckbox
      id={id}
      label={label}
      checked={isChecked}
      onChange={onChange}
    />
  )
}

function useAssets(client: IObsDataClient, options: GetHostsOptions) {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [assets, updateAssets] = useState<RouteResponseList['hosts']>([]);

  useEffect(() => {
    let activeRequest = true;
    async function retrieve() {
      if (options.sources.length === 0) {
        updateAssets([]);
      } else {
        setIsFetching(true);
        const result = await client.getHosts(options);
        if (activeRequest) {
          updateAssets(result.hosts);
        }
      }
      setIsFetching(false);
    }
    retrieve();
    return () => {
      // only update data for the last made request if multiple are in flight
      activeRequest = false;
    }
  }, [client, options]);

  return {
    assets,
    isFetching
  };
}