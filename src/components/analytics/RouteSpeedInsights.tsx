import { SpeedInsights, computeRoute } from "@vercel/speed-insights/react";
import { useMemo } from "react";
import { useLocation, useMatches } from "react-router-dom";

export function RouteSpeedInsights() {
  const location = useLocation();
  const matches = useMatches();

  const route = useMemo(() => {
    const params = Object.assign(
      {},
      ...matches.map((match) => match.params),
    ) as Record<string, string | string[]>;

    return computeRoute(
      location.pathname,
      Object.keys(params).length > 0 ? params : {},
    );
  }, [location.pathname, matches]);

  return <SpeedInsights route={route ?? location.pathname} />;
}
