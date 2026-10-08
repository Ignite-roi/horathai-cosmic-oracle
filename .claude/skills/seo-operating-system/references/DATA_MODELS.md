# Recommended SEO OS data models

Adapt names/types to the site's stack.

## business_facts
- id
- fact_key
- category
- value_json
- status: VERIFIED | NEEDS_CONFIRMATION | CONTRADICTORY | UNSAFE_TO_CLAIM
- evidence_source
- evidence_url_or_ref
- effective_from / effective_to
- last_verified_at / verified_by
- notes

## seo_pages
- id
- canonical_url
- route
- page_type
- language
- indexable
- owner_cluster_id
- published_at
- last_changed_at
- last_build_sha
- seo_state

## keyword_clusters
- id
- primary_keyword
- intent
- language
- supporting_terms_json
- buyer_intent_score
- business_value_score
- notes

## keyword_ownership
- cluster_id
- owner_page_id
- ownership_type
- protected
- evidence
- assigned_at

## seo_opportunity_snapshots
- id
- snapshot_date
- query
- page
- clicks / impressions / ctr / position
- prior_clicks / prior_impressions / prior_position
- score
- recommended_action
- confidence
- rationale_json

## content_items
- id
- slug
- canonical_url
- page_type
- state
- primary_cluster_id
- facts_version
- created_at / updated_at / approved_at / published_at

## content_quality_results
- content_id
- checked_at
- hard_failures_json
- soft_warnings_json
- factual_score
- ownership_score
- intent_score
- completeness_score
- technical_score
- passed

## seo_change_log
- id
- timestamp
- url
- component
- before_json
- after_json
- reason
- evidence_json
- actor
- release_sha

## seo_index_status
- url
- checked_at
- coverage
- indexing_state
- google_canonical
- declared_canonical
- last_crawl
- page_fetch_state

## seo_conversion_attribution
- id
- session_or_click_id
- landing_page
- keyword_cluster
- source / medium / campaign
- calculator_started / calculator_completed
- calculated_value
- cta_clicked
- lead_id / quote_id / purchase_id
- revenue
- timestamps_json

## media_evidence
- id
- asset_url
- service_product
- material
- size
- industry
- use_case
- indoor_outdoor
- privacy_status
- permission_status
- alt_candidate
- caption_candidate
- captured_at

## faq_candidates
- id
- normalized_question
- source
- frequency
- related_cluster_id
- related_page_id
- factual_answer_status
- disposition

## case_studies
- id
- title
- business_type
- problem
- service_product
- material_spec
- dimensions
- factual_outcome
- evidence_assets_json
- permission_status
- published_url
