# Function Logic Completeness

Status is intentionally conservative: **real**, **partial**, **demo**, or **missing**. No 100% functional-parity claim is made.

| Capability              | Status            | Producer → persistence → consumer → tests                                                                   | Traceability / remaining work                                                                                     |
| ----------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Birth Chart             | real              | `astrology-engine.server.ts` → `natal_charts` → `useNatalChart.ts` / `/birth-chart` → golden + safety tests | Canonical versioned facts; more independent planet fixtures needed                                                |
| Natal/Transit dual ring | real              | `astro.functions.ts` → ephemeral canonical reading → `CosmicNatalOrrery.tsx` → visual smoke                 | Date selectable; SVG collision layout; KB interpretation remains gated                                            |
| Transits                | partial           | `astro.functions.ts` → none → `useTimeTravel.ts` / `/transits` → provenance consistency                     | Positions real; score rules are legacy heuristics, not fully KB-cited                                             |
| Dashboard               | partial           | `astro.functions.ts` → none → `useHomeReading.ts` → no dedicated acceptance test                            | Real facts; summary scores still legacy heuristic                                                                 |
| Daily                   | partial           | `insights.server.ts` + KB → none → `/daily` → insight tests                                                 | Engine/rule versions present; published citation coverage must expand                                             |
| Calendar                | partial           | `insights.server.ts` + KB → none → `/calendar` → insight tests                                              | Same limits as Daily                                                                                              |
| Compatibility           | partial           | `insights.server.ts` + KB → `compatibility_checks` → `/compat` → insight tests                              | Server-produced; expand independent rule review/citations                                                         |
| AI Astrologer           | demo              | client reading → safe limited chat → `/ai-astrologer` → safety tests                                        | Client-submitted free-text fact sheet must be replaced by server-derived structured facts before production trust |
| Knowledge Base          | real foundation   | versioned KB tables → rule engine → governed reading/admin → governance tests                               | Published rule corpus remains limited                                                                             |
| Guest natal chart       | real temporary    | public validated/rate-limited calculation → session storage only → chart/dashboard → guest smoke            | Never persisted; identity explicitly labelled temporary                                                           |
| Wallet/payment          | blocked for guest | packages read-only → wallet UI → P0.1 regression                                                            | Production mutation remains fail-closed; gateway not connected                                                    |
| Sharing                 | partial           | snapshot server logic → token record → `/r/$token`                                                          | Privacy mode exists in chart; full post-calculation integration test needed                                       |
| LINE Login              | partial           | LIFF + server verification → profile/session → auth provider                                                | Optional during public review; credentials unchanged                                                              |
| Messaging API           | missing           | —                                                                                                           | Deferred; no channel credential substitution                                                                      |

## Canonical consistency

Birth and transit astronomical facts now expose the same `engine`, `calculationVersion`, `ephemerisSource`, `ayanamsaName`, `houseSystem`, and UTC instants. Visual aspect lines remain presentation-only and are not interpreted as authoritative KB facts.

## Highest remaining risks

1. AI chat currently accepts a browser-built fact summary; it must derive structured facts on the server.
2. Legacy transit/dashboard score heuristics need migration to versioned KB rules with citations.
3. Old saved charts are recalculated through the existing version fingerprint path, but schema has legacy provenance columns that need a future additive reconciliation migration.
4. Independent fixtures should cover multiple epochs, planets, nodes and high-latitude ascendants.
