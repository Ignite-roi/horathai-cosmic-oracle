import { createFileRoute } from "@tanstack/react-router";
import { TransitExperience } from "@/components/transit/TransitExperience";
export const Route = createFileRoute("/dev-transit-preview")({ ssr: false, component: TransitExperience });
