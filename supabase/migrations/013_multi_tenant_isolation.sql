begin;

alter table if exists levels
  add column if not exists company_id uuid null references companies(id) on delete cascade;

alter table if exists catalogs
  add column if not exists company_id uuid null references companies(id) on delete cascade;

create index if not exists idx_levels_company_id on levels(company_id);
create index if not exists idx_catalogs_company_id on catalogs(company_id);

create or replace function public.current_profile_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id
  from public.profiles
  where id = auth.uid()
  limit 1
$$;

create or replace function public.current_profile_employee_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select employee_id
  from public.profiles
  where id = auth.uid()
  limit 1
$$;

create or replace function public.current_profile_is_global()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(can_access_all_companies, false)
  from public.profiles
  where id = auth.uid()
  limit 1
$$;

create or replace function public.same_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_profile_is_global()
    or (
      public.current_profile_company_id() is not null
      and target_company_id = public.current_profile_company_id()
    )
$$;

alter table profiles enable row level security;
alter table companies enable row level security;
alter table locations enable row level security;
alter table levels enable row level security;
alter table departments enable row level security;
alter table positions enable row level security;
alter table catalogs enable row level security;
alter table catalog_values enable row level security;
alter table employees enable row level security;
alter table employee_requests enable row level security;
alter table job_requests enable row level security;
alter table candidates enable row level security;
alter table personnel_actions enable row level security;
alter table vacation_policies enable row level security;
alter table vacation_balances enable row level security;
alter table vacation_requests enable row level security;
alter table vacation_request_steps enable row level security;
alter table vacation_plans enable row level security;
alter table employee_skills enable row level security;
alter table evaluations enable row level security;
alter table evaluation_items enable row level security;
alter table development_plans enable row level security;
alter table development_plan_objectives enable row level security;
alter table development_plan_workflow_steps enable row level security;
alter table talent_readiness enable row level security;
alter table insurance_plans enable row level security;
alter table insurance_dependents enable row level security;
alter table insurance_enrollments enable row level security;
alter table insurance_enrollment_dependents enable row level security;
alter table insurance_movements enable row level security;
alter table occupational_health_cases enable row level security;
alter table occupational_injuries enable row level security;
alter table medical_visits enable row level security;
alter table laboratory_tests enable row level security;
alter table medicine_deliveries enable row level security;
alter table self_service_requests enable row level security;
alter table self_service_request_steps enable row level security;

drop policy if exists "profiles_select_scoped" on profiles;
create policy "profiles_select_scoped"
on profiles for select
to authenticated
using (id = auth.uid() or public.current_profile_is_global());

drop policy if exists "profiles_insert_own_scoped" on profiles;
create policy "profiles_insert_own_scoped"
on profiles for insert
to authenticated
with check (id = auth.uid() or public.current_profile_is_global());

drop policy if exists "profiles_update_scoped" on profiles;
create policy "profiles_update_scoped"
on profiles for update
to authenticated
using (id = auth.uid() or public.current_profile_is_global())
with check (
  id = auth.uid()
  or public.current_profile_is_global()
);

drop policy if exists "companies_select_scoped" on companies;
create policy "companies_select_scoped"
on companies for select
to authenticated
using (public.same_company(id));

drop policy if exists "companies_write_global" on companies;
create policy "companies_write_global"
on companies for all
to authenticated
using (public.current_profile_is_global())
with check (public.current_profile_is_global());

drop policy if exists "locations_scoped" on locations;
create policy "locations_scoped"
on locations for select
to authenticated
using (public.same_company(company_id));

drop policy if exists "locations_write_scoped" on locations;
create policy "locations_write_scoped"
on locations for all
to authenticated
using (public.same_company(company_id))
with check (public.same_company(company_id));

drop policy if exists "levels_scoped" on levels;
create policy "levels_scoped"
on levels for select
to authenticated
using (
  public.current_profile_is_global()
  or company_id is null
  or public.same_company(company_id)
);

drop policy if exists "levels_write_global" on levels;
create policy "levels_write_global"
on levels for all
to authenticated
using (public.current_profile_is_global())
with check (public.current_profile_is_global());

drop policy if exists "departments_scoped" on departments;
create policy "departments_scoped"
on departments for select
to authenticated
using (public.same_company(company_id));

drop policy if exists "departments_write_scoped" on departments;
create policy "departments_write_scoped"
on departments for all
to authenticated
using (public.same_company(company_id))
with check (public.same_company(company_id));

drop policy if exists "positions_scoped" on positions;
create policy "positions_scoped"
on positions for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from departments d
    where d.id = positions.department_id
      and d.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "positions_write_scoped" on positions;
