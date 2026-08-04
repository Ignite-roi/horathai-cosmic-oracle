export type BenchmarkSource = "competitor" | "myhora" | "jpl" | "swiss" | "horathai";
export type BenchmarkStatus = "observed" | "unverified" | "validated";

export type ObservedBenchmark = {
  id: string;
  source: BenchmarkSource;
  status: BenchmarkStatus;
  observedAt: string;
  input: {
    localDate: string;
    localTime: string;
    timezone: string;
    latitude: number;
    longitude: number;
  };
  observation: Record<string, string | number | boolean | null>;
  sourceNote: string;
  methodKnown: boolean;
  usableAsTruthFixture: boolean;
};

export const OBSERVED_BENCHMARKS: readonly ObservedBenchmark[] = [
  {
    id: "competitor-chaiyaphum-1988-05-05-0000",
    source: "competitor",
    status: "observed",
    observedAt: "2026-08-04",
    input: {
      localDate: "1988-05-05",
      localTime: "00:00",
      timezone: "Asia/Bangkok",
      latitude: 15.8068,
      longitude: 102.0315,
    },
    observation: { ascendantSignTh: "ธนู" },
    sourceNote: "User-supplied clean-room observation; no copied wording or proprietary method",
    methodKnown: false,
    usableAsTruthFixture: false,
  },
  {
    id: "myhora-benchmark-manifest-placeholder",
    source: "myhora",
    status: "unverified",
    observedAt: "2026-08-04",
    input: {
      localDate: "1988-05-05",
      localTime: "00:00",
      timezone: "Asia/Bangkok",
      latitude: 15.8068,
      longitude: 102.0315,
    },
    observation: {},
    sourceNote: "No independently captured result in this phase",
    methodKnown: false,
    usableAsTruthFixture: false,
  },
  {
    id: "jpl-multi-epoch-placeholder",
    source: "jpl",
    status: "unverified",
    observedAt: "2026-08-04",
    input: {
      localDate: "1988-05-05",
      localTime: "00:00",
      timezone: "Asia/Bangkok",
      latitude: 15.8068,
      longitude: 102.0315,
    },
    observation: {},
    sourceNote: "Independent multi-epoch benchmark not yet executed",
    methodKnown: false,
    usableAsTruthFixture: false,
  },
  {
    id: "swiss-multi-epoch-placeholder",
    source: "swiss",
    status: "unverified",
    observedAt: "2026-08-04",
    input: {
      localDate: "1988-05-05",
      localTime: "00:00",
      timezone: "Asia/Bangkok",
      latitude: 15.8068,
      longitude: 102.0315,
    },
    observation: {},
    sourceNote: "Independent multi-epoch benchmark not yet executed",
    methodKnown: false,
    usableAsTruthFixture: false,
  },
];