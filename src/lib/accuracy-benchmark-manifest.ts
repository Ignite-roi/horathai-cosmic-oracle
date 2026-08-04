export type AccuracyBenchmarkStatus = "observed" | "unverified" | "validated";
export type AccuracyBenchmarkKind = "natal" | "transit";

export type AccuracyBenchmarkInput = {
  localDate: string;
  localTime: string;
  birthTimeKnown: boolean;
  timezone: string;
  latitude: number;
  longitude: number;
  transitAt?: string;
};

export type IndependentExpected = {
  utcInstant: string | null;
  ascendant: {
    longitude: number;
    signId: number;
    degree: number;
    minute: number;
  } | null;
  planets: ReadonlyArray<{
    planetId: number;
    longitude: number;
    signId: number;
    degree: number;
    minute: number;
    retrograde: boolean;
    house: number | null;
  }> | null;
};

export type AccuracyBenchmarkCase = {
  id: string;
  kind: AccuracyBenchmarkKind;
  status: AccuracyBenchmarkStatus;
  coverage: readonly string[];
  input: AccuracyBenchmarkInput;
  independentExpected: IndependentExpected;
  evidence: {
    source: "swiss" | "jpl" | "expert" | null;
    reference: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
  };
};

const EMPTY_EXPECTED: IndependentExpected = {
  utcInstant: null,
  ascendant: null,
  planets: null,
};

const PLACES = {
  bangkok: { timezone: "Asia/Bangkok", latitude: 13.7563, longitude: 100.5018 },
  chiangMai: { timezone: "Asia/Bangkok", latitude: 18.7883, longitude: 98.9853 },
  ubon: { timezone: "Asia/Bangkok", latitude: 15.2447, longitude: 104.8473 },
  phuket: { timezone: "Asia/Bangkok", latitude: 7.8804, longitude: 98.3923 },
  london: { timezone: "Europe/London", latitude: 51.5074, longitude: -0.1278 },
  newYork: { timezone: "America/New_York", latitude: 40.7128, longitude: -74.006 },
  tokyo: { timezone: "Asia/Tokyo", latitude: 35.6762, longitude: 139.6503 },
} as const;

type CaseSeed = Omit<AccuracyBenchmarkCase, "status" | "independentExpected" | "evidence">;

function unverified(seed: CaseSeed): AccuracyBenchmarkCase {
  return {
    ...seed,
    status: "unverified",
    independentExpected: { ...EMPTY_EXPECTED },
    evidence: { source: null, reference: null, reviewedBy: null, reviewedAt: null },
  };
}

const CIVIL_TIMES = ["00:00", "00:01", "11:59", "12:00", "23:59"] as const;
const THAI_PLACES = ["bangkok", "chiangMai", "ubon", "phuket"] as const;
const EPOCHS = [
  ["1950", "1950-01-01"],
  ["1988", "1988-05-05"],
  ["2000", "2000-02-29"],
  ["2026", "2026-12-31"],
] as const;

const timeMatrix = THAI_PLACES.flatMap((placeKey, placeIndex) =>
  CIVIL_TIMES.map((localTime, timeIndex) => {
    const [epoch, localDate] = EPOCHS[(placeIndex + timeIndex) % EPOCHS.length]!;
    return unverified({
      id: `natal-${placeKey}-${localDate}-${localTime.replace(":", "")}`,
      kind: "natal",
      coverage: ["civil_time", `time_${localTime}`, `epoch_${epoch}`, `place_${placeKey}`],
      input: {
        localDate,
        localTime,
        birthTimeKnown: true,
        ...PLACES[placeKey],
      },
    });
  }),
);

const edgeCases: AccuracyBenchmarkCase[] = [
  ["natal-leap-2000-bangkok", "2000-02-29", "23:59", "bangkok", ["leap_day", "month_boundary"]],
  ["natal-month-end-2026-ubon", "2026-01-31", "23:59", "ubon", ["month_boundary"]],
  ["natal-year-end-1999-phuket", "1999-12-31", "23:59", "phuket", ["year_boundary", "epoch_2000"]],
  ["natal-year-start-2000-phuket", "2000-01-01", "00:00", "phuket", ["year_boundary", "epoch_2000"]],
  ["natal-london-winter-1950", "1950-12-31", "23:59", "london", ["foreign_timezone", "year_boundary", "epoch_1950"]],
  ["natal-london-summer-2026", "2026-06-21", "00:01", "london", ["foreign_timezone", "dst"]],
  ["natal-new-york-winter-1988", "1988-01-01", "12:00", "newYork", ["foreign_timezone", "epoch_1988"]],
  ["natal-new-york-summer-2026", "2026-07-01", "11:59", "newYork", ["foreign_timezone", "dst"]],
  ["natal-tokyo-2000", "2000-02-29", "00:00", "tokyo", ["foreign_timezone", "leap_day", "epoch_2000"]],
] .map(([id, localDate, localTime, placeKey, coverage]) =>
  unverified({
    id: id as string,
    kind: "natal",
    coverage: coverage as string[],
    input: {
      localDate: localDate as string,
      localTime: localTime as string,
      birthTimeKnown: true,
      ...PLACES[placeKey as keyof typeof PLACES],
    },
  }),
);

