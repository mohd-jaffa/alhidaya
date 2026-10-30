"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { TextInput } from "@/components/ui/text-input";
import { ADMIN_TEXT } from "@/constants/admin-messages";
import { TEXT_LIMITS } from "@/constants/limits";
import { ADMIN_ROUTES } from "@/constants/admin-routes";
import { useApiQuery } from "@/lib/query/useApiQuery";
import { GENERAL_APPLICATIONS } from "@/lib/validation/schemas/applications";

import { applicationsKey } from "../api.client";
import type { ApplicationList, ApplicationListQuery } from "../types";

/**
 * The inbox's job and search (plan §9.5), as a plain form: the jobs that
 * have applications come with the list, read once for both.
 */
export function ApplicationFilters({ query }: { query: ApplicationListQuery }) {
  const { data } = useApiQuery<ApplicationList>(applicationsKey(query));
  const jobs = data?.jobs ?? [];
  return (
    <form
      role="search"
      method="get"
      action={ADMIN_ROUTES.applications}
      className="flex w-full flex-wrap items-end gap-2 lg:w-auto"
    >
      {query.status ? <input type="hidden" name="status" value={query.status} /> : null}
      <div className="w-full sm:w-56">
        <Field label={ADMIN_TEXT.job} hint={ADMIN_TEXT.jobHint} markOptional={false}>
          {/* Drawn again once the jobs arrive, so a job chosen in the address is shown chosen. */}
          <Select key={jobs.length} name="job" defaultValue={query.job ?? ""}>
            <option value="">{ADMIN_TEXT.allJobs}</option>
            <option value={GENERAL_APPLICATIONS}>{ADMIN_TEXT.generalApplications}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grow sm:w-80 sm:grow-0">
        <Field label={ADMIN_TEXT.search} hint={ADMIN_TEXT.searchHint} markOptional={false}>
          <TextInput type="search" name="q" defaultValue={query.q ?? ""} maxLength={TEXT_LIMITS.line} />
        </Field>
      </div>
      <Button type="submit" variant="secondary">
        {ADMIN_TEXT.find}
      </Button>
    </form>
  );
}