create policy "positions_write_scoped"
on positions for all
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from departments d
    where d.id = positions.department_id
      and d.company_id = public.current_profile_company_id()
  )
)
with check (
  public.current_profile_is_global()
  or exists (
    select 1
    from departments d
    where d.id = positions.department_id
      and d.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "catalogs_scoped" on catalogs;
create policy "catalogs_scoped"
on catalogs for select
to authenticated
using (
  public.current_profile_is_global()
  or company_id is null
  or public.same_company(company_id)
);

drop policy if exists "catalogs_write_global" on catalogs;
create policy "catalogs_write_global"
on catalogs for all
to authenticated
using (public.current_profile_is_global())
with check (public.current_profile_is_global());

drop policy if exists "catalog_values_scoped" on catalog_values;
create policy "catalog_values_scoped"
on catalog_values for select
to authenticated
using (
  exists (
    select 1
    from catalogs c
    where c.id = catalog_values.catalog_id
      and (
        public.current_profile_is_global()
        or c.company_id is null
        or c.company_id = public.current_profile_company_id()
      )
  )
);

drop policy if exists "catalog_values_write_global" on catalog_values;
create policy "catalog_values_write_global"
on catalog_values for all
to authenticated
using (
  exists (
    select 1
    from catalogs c
    where c.id = catalog_values.catalog_id
      and public.current_profile_is_global()
  )
)
with check (
  exists (
    select 1
    from catalogs c
    where c.id = catalog_values.catalog_id
      and public.current_profile_is_global()
  )
);

drop policy if exists "employees_scoped" on employees;
create policy "employees_scoped"
on employees for select
to authenticated
using (public.same_company(company_id));

drop policy if exists "employees_write_scoped" on employees;
create policy "employees_write_scoped"
on employees for all
to authenticated
using (public.same_company(company_id))
with check (public.same_company(company_id));

drop policy if exists "employee_requests_scoped" on employee_requests;
create policy "employee_requests_scoped"
on employee_requests for select
to authenticated
using (public.same_company(company_id));

drop policy if exists "employee_requests_write_scoped" on employee_requests;
create policy "employee_requests_write_scoped"
on employee_requests for all
to authenticated
using (public.same_company(company_id))
with check (public.same_company(company_id));

drop policy if exists "job_requests_scoped" on job_requests;
create policy "job_requests_scoped"
on job_requests for select
to authenticated
using (public.same_company(company_id));

drop policy if exists "job_requests_write_scoped" on job_requests;
create policy "job_requests_write_scoped"
on job_requests for all
to authenticated
using (public.same_company(company_id))
with check (public.same_company(company_id));

drop policy if exists "candidates_scoped" on candidates;
create policy "candidates_scoped"
on candidates for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from job_requests jr
    where jr.id = candidates.job_request_id
      and jr.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "candidates_write_scoped" on candidates;
create policy "candidates_write_scoped"
on candidates for all
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from job_requests jr
    where jr.id = candidates.job_request_id
      and jr.company_id = public.current_profile_company_id()
  )
)
with check (
  public.current_profile_is_global()
  or exists (
    select 1
    from job_requests jr
    where jr.id = candidates.job_request_id
      and jr.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "personnel_actions_scoped" on personnel_actions;
create policy "personnel_actions_scoped"
on personnel_actions for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from employees e
    where e.id = personnel_actions.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "personnel_actions_write_scoped" on personnel_actions;
create policy "personnel_actions_write_scoped"
on personnel_actions for all
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from employees e
    where e.id = personnel_actions.employee_id
      and e.company_id = public.current_profile_company_id()
  )
)
with check (
  public.current_profile_is_global()
  or exists (
    select 1
    from employees e
    where e.id = personnel_actions.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "vacation_policies_scoped" on vacation_policies;
create policy "vacation_policies_scoped"
on vacation_policies for select
to authenticated
using (
  public.current_profile_is_global()
  or company_id is null
  or company_id = public.current_profile_company_id()
);

drop policy if exists "vacation_policies_write_scoped" on vacation_policies;
create policy "vacation_policies_write_scoped"
on vacation_policies for all
to authenticated
using (
  public.current_profile_is_global()
  or company_id = public.current_profile_company_id()
)
with check (
  public.current_profile_is_global()
  or company_id = public.current_profile_company_id()
);

drop policy if exists "vacation_balances_scoped" on vacation_balances;
create policy "vacation_balances_scoped"
on vacation_balances for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from employees e
    where e.id = vacation_balances.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "vacation_requests_scoped" on vacation_requests;
create policy "vacation_requests_scoped"
on vacation_requests for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from employees e
    where e.id = vacation_requests.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "vacation_requests_write_scoped" on vacation_requests;
create policy "vacation_requests_write_scoped"
on vacation_requests for all
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from employees e
    where e.id = vacation_requests.employee_id
      and e.company_id = public.current_profile_company_id()
  )
)
with check (
  public.current_profile_is_global()
  or exists (
    select 1
    from employees e
    where e.id = vacation_requests.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "vacation_request_steps_scoped" on vacation_request_steps;
create policy "vacation_request_steps_scoped"
on vacation_request_steps for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from vacation_requests vr
    join employees e on e.id = vr.employee_id
    where vr.id = vacation_request_steps.vacation_request_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "vacation_plans_scoped" on vacation_plans;
create policy "vacation_plans_scoped"
on vacation_plans for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from employees e
    where e.id = vacation_plans.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "employee_skills_scoped" on employee_skills;
create policy "employee_skills_scoped"
on employee_skills for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1 from employees e
    where e.id = employee_skills.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "evaluations_scoped" on evaluations;
create policy "evaluations_scoped"
on evaluations for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1 from employees e
    where e.id = evaluations.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "evaluation_items_scoped" on evaluation_items;
create policy "evaluation_items_scoped"
on evaluation_items for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from evaluations ev
    join employees e on e.id = ev.employee_id
    where ev.id = evaluation_items.evaluation_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "development_plans_scoped" on development_plans;
create policy "development_plans_scoped"
on development_plans for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1 from employees e
    where e.id = development_plans.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "development_plan_objectives_scoped" on development_plan_objectives;
create policy "development_plan_objectives_scoped"
on development_plan_objectives for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from development_plans dp
    join employees e on e.id = dp.employee_id
    where dp.id = development_plan_objectives.plan_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "development_plan_workflow_steps_scoped" on development_plan_workflow_steps;
create policy "development_plan_workflow_steps_scoped"
on development_plan_workflow_steps for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from development_plans dp
    join employees e on e.id = dp.employee_id
    where dp.id = development_plan_workflow_steps.plan_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "talent_readiness_scoped" on talent_readiness;
create policy "talent_readiness_scoped"
on talent_readiness for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1 from employees e
    where e.id = talent_readiness.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "insurance_plans_scoped" on insurance_plans;
create policy "insurance_plans_scoped"
on insurance_plans for select
to authenticated
using (
  public.current_profile_is_global()
  or company_id is null
  or company_id = public.current_profile_company_id()
);

drop policy if exists "insurance_dependents_scoped" on insurance_dependents;
create policy "insurance_dependents_scoped"
on insurance_dependents for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1 from employees e
    where e.id = insurance_dependents.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "insurance_enrollments_scoped" on insurance_enrollments;
create policy "insurance_enrollments_scoped"
on insurance_enrollments for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1 from employees e
    where e.id = insurance_enrollments.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "insurance_enrollment_dependents_scoped" on insurance_enrollment_dependents;
create policy "insurance_enrollment_dependents_scoped"
on insurance_enrollment_dependents for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from insurance_enrollments ie
    join employees e on e.id = ie.employee_id
    where ie.id = insurance_enrollment_dependents.enrollment_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "insurance_movements_scoped" on insurance_movements;
create policy "insurance_movements_scoped"
on insurance_movements for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1 from employees e
    where e.id = insurance_movements.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "occupational_health_cases_scoped" on occupational_health_cases;
create policy "occupational_health_cases_scoped"
on occupational_health_cases for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1 from employees e
    where e.id = occupational_health_cases.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "occupational_injuries_scoped" on occupational_injuries;
create policy "occupational_injuries_scoped"
on occupational_injuries for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1 from employees e
    where e.id = occupational_injuries.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "medical_visits_scoped" on medical_visits;
create policy "medical_visits_scoped"
on medical_visits for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1 from employees e
    where e.id = medical_visits.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "laboratory_tests_scoped" on laboratory_tests;
create policy "laboratory_tests_scoped"
on laboratory_tests for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1 from employees e
    where e.id = laboratory_tests.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "medicine_deliveries_scoped" on medicine_deliveries;
create policy "medicine_deliveries_scoped"
on medicine_deliveries for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1 from employees e
    where e.id = medicine_deliveries.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "self_service_requests_scoped" on self_service_requests;
create policy "self_service_requests_scoped"
on self_service_requests for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1 from employees e
    where e.id = self_service_requests.employee_id
      and e.company_id = public.current_profile_company_id()
  )
);

drop policy if exists "self_service_request_steps_scoped" on self_service_request_steps;
create policy "self_service_request_steps_scoped"
on self_service_request_steps for select
to authenticated
using (
  public.current_profile_is_global()
  or exists (
    select 1
    from self_service_requests sr
    join employees e on e.id = sr.employee_id
    where sr.id = self_service_request_steps.request_id
      and e.company_id = public.current_profile_company_id()
  )
);

commit;
