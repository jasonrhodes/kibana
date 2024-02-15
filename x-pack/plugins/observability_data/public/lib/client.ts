import { HttpSetup, HttpStart } from "@kbn/core/public";
import { GetHostsOptions, IObsDataClient, RouteResponseList } from "@kbn/observability-data-plugin/common/api_types";

export class ObsDataClient implements IObsDataClient {
  constructor(private readonly http: HttpStart | HttpSetup) {}

  async getHosts(options: GetHostsOptions) {
    const { gte, lte } = options.dateRange;
    const results = await this.http.get<RouteResponseList>('/internal/observability_data/list', {
      query: {
        type: 'hosts',
        sources: options.sources.join(','),
        dateRangeFrom: String(gte),
        dateRangeTo: lte ? String(lte) : 'now'
      },
    });

    return results;
  }
}