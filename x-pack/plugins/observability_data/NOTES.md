# Query Design: Hosts

I started with a simple "exists" query on host.hostname

```ts
const dsl = {
  index:
    'remote_cluster:logs-*,remote_cluster:metrics-*,remote_cluster:filebeat*,remote_cluster:metricbeat*',
  query: {
    bool: {
      must: [
        {
          exists: {
            field: 'host.hostname',
          },
        },
      ],
    },
  },
};

const result = await esClient.asScopedUser.search<HostHitSource>(dsl);

if (result.hits?.hits?.length === 0) {
  return { hosts: [] };
}

const hosts = result.hits.hits.reduce<HostAsset[]>((acc, hit) => {
  const currentHost = hit._source;
  if (!currentHost) {
    return acc;
  }
  const found = acc.find((record) => record.hostname === currentHost.host.hostname);
  const querySource = getQuerySource(hit);
  if (found) {
    const sources = new Set(found.sources);
    sources.add(querySource);
    found.sources = [...sources];

    const containers = new Set<HostContainer>(found.containers);
    containers.add(currentHost.container);
    found.containers = [...containers];

    const services = new Set<HostService>(found.services);
    services.add(currentHost.service);
    found.services = [...services];
  } else {
    acc.push({
      hostname: currentHost.host.hostname,
      sources: [querySource],
      containers: [currentHost.container],
      services: [currentHost.service],
    });
  }
  return acc;
}, []);

return { hosts };
```

On the edge cluster, this produced a single host from a single source location: the adservice APM logs. I suspect this service creates so many logs that the 10K limit from ES was taken up soley from this one service. When I excluded the service, I immediately got another service's logs (cartservice). This doesn't seem like an efficient way to get ALL hosts across these documents, likely because there are just too many matches.

Next, I tried collapsing on the host.hostname value.

```json
GET logs-*,metrics-*,filebeat*,metricbeat*/_search
{
  "_source": ["host.hostname"],
  "query": {
    "bool": {
      "filter": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-24h"
            }
          }
        }
      ],
      "must": [
        {
          "exists": {
            "field": "host.hostname"
          }
        }
      ]
    }
  },
  "collapse": {
    "field": "host.hostname"
  }
}
```

This produces a much better list of hosts, at the expense of being able to include much about the documents that told us about these hosts. Within each "collapsed" set of documents, there could be many different containers, services, and even source indices/data streams that mentioned each host in the given time range, but collapse will only return a single document for each hostname.

I solved this for now with inner_hits.

```json
GET logs-*,metrics-*,filebeat*,metricbeat*/_search
{
  "_source": ["host.hostname"],
  "query": {
    "bool": {
      "filter": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-24h"
            }
          }
        }
      ],
      "must": [
        {
          "exists": {
            "field": "host.hostname"
          }
        }
      ]
    }
  },
  "collapse": {
    "field": "host.hostname",
    "inner_hits": [
      {
        "name": "services_for_host",
        "_source": ["service"],
        "collapse": { "field": "service.name" },
        "size": 100
      },
      {
        "name": "containers_for_host",
        "_source": ["container"],
        "collapse": { "field": "container.id" },
        "size": 100
      }
    ]
  }
}
```

This will give up to 100 containers and up to 100 services found within each set of collapsed documents per hostname. One interesting thing to note: I wanted to also track which data*stream each host document was found within, so I attempted to do a 3rd collapse on the "data_stream.dataset" value (not totally valid but roughly what I wanted), but that query failed due to the value being "contant_keyword" and thus not collapsible. I don't \_totally* understand why that is, or how I would get around it.
