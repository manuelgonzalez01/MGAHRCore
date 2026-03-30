-- MGAHRCore multi-tenant verification suite
-- Ejecuta estas consultas desde SQL Editor despues de autenticar usuarios
-- o como referencia de comprobacion estructural/funcional.

-- 1. Confirmacion estructural
select column_name
from information_schema.columns
where table_name = 'catalogs'
  and column_name = 'company_id';

select column_name
from information_schema.columns
where table_name = 'levels'
  and column_name = 'company_id';

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'companies',
    'locations',
    'levels',
    'departments',
    'positions',
    'catalogs',
    'catalog_values',
    'employees',
    'employee_requests',
    'job_requests'
  )
order by tablename;

-- 2. Confirmacion del contexto actual
select
  auth.uid() as auth_user_id,
  public.current_profile_company_id() as current_company_id,
  public.current_profile_employee_id() as current_employee_id,
  public.current_profile_is_global() as is_global;

select
  id,
  email,
  role_code,
  company_id,
  employee_id,
  status,
  can_access_all_companies
from profiles
where id = auth.uid();

-- 3. Visibilidad efectiva para el usuario actual
select id, trade_name, legal_name, status
from companies
order by trade_name;

select id, employee_number, full_name, company_id, status
from employees
order by full_name;

select id, request_number, title, company_id, workflow_status
from job_requests
order by created_at desc;

select id, request_number, requested_name, company_id, workflow_status
from employee_requests
order by created_at desc;

-- 4. Conteos visibles por tenant actual
select 'companies' as source, count(*) as visible_rows from companies
union all
select 'locations', count(*) from locations
union all
select 'departments', count(*) from departments
union all
select 'positions', count(*) from positions
union all
select 'employees', count(*) from employees
union all
select 'employee_requests', count(*) from employee_requests
union all
select 'job_requests', count(*) from job_requests
order by source;

-- 5. Consulta comparativa para un super admin
-- Debe devolver multiples companias si el perfil es global.
select
  company_id,
  count(*) as employees_count
from employees
group by company_id
order by company_id;

-- 6. Reglas esperadas de negocio
-- Usuario normal:
-- - companies debe devolver solo su compania
-- - employees debe devolver solo empleados de su compania
-- - job_requests / employee_requests idem
-- Super admin:
-- - puede ver multiples companias

-- 7. Checklist manual de smoke test entre Empresa A y Empresa B
-- Paso A:
-- - inicia sesion con usuario de Empresa A
-- - ejecuta las consultas de visibilidad efectiva
-- - verifica que no aparezca company_id de Empresa B
--
-- Paso B:
-- - inicia sesion con usuario de Empresa B
-- - ejecuta las mismas consultas
-- - verifica que no aparezca company_id de Empresa A
--
-- Paso C:
-- - inicia sesion con super_admin
-- - ejecuta las mismas consultas
-- - verifica que si aparezcan ambas companias