const sensitivityCases: AccuracyBenchmarkCase[] = [
  ["asc-boundary-candidate-before", "1988-05-05", "00:00"],
  ["asc-boundary-candidate-after", "1988-05-05", "00:01"],
  ["zodiac-boundary-candidate-before", "2026-04-13", "23:59"],
  ["zodiac-boundary-candidate-after", "2026-04-14", "00:00"],
].map(([id, localDate, localTime]) =>
  unverified({
    id: id!,
    kind: "natal",
    coverage: ["boundary_candidate", id!.startsWith("asc") ? "ascendant" : "zodiac"],
    input: { localDate: localDate!, localTime: localTime!, birthTimeKnown: true, ...PLACES.bangkok },
  }),
);

const unknownTimeCases = ["1950-06-15", "1988-05-05", "2000-02-29", "2026-08-04"].map(
  (localDate, index) =>
    unverified({
      id: `unknown-time-${localDate}`,
      kind: "natal",
      coverage: ["unknown_birth_time", `epoch_${EPOCHS[index]![0]}`],
      input: {
        localDate,
        localTime: "12:00",
        birthTimeKnown: false,
        ...PLACES[THAI_PLACES[index]!],
      },
    }),
);

const TRANSIT_SEEDS: ReadonlyArray<
  readonly [string, string, string, keyof typeof PLACES, string]
> = [
  ["transit-bangkok-1950-2026", "1950-01-01", "00:00", "bangkok", "2026-08-04T00:00:00.000Z"],
  ["transit-chiangmai-1988-2000", "1988-05-05", "12:00", "chiangMai", "2000-02-29T12:00:00.000Z"],
  ["transit-ubon-2000-2026", "2000-02-29", "23:59", "ubon", "2026-12-31T23:59:00.000Z"],
  ["transit-phuket-2026-month-edge", "2026-01-31", "23:59", "phuket", "2026-02-01T00:00:00.000Z"],
  ["transit-london-dst", "1988-05-05", "00:01", "london", "2026-06-21T00:00:00.000Z"],
  ["transit-newyork-year-edge", "2000-01-01", "11:59", "newYork", "2026-01-01T00:00:00.000Z"],
  ["transit-tokyo-leap", "2000-02-29", "12:00", "tokyo", "2028-02-29T12:00:00.000Z"],
];

const transitCases = TRANSIT_SEEDS.map(([id, localDate, localTime, placeKey, transitAt]) =>
  unverified({
    id: id!,
    kind: "transit",
    coverage: ["transit", "natal", "multi_epoch"],
    input: {
      localDate: localDate!,
      localTime: localTime!,
      birthTimeKnown: true,
      transitAt: transitAt,
      ...PLACES[placeKey as keyof typeof PLACES],
    },
  }),
);

export const ACCURACY_BENCHMARK_MANIFEST: readonly AccuracyBenchmarkCase[] = Object.freeze([
  ...timeMatrix,
  ...edgeCases,
  ...sensitivityCases,
  ...unknownTimeCases,
  ...transitCases,
]);

export const PROPOSED_ACCEPTANCE_THRESHOLDS = Object.freeze({
  longitudeDegrees: 0.02,
  ascendantDegrees: 0.1,
  utcInstantSeconds: 1,
  requireExactSign: true,
  requireExactRoundedDegreeMinute: true,
  requireExactRetrograde: true,
  requireExactWholeSignHouse: true,
});

/** Remains null until independent evidence is reviewed and explicitly approved. */
export const APPROVED_ACCEPTANCE_THRESHOLDS: typeof PROPOSED_ACCEPTANCE_THRESHOLDS | null = null;