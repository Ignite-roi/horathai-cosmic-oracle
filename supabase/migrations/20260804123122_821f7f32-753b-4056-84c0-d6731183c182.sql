CREATE POLICY "Server only source sections" ON public.source_sections FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Server only ingestion jobs" ON public.ingestion_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Server only ingestion issues" ON public.ingestion_issues FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Server only rule conflicts" ON public.rule_conflicts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Server only knowledge audit" ON public.knowledge_audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);